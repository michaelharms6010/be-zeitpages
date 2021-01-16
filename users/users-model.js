const db = require("../data/db-config.js");


module.exports = {
    getAll,
    findById,
    remove,
    updateUser,
    findBy,
    getPage,
    search
}

function getPage(page) {
    return db('users').whereNotNull("zaddr").orderBy('id', 'desc').limit(25).offset(25 * (page-1))
}

function search(str){
    str = str.toLowerCase()
    return db("users").where("LOWER(zaddr)", "LIKE", `%${str}%`).orWhere("LOWER(username)", "LIKE", `%${str}%`).orWhere("LOWER(description)", "LIKE", `%${str}%`).orWhere("LOWER(twitter)", "LIKE", `%${str}%`)
}


function findBy(filter) {
    return db("users").select('id', 'username', "zaddr", "proofposturl", "website", "twitter", "email", "description", "viewkey").where(filter).first()
}
function getAll() {
    return db('users').select('id', 'username', "zaddr", "proofposturl", "website", "twitter", "email", "description", "viewkey")
}

function findById(id) {
    return db('users')
        .where({id})
        .first()
}

function remove(id) {
    return db('users')
    .where({ id })
    .first()
    .del();
  }


  function updateUser(id, changes) {
    return db('users')
      .where({id})
      .update(changes, '*').returning("*");
  }