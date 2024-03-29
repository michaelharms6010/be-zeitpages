// TODO:
// By default should return where board_zaddr is null (main board)
// Optionally return for a specified board (uses viewkey link)
// get board/key/{viewkey}/page does gets for the specific board
// gate get by id based on view key
// gate sub boards to only work for the main board

const { whereNull } = require("../data/db-config.js");
const db = require("../data/db-config.js");
const Users = require("../users/users-model")
const likeRegex = /LIKE::(\d+)/i
const replyRegex = /REPLY::(\d+)/i
const subscribeRegex = /SUBSCRIBE::(\d+)::(\d+)/i
const filterRegex = /FILTER::(\w_+)::(\w_+)/i
const boardRegex = /BOARD::( *)(\w+)/i
const zaddrRegex = /zs[a-z0-9]{76}/i;
const uaddrRegex = /u1\w{211}/
const oaddrRegex = /^u1\w{104}$/
const subscribeZaddrRegex = /SUBSCRIBE::(\d+)::zs[a-z0-9]{76}/i
const voteRegex = /^VOTE::/i
const pollRegex = /^POLL::/i
const splitMemoRegex = /-\d+$/
const urlRegex = /[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&\\=]*)/ig
const axios = require("axios")
const key= process.env.PUBLISHING_KEY;
const ZECPAGES_ID = 769;

var Twitter = require('twitter');
const twitterCreds = {
    consumer_key: process.env.TWITTER_CONSUMER_KEY,
    consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
    access_token_key: process.env.ACCESS_TOKEN_KEY,
    access_token_secret: process.env.ACCESS_TOKEN_SECRET,
  }
var twitterClient = new Twitter(twitterCreds);


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
    getDecayedPinned,
    searchPosts,
    getBoardList,
    getAllTxids
}

function getAllTxids() {
    return db('board_posts').select("txid")
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

function searchPosts(str) {
    return db("board_posts").where("memo", "ilike", `%${str}%`).limit(50).orderBy("id", "desc")
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

function getBoardList() {
    return db("board_posts").whereNotNull("board_name").count("id as post_count").groupBy("board_name").orderBy("post_count", "desc").select("board_name")
}


function getPinned() {
    return db('board_posts').where("datetime", ">", 1607810569).andWhere('amount', ">=", '10000000').orderBy("amount", "desc").first()
}

async function getDecayedPinned() {
    const posts = await db('board_posts').leftJoin("users", "board_posts.reply_zaddr", "users.zaddr").where("datetime", ">", 1607810569).andWhere('amount', ">=", '10000000').orderBy("amount", "desc").select("board_posts.*", "users.username")
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

        const decodedVote = Buffer.from(post.memo, "base64").toString("utf8")
        if (voteRegex.test(decodedVote)) {
            post.memo = decodedVote
        } 
        const decodedPoll = Buffer.from(post.memo, "base64").toString("utf8")
        if (pollRegex.test(decodedPoll)) {
            post.memo = decodedPoll
        } 


        
        
    } catch (err) {
        console.log(err)
    }
    if (post.memo.includes("drive.google")) return {error: "Google Drive Link Detected"}

    if (post.memo.replace(/ /g, "").match(subscribeZaddrRegex)) {
        post.memo = post.memo.replace(/ /g, "")
        const oneMonthInMs = (1000 * 60 * 60 * 24 * 30);
        const subscribedTo = post.memo.match(subscribeZaddrRegex)[0].split("::")[1]
        let subscribedFrom = post.memo.match(subscribeZaddrRegex)[0].split("::")[2]
        if (subscribedTo.trim() === subscribedFrom.trim() ) {
            subscribedFrom = 2
        }
        if (+post.amount < 5000000) {
            return  [{subscription: `Insufficient Funds`}]
        }
        const purchasedTime = Math.round((+post.amount / 6000000) * oneMonthInMs);
        const cutoffDateFromToday = new Date(Date.now() + purchasedTime).toISOString();
        const existingSubscription = await db("subscriptions").where({subscriber_zaddr: subscribedFrom, subscribed_to_id: subscribedTo}).first();
        try {

            if (!existingSubscription) {
                await db("subscriptions").insert({amount: post.amount, subscriber_zaddr: subscribedFrom, subscribed_to_id: subscribedTo, cutoff_date: cutoffDateFromToday}).returning("*")
            } else {
                const existingCutoff = new Date(existingSubscription.cutoff_date)
                if (existingCutoff.getTime() > Date.now()) {
                    const newCutoff = new Date(existingCutoff.getTime() + purchasedTime)
                    await db("subscriptions")
                    .where({subscriber_zaddr: subscribedFrom, subscribed_to_id: subscribedTo})
                    .update({cutoff_date: newCutoff, amount: +existingSubscription.amount + +post.amount }).returning("*")
                } else {
                    await db("subscriptions")
                    .where({subscriber_zaddr: subscribedFrom, subscribed_to_id: subscribedTo})
                    .update({cutoff_date: cutoffDateFromToday, amount: +existingSubscription.amount + +post.amount }).returning("*")
                }
            }
        } catch(err) {
            console.log(err)

        }
        return [{subscription: `${subscribedTo}::${subscribedFrom}`}]
    } else if (post.memo.replace(/ /g, "").match(subscribeRegex)) {
        post.memo = post.memo.replace(/ /g, "")
        const oneMonthInMs = (1000 * 60 * 60 * 24 * 30);
        const subscribedTo = post.memo.match(subscribeRegex)[0].split("::")[1]
        let subscribedFrom = post.memo.match(subscribeRegex)[0].split("::")[2]
        if (subscribedTo.trim() === subscribedFrom.trim() ) {
            subscribedFrom = 2
        }
        if (+post.amount < 5000000) {
            return  [{subscription: `Insufficient Funds`}]
        }
        const purchasedTime = Math.round((+post.amount / 6000000) * oneMonthInMs);
        const cutoffDateFromToday = new Date(Date.now() + purchasedTime).toISOString();
        const existingSubscription = await db("subscriptions").where({subscriber_id: subscribedFrom, subscribed_to_id: subscribedTo}).first();
        try {

            if (!existingSubscription) {
                await db("subscriptions").insert({amount: post.amount, subscriber_id: subscribedFrom, subscribed_to_id: subscribedTo, cutoff_date: cutoffDateFromToday}).returning("*")
            } else {
                const existingCutoff = new Date(existingSubscription.cutoff_date)
                if (existingCutoff.getTime() > Date.now()) {
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

    if (post.memo.replace(/ /g, "").match(voteRegex)) {
        const [meta, txid, option] = post.memo.split("::").map(s => s.replace(/ /g, ""))
        const poll = await db("board_posts").where({txid}).first()
        if (poll) {

            const newVote = {
                poll_id: poll.id,
                poll_txid: txid,
                option
            }
            await db("votes").insert(newVote)
            
            return [newVote]
        } else {
            console.log(post.memo)
            return [{message: 'vote failed.'}]
        }

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

    if (post.memo.replace(/ /g, "").match(likeRegex)) {
        post.memo = post.memo.replace(/ /g, "");
        const like = post.memo.match(likeRegex)[0]
        const postId = like.split("::")[1].split(" ")[0]
        const likedPost = await db('board_posts').where({id: postId}).first()
        await db('board_posts').where({id: postId}).update({amount: likedPost.amount + post.amount, likes: likedPost.likes + 1})
        return [{new_amount: likedPost.amount + post.amount, liked_post_id: Number(postId)}]
    } else {
        if (post.memo.match(zaddrRegex) || post.memo.match(uaddrRegex) || post.memo.match(oaddrRegex)) {
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

        if (post.memo.match(pollRegex)) {
            post.ispoll=true
            try {
                JSON.parse(post.memo.replace(/poll::/ig, ""))
            } catch(e) {
                return ["Invalid poll"]
            }
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
            const zpSubs = await Users.getSubscribers(ZECPAGES_ID)
            if (zpSubs.length) {
                
                post.memo = post.memo.replace(/\$/, "USD")
                const zpZaddrs = [ ...new Set( zpSubs.filter(sub => sub).filter(sub => sub.subscriber_zaddr || sub.zaddr).map(sub => sub.subscriber_zaddr || sub.zaddr) ) ];
                    axios.post("http://3.139.195.111:6677/", {memo: post.memo, zaddrs: zpZaddrs, key})
                        .then(r => {
                            console.log(r)
                        })
                        .catch(err => {console.log(err)})
            }
        } catch (err) {
            console.log(err)
        }

        
        try {
            if (post.amount >= 1000000) {
                let newPostText = []
                let postTextForTweet = ""
                let tooLong = false
                // post.memo = post.memo.replace(urlRegex, "<Link>")
                let highlightedString = post.amount >= 10000000 ? "🚨🔥💎🛡💎🔥🚨\n" : ""
                post.memo = post.memo.replace(/board::([\w_]+)( *)/i, "").replace(/reply::(\d+)( *)/i, "").trim()
                post.memo.split(" ").forEach(word => {
                    if (word.length + postTextForTweet.length < 210 && !tooLong) {
                        postTextForTweet += word + " "
                        newPostText.push(word)
                    } else {
                        tooLong = true
                    }
                })
                newPostText = newPostText.filter(word => word);
                newPostText[0] = newPostText[0].replace(/ /g, "")
                console.log("first char: ", newPostText[0].charCodeAt(0))
                if (newPostText[0].charCodeAt(1)) console.log("second char: ", newPostText[0].charCodeAt(1))
                if (newPostText[0].charCodeAt(2)) console.log("third char: ", newPostText[0].charCodeAt(2))
                postTextForTweet = `${highlightedString}${newPostText.join(" ").trim()}${tooLong? "..." : ""}`
                const postPreview = postTextForTweet + `\n\nzecpages.com/z/post/${newPost[0].id} #Zcash $ZEC`
                twitterClient.post('statuses/update', {status: postPreview }, function(error, tweets, response) {
                    console.log(error)
                if (!error) {
                    console.log("sent tweet")
                    // console.log(tweets);
                }
                });
            }
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


