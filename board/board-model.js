const db = require("../data/db-config.js");


module.exports = {
    getAll,
    getPage,
    remove,
    add
}


function getAll() {
    return db('board_posts').returning("*")
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


