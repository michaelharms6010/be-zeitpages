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
        console.log("PollEntry", pollEntry)
        const poll = JSON.parse(pollEntry.memo.replace("POLL::", ""))
        console.log("poll", poll)
        const results = {}
        results.q = poll.q
        for (let i = 1; i < 5; i++)

            let option = poll[`o${i}`];
            
            if (option) {
                results[option] = votes.filter(v => v.option == i).length
            }
        
        
        return results
    } catch (e) {
        console.log(e)
        return
    }

}