const db = require("../data/db-config")


module.exports = {
    getPollVotes,
    getPollResults
}

function getPollVotes(poll_id) {
    return db("votes").where({poll_id})
}

async function getPollResults(poll_id) {
    try {

        const votes = await getPollVotes(poll_id)
        const pollEntry = await db("board_posts").where({id: poll_id}).first()
        const poll = JSON.parse(pollEntry.memo.replace("POLL::", ""))
        const results = {}
        results.q = poll.q
        [1,2,3,4].forEach(n => {
            let option = poll[`o${n}`];
            if (option) {
                results[option] = votes.filter(v => v.option == n).length
            }
        })
        
        return results
    } catch (e) {
        console.log(e)
        return
    }

}