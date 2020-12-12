const db = require("../data/db-config.js");


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
    return db('board_posts').where("datetime", ">", 1607810569).orderBy("amount", "desc").first()
}

function getPage(page) {
    return db('board_posts').orderBy('id', 'desc').limit(25).offset(25 * (page-1)).returning("*")
}

async function add(post) {
    return db('board_posts').insert(post).returning("*")

}

function remove(id) {
    return db('board_posts')
    .where({ id })
    .first()
    .del();
  }


