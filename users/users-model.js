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
const SEARCHABLE_COLUMNS = ["zaddr", "username", "description", "twitter"]
const getSearchPerms = (query, colNames) => {
     colNames.forEach(colName => {
        query = query.orwhere(colName, "LIKE", `%${str}%`)
        query = query.orWhere(colName, "LIKE", `${str}%`)
        query = query.orWhere(colName, "LIKE", `%${str}`)
        query = query.orWhere(colName, "=", `%${str}`)
     })
     return query
}

function getPage(page) {
    return db('users').whereNotNull("zaddr").orderBy('id', 'desc').limit(25).offset(25 * (page-1))
}

function search(str){
    const query = db("users")
    query = getSearchPerms(query, SEARCHABLE_COLUMNS)
    return query
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