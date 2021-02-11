const { whereNull } = require("../data/db-config.js");
const db = require("../data/db-config.js");
const likeRegex = /LIKE::(\d+)/i
const replyRegex = /REPLY::(\d+)/i
const subscribeRegex = /SUBSCRIBE::(\d+)::(\d+)/i
const filterRegex = /FILTER::(\w_+)::(\w_+)/i
const boardRegex = /BOARD::( *)(\w+)/i
const zaddrRegex = /zs[a-z0-9]{76}/i;
const splitMemoRegex = /-\d+$/

var Twitter = require('twitter');
const twitterCreds = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  }
var client = new Twitter(twitterCreds);

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
    getUsersPosts,
    getDecayedPinned
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
    const replies = await db("board_posts")
                            .where({"reply_to_post" : id})
                            .leftJoin("users", "board_posts.reply_zaddr", "users.zaddr")
                            .select("board_posts.*", "users.username")
                            .orderBy("datetime", "desc")
                            
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

async function getDecayedPinned() {
    const posts = await db('board_posts').where("datetime", ">", 1607810569).andWhere('amount', ">=", '10000000').orderBy("amount", "desc")
    const postsWithAdjustedPrice = posts.map( post => { return {...post, decayed_amount: Math.round(post.amount - ( Date.now() - +post.datetime ) / 200) } } )
    return postsWithAdjustedPrice.sort((a,b) => b.decayed_amount - a.decayed_amount )[0]
}

function getPage(page) {
    return db('board_posts').leftJoin("users", "board_posts.reply_zaddr", "users.zaddr").orderBy('board_posts.id', 'desc').limit(25).offset(25 * (page-1)).select("board_posts.*", "users.username")
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

    if (post.memo.match(subscribeRegex)) {
        const oneMonthInMs = (1000 * 60 * 60 * 24 * 30);
        const subscribedTo = post.memo.match(subscribeRegex)[0].split("::")[1]
        const subscribedFrom = post.memo.match(subscribeRegex)[0].split("::")[2]
        if (+post.amount < 5000000) {
            return  [{subscription: `Insufficient Funds`}]
        }
        const purchasedTime = Math.round((+post.amount / 6000000) * oneMonthInMs);
        const cutoffDateFromToday = new Date(Date.now() + purchasedTime).toISOString();
        const existingSubscription = await db("subscriptions").where({subscriber_id: subscribedFrom, subscribed_to_id: subscribedTo}).first();
        try {

            // Daily Job On New Box:
            // Load db of paid subscription info (amountpaid)
            // New endpoint - get all subscription info grouped by subscribed_to, sum amount
            // Pay any users with new subscribers Math.floor(5/6 * (amount - amountpaid))


            if (!existingSubscription) {
                await db("subscriptions").insert({amount: post.amount, subscriber_id: subscribedFrom, subscribed_to_id: subscribedTo, cutoff_date: cutoffDateFromToday}).returning("*")
            } else {
                const existingCutoff = new Date(existingSubscription.cutoff_date)
                if (existingCutoff.getTime() > new Date().now()) {
                    const newCutoff = new Date(existingCutoff.getTime() + purchasedTime)
                    await db("subscriptions")
                    .where({subscriber_id: subscribedFrom, subscribed_to_id: subscribedTo})
                    .update({cutoff_date: newCutoff, amount: +existingSubscription.amount + +post.amount }).returning("*")
                } else {
                    await db("subscriptions")
                    .where({subscriber_id: subscribedFrom, subscribed_to_id: subscribedTo})
                    .update({cutoff_date: cutoffDateFromToday, amount: +existingSubscription.amount + +post.amount }).returning("*")
                }
            }
        } catch(err) {
            console.log(err)

        }
        return [{subscription: `${subscribedTo}::${subscribedFrom}`}]
    }

    if (post.memo.match(filterRegex)) {
        const filteredFrom = post.memo.match(filterRegex)[0].split("::")[1]
        const filteredTo = post.memo.match(filterRegex)[0].split("::")[2]
        try {
            await db('word_filters').insert({ filtered_from: filteredFrom, filtered_to: filteredTo, date_created: Date.now() }).returning("*")
        } catch(err) {
            console.log(err)
        }
        return [{filter: `${filteredFrom}::${filteredTo}`}]
    }

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
        

        const newPost = await db('board_posts').insert(post).returning("*")
        
        try {
            let newPostText = []
            let postTextForTweet = ""
            let tooLong = false
            post.memo.split(" ").forEach(word => {
                if (word.length + postTextForTweet.length < 240) {
                    postTextForTweet += word + " "
                    newPostText.push(word)
                } else {
                    tooLong = true
                }
            })
            postTextForTweet = `"${newPostText.join(" ").trim()}${tooLong? "..." : ""}"`
            const postPreview = postTextForTweet.replace(/board::([\w_]+)/i, "").replace(/reply::(\d+)/i, "").trim() + `\n\nzecpages.com/z/post/${newPost[0].id}`
            client.post('statuses/update', {status: postPreview }, function(error, tweets, response) {
                console.log(error)
              if (!error) {
                console.log(tweets);
              }
            });
        } catch (err) {
            console.log(err)
        }
        
        return newPost
    }
}

function remove(id) {
    return db('board_posts')
    .where({ id })
    .first()
    .del();
  }


