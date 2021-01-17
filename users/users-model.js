const db = require("../data/db-config.js");


module.exports = {
    getAll,
    findById,
    remove,
    updateUser,
    findBy,
    getPage,
    search,
    getCount
}
const SEARCHABLE_COLUMNS = ["zaddr", "username", "description", "twitter"]
// rudeboy stylee
// for tomorrow .whereRaw('LOWER(column) LIKE ?', '%'+value.toLowerCase()+'%');
const getSearchPerms = (query, searchString, colNames) => {
     colNames.forEach(colName => {
        // query = query.orWhere(db.raw(`LOWER(description) LIKE ?'`, '%'+searchString.toLowerCase()+'%'));
        // query = query.orWhere(db.raw(`LOWER(description) LIKE ?'`, searchString.toLowerCase()+'%'));
        // query = query.orWhere(db.raw(`LOWER(description) LIKE ?'`, '%'+searchString.toLowerCase()));
        // query = query.orWhere(db.raw(`LOWER(description) = ?'`, searchString.toLowerCase()));
        query = query.orWhere(colName, "LIKE", `%${searchString}%`)
        query = query.orWhere(colName, "LIKE", `${searchString}%`)
        query = query.orWhere(colName, "LIKE", `%${searchString}`)
        query = query.orWhere(colName, "=", `%${searchString}`)
     })
     return query
}

async function getPage(page) {
    const count = await db('users').whereNotNull("zaddr").count("id as CNT")
    const users = await db('users').whereNotNull("zaddr").orderBy('id', 'desc').limit(25).offset(25 * (page-1))
    return {users, count: +count[0].CNT}
}

function getCount(page) {
    return db('users').whereNotNull("zaddr").count("id as CNT")
}

// const SEARCHABLE_COLUMNS = ["zaddr", "username", "description", "twitter"]

async function search(searchString, require_proof, require_twitter){
    let query = await db("users").whereNotNull("zaddr")
    searchString = searchString.toLowerCase()

    let results = await query


    results = results.filter(user => (user.zaddr && user.zaddr.toLowerCase().includes(searchString)) || 
                                    (user.username && user.username.toLowerCase().includes(searchString)) ||   
                                    (user.description && user.description.toLowerCase().includes(searchString)) ||
                                    (user.twitter && user.twitter.toLowerCase().includes(searchString)))    


    if (require_proof) {
        results = results.filter(user => user.proofposturl)
    } if (require_twitter) {
        results = results.filter(user => user.twitter)
    }

    return results
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