const router = require('express').Router();
const Board = require('./board-model');
const restricted = require("../auth/restricted-middleware");


router.get("/", (req,res) => {
    Board.getAll().then(posts =>
    res.status(201).json(posts))
})

router.post('/',  (req, res) => {
    let post = req.body;

    Board.add(post)
      .then(saved => {
        const newPost = saved[0]
        res.status(201).json(newPost)
      })
      .catch(err => {
        res.status(500).json(err)
        console.log(err, 'err')
      })
  });


router.delete('/:id', restricted, (req, res) => {
    if (req.decodedJwt.id === 2) {
        Users.remove(req.params.id)
        .then(user => {
            if (!user) {
                res.status(404).json({message: "No post exists by that ID!"})
            } else {
                res.status(200).json({message: "board post deleted"})
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json(err)
        })
    } else {
        res.status(500).json({bro: "cmon now"})
    }
})

module.exports = router;