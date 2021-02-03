const { whereNull } = require("../data/db-config.js");
const db = require("../data/db-config.js");
const likeRegex = /LIKE::(\d+)/i
const replyRegex = /REPLY::(\d+)/i
const boardRegex = /BOARD::( *)(\w+)/i
const zaddrRegex = /zs[a-z0-9]{76}/i;
const splitMemoRegex = /-\d+$/

module.exports = {
    getAll,
    getPage,
    remove,
    add,
    getCount,
    findById,
    getPinned,
    getDaysLikes,
    getLeaderboard,
    getLikeCount,
    getPayablePosts,
    getPostsWithZaddr,
    setReplyCount,
    getMonthlyZaddrs,
    getPostIds,
    getSubBoard,
    updatePost,
    getBoardNames,
    getUsersPosts
}

async function getUsersPosts(username) {
    const user = await db("users").where("username", "ilike", username).first()
    return db("board_posts").where("reply_zaddr", "=", user.zaddr).orderBy("id", "desc")
}

function updatePost(id,changes ) {
    return db("board_posts").where({id}).update(changes).returning("*")
}

function getSubBoard(board_name) {
    if (!board_name) return
    board_name = board_name.toLowerCase()
    return db("board_posts").where({board_name})
}



function getMonthlyZaddrs() {
    const oneMonthAgo = Date.now() - (1000 * 60 * 60 * 24 * 30)
    return db("board_posts").whereNotNull("reply_zaddr").andWhere("datetime", ">", oneMonthAgo).distinct("reply_zaddr")
}

function getCount() {
    return db('board_posts').whereNull("reply_to_post").count("id as CNT")
}

function getPostsWithZaddr() {
    return db("board_posts").whereNotNull("reply_zaddr")
}

async function findById(id) {
    const replies = await db("board_posts").where({"reply_to_post" : id}).orderBy("datetime", "desc")
    const post = await db('board_posts').leftJoin("users", "board_posts.reply_zaddr", "users.zaddr")
        .where({"board_posts.id": id}).select("board_posts.*", "users.username")
        .first()
    post.replies = replies
    return post
}

async function getDaysLikes() {
    const aDayAgo = Date.now() - (1000 * 60 * 60 * 25)
    const likes = await db("board_posts").whereNotNull("reply_zaddr").andWhere("datetime", ">", aDayAgo).andWhere('memo', 'like', 'LIKE::%')
    const hash = {}
    likes.forEach(like => {
        let zaddr = like.reply_zaddr
        if (hash[zaddr]) {
            hash[zaddr] += 1
        } else {
            hash[zaddr] = 1
        }
    })

    return hash

}

async function getPayablePosts() {
    // const posts = await db("board_posts").whereRaw("likes > 0 AND reply_zaddr IS NOT NULL")
    return db.raw('select SUM(likes) as likes, reply_zaddr from board_posts where reply_zaddr is not null and likes > 0 group by reply_zaddr');
    // return {posts}

}

async function setReplyCount(id, reply_count) {
    return db("board_posts").where({id}).update({reply_count}).returning("*")
}

function getAll() {
    return db('board_posts').returning("*")
}

function getPostIds() {
    return db("board_posts").select("id", "likes").orderBy("likes")
}

function getBoardNames() {
    return db("board_posts").distinct("board_name")
}

function getPinned() {
    return db('board_posts').where("datetime", ">", 1607810569).andWhere('amount', ">=", '10000000').orderBy("amount", "desc").first()
}

function getPage(page) {
    return db('board_posts').leftJoin("users", "board_posts.reply_zaddr", "users.zaddr").whereNull('board_posts.reply_to_post').orderBy('board_posts.id', 'desc').limit(25).offset(25 * (page-1)).select("board_posts.*", "users.username")
}

function getLeaderboard() {
    return db("board_posts").leftJoin("users", "board_posts.reply_zaddr", "users.zaddr").orderBy("likes", "desc").limit(10).select("board_posts.*", "users.username");
}

function getLikeCount() {
    return db("board_posts").sum('likes');
}


async function add(post) {

    try {
        const decodedMemo = Buffer.from(post.memo, "base64").toString("utf8")
        if (likeRegex.test(decodedMemo)) {
            post.memo = decodedMemo.match(likeRegex)[0]
        } 

        // const decodedBoardTag = Buffer.from(post.memo.split(" ")[0], "base64").toString("utf8")
        // if (boardRegex.test(decodedBoardTag)) {
        //     post.memo = post.memo.replace(post.memo.split(" ")[0], decodedBoardTag)
        // }
        
        const decodedReplyTag = Buffer.from(post.memo.split(" ")[0], "base64").toString("utf8")
        if (replyRegex.test(decodedReplyTag)) {
            post.memo = post.memo.replace(post.memo.split(" ")[0], decodedReplyTag)
        }

        
        
    } catch (err) {
        console.log(err)
    }
    if (post.memo.includes("drive.google")) return {error: "Google Drive Link Detected"}

    if (post.memo.match(likeRegex)) {
        const like = post.memo.match(likeRegex)[0]
        const postId = like.split("::")[1].split(" ")[0]
        const likedPost = await db('board_posts').where({id: postId}).first()
        await db('board_posts').where({id: postId}).update({likes: likedPost.likes + 1})
        return [{liked_post_id: Number(postId)}]
    } else {
        if (post.memo.match(zaddrRegex)) {
            const replyZaddr = post.memo.match(zaddrRegex)[0];
            post.reply_zaddr = replyZaddr;
        }
        if (post.memo.match(replyRegex)) {
            const replyId = post.memo.match(replyRegex)[0].split("::")[1]
            const repliedPost = await db('board_posts').where({id: replyId}).first()
            if (repliedPost) {
                await db('board_posts').where({id: replyId}).update({reply_count: repliedPost.reply_count + 1})
            }
            post.reply_to_post = replyId;
        }

        if (post.memo.match(boardRegex)) {
            const boardName = post.memo.match(boardRegex)[0].split("::")[1].toLowerCase().replace(/[\\\/ ]/g, "")

            if (boardName) post.board_name = boardName;
        }

        
        if (post.txid) {
            let replyNum = post.txid.match(splitMemoRegex)
            if (replyNum) {
                const originalTxid = post.txid.replace(splitMemoRegex, "-1") 
                const replyingToPost = await db("board_posts").where({txid: originalTxid}).first()
                if (replyingToPost) {
                    post.reply_to_post = replyingToPost.id
                }
            }

        }

        return db('board_posts').insert(post).returning("*")
    }
}

function remove(id) {
    return db('board_posts')
    .where({ id })
    .first()
    .del();
  }


