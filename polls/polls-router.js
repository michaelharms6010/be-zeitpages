const router = require("express").Router()
const Poll = require("./polls-model")

router.get("/:poll_id", (req,res) => {
    const {poll_id} = req.params;
    Poll.getPollResults(poll_id)
        .then(results => res.status(200).json({results}))
        .catch(err => res.status(500).json({success: false, err}))
})

module.exports = router;