const db = require("../data/db-config.js");
const likeRegex = /LIKE::(\d+)/i

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
    const like = post.memo.match(likeRegex)[0]
    if (like) {
        const postId = like.split("::")[1]
        const likedPost = await db('board_posts').where({id: postId}).first()
        return db('board_posts').where({id: postId}).update({likes: likedPost.likes + 1})
    } else {
        return db('board_posts').insert(post).returning("*")
    }
}

function remove(id) {
    return db('board_posts')
    .where({ id })
    .first()
    .del();
  }


