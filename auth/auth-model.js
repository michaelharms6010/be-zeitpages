const db = require('../data/db-config')

module.exports = {
    add,
    getAll,
    findById,
    findBy,
    remove
    
}

async function add(user) {
    const existingUser = db('users').where("username", "ilike", user.username).first()
    if (existingUser) {
        return {error: "User already exists."}
    }
    return db('users').insert(user).returning("*")

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