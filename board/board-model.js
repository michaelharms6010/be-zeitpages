const db = require("../data/db-config.js");


module.exports = {
    getAll,
    remove,
    add
}


function getAll() {
    return db('board_posts').returning("*")
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


