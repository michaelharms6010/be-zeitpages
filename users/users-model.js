const db = require("../data/db-config.js");


module.exports = {
    getAll,
    findById,
    remove,
    updateUser,
    findBy,
    getPage,
    search,
    getCount,
    getUsernames,
    exportAll,
    getReferralsLikes,
    getSubcriptionInfo,
    getSubscribers,
    saveArticle,
    getSubscriptions,
    checkIfCanPublish
}

function saveArticle(memo, author_id) {
    return db("published_content").insert({memo, author_id}).returning("*")
    
}

async function checkIfCanPublish(author_id) {
    const newestPost = await db("published_content").where({author_id}).orderBy("date_created", "desc").first()
    const fourHoursInMs = (1000 * 60 * 60 * 4)
    if (newestPost && (Date.now() - new Date(newestPost.date_created).getTime()) < fourHoursInMs) {
        return false
    } else {
        return true
    }
}


function getSubcriptionInfo() {
    return db("subscriptions").sum("amount as amount").groupBy("subscribed_to").select("*")
}

function getSubscriptions(subscriber_id) {
    return db("subscriptions").where({subscriber_id}).join("users", "subscriptions.subscriber_id", "users.id").select("users.username", "subscriptions.amount", "subscriptions.cutoff_date", "users.zaddr")
}

function getSubscribers(subscribed_to_id) {
    return db("subscriptions").where({subscribed_to_id}).join("users", "subscriptions.subscriber_id", "users.id").where("subscriptions.cutoff_date", ">", new Date().toISOString() ).select("users.username", "subscriptions.amount", "subscriptions.cutoff_date", "users.zaddr")
}

const SEARCHABLE_COLUMNS = ["username", "description", "twitter"]
// rudeboy stylee
// for tomorrow .whereRaw('LOWER(column) LIKE ?', '%'+value.toLowerCase()+'%');
async function getReferralsLikes(userId) {
    const user = await db("users").where({id: userId}).first()
    console.log(user)
    const usersReferred = await db("users").where("referrer", "ilike", 'luisxbt')
    return usersReferred
    // if (usersReferred.length) {
    //     const referrals = await db("users").where("referrer", "ilike", 'luisxbt').join("board_posts", "board_posts.reply_zaddr", "users.zaddr").sum("board_posts.likes").groupBy("users.username")
    //     return referrals
    // } else {
    //     return {message: "You don't have any referrals yet."}
    // }


}
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

async function exportAll() {
    const users = await db("users")
    const posts = await db("board_posts")
    return {users, posts}
}

async function getPage(page) {
    const count = await db('users').whereNotNull("zaddr").count("id as CNT")
    const users = await db('users').whereNotNull("zaddr").orderBy('id', 'desc').limit(25).offset(25 * (page-1))
    return {users, count: +count[0].CNT}
}

function getCount(page) {
    return db('users').whereNotNull("zaddr").count("id as CNT")
}

function getUsernames() {
    return db('users').whereNotNull("zaddr").select("username")
}


async function search(searchString, require_proof, require_twitter){
    let query = db("users")
    
    query = query.where("zaddr", "=", searchString)
    SEARCHABLE_COLUMNS.forEach(colName => {
        query = query.orWhere(colName, 'ilike', `%${searchString}%`)
        query = query.orWhere(colName, 'ilike', `%${searchString}`)
        query = query.orWhere(colName, 'ilike', `${searchString}%`)
        query = query.orWhere(colName, 'ilike', `${searchString}`)
    })

    let results = await query


    // results = results.filter(user => (user.zaddr && user.zaddr.toLowerCase().includes(searchString)) || 
    //                                 (user.username && user.username.toLowerCase().includes(searchString)) ||   
    //                                 (user.description && user.description.toLowerCase().includes(searchString)) ||
    //                                 (user.twitter && user.twitter.toLowerCase().includes(searchString)))    


    if (require_proof) {
        results = results.filter(user => user.proofposturl)
    } if (require_twitter) {
        results = results.filter(user => user.twitter)
    }

    return results.filter(user => user.zaddr)
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