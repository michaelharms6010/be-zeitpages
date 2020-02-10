const db = require("../data/db-config.js");


module.exports = {
    getAll,
    findById,
    remove,
    updateUser
}


function getAll() {
    return db('users').select('id', 'username', "zaddr", "proofposturl", "website", "twitter", "email")
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