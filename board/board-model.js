const db = require("../data/db-config.js");
const likeRegex = /LIKE::(\d+)/i
const replyRegex = /REPLY::(\d+)/i
const zaddrRegex = /^zs[a-z0-9]{76}$/i;

module.exports = {
    getAll,
    getPage,
    remove,
    add,
    getCount,
    findById,
    getPinned
}

function getCount() {
    return db('board_posts').count("id as CNT")
}

function findById(id) {
    return db('board_posts')
        .where({id})
        .first()
}

function getAll() {
    return db('board_posts').returning("*")
}

function getPinned() {
    return db('board_posts').where("datetime", ">", 1607810569).andWhere('amount', ">=", '10000000').orderBy("amount", "desc").first()
}

function getPage(page) {
    return db('board_posts').orderBy('id', 'desc').limit(25).offset(25 * (page-1)).returning("*")
}

async function add(post) {
    if (post.memo.match(likeRegex)) {
        const like = post.memo.match(likeRegex)[0]
        const postId = like.split("::")[1].split(" ")[0]
        const likedPost = await db('board_posts').where({id: postId}).first()
        return db('board_posts').where({id: postId}).update({likes: likedPost.likes + 1})
    } else {
        if (post.memo.match(zaddrRegex)) {
            const replyZaddr = post.memo.match(zaddrRegex)[0];
            post.reply_zaddr = replyZaddr;
        }
        if (post.memo.match(replyRegex)) {
            const replyId = post.memo.match(replyRegex)[0].split("::")[1]
            post.reply_to_post = replyId;
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


