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
// rudeboy stylee
// for tomorrow .whereRaw('LOWER(column) LIKE ?', '%'+value.toLowerCase()+'%');
const getSearchPerms = (query, searchString, colNames) => {
     colNames.forEach(colName => {
        query = query.whereRaw(`LOWER(${colname}) LIKE ?'`, '%'+value.toLowerCase()+'%');
        query = query.whereRaw(`LOWER(${colname}) LIKE ?'`, value.toLowerCase()+'%');
        query = query.whereRaw(`LOWER(${colname}) LIKE ?'`, '%'+value.toLowerCase());
        query = query.whereRaw(`LOWER(${colname}) = ?'`, value.toLowerCase());
        // query = query.orWhere(colName, "LIKE", `%${searchString}%`)
        // query = query.orWhere(colName, "LIKE", `${searchString}%`)
        // query = query.orWhere(colName, "LIKE", `%${searchString}`)
        // query = query.orWhere(colName, "=", `%${searchString}`)
     })
     return query
}

function getPage(page) {
    return db('users').whereNotNull("zaddr").orderBy('id', 'desc').limit(25).offset(25 * (page-1))
}

function search(searchString){
    let query = db("users")
    query = getSearchPerms(query, searchString, SEARCHABLE_COLUMNS)
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