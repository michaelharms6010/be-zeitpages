const db = require('../data/db-config')

module.exports = {
    add,
    getAll,
    findById,
    findBy,
    remove,
    findByUsername
    
}

async function add(user) {
    const existingUser = await db('users').where("username", "ilike", user.username).first()
    if (existingUser) {
        return {error: "User already exists."}
    }
    return db('users').insert(user).returning("*")

}

function findByUsername(username) {
    return db("users").select("password", 'id', 'username', "zaddr", "proofposturl", "website", "twitter", "email", "description", "viewkey").where("username", "ilike", username).first()
}

function findBy(filter) {
    return db('users').where(filter).first()
}

function getAll() {
    return db('users').select('id', 'username')
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