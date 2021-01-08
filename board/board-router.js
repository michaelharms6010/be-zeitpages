const router = require('express').Router();
const Board = require('./board-model');
const restricted = require("../auth/restricted-middleware");
var Pusher = require('pusher');
var pusher = new Pusher({
    appId: process.env.PUSHER_APPID,
    key: process.env.PUSHER_KEY,
    secret: process.env.PUSHER_SECRET,
    cluster: 'us2',
    encrypted: true
});

router.get("/", (req,res) => {
    Board.getAll().then(posts =>
    res.status(200).json(posts))
    .catch(err => res.status(500).json(err))
})

router.get("/count", (req,res) => {
    Board.getCount().then(count =>
        res.status(200).json(count[0].CNT))
    .catch(err => res.status(500).json(err))
})

router.get("/pinned", (req,res) => {
    Board.getPinned().then(pinned =>
        res.status(200).json(pinned))
    .catch(err => res.status(500).json(err))
})

router.get("/dailylikes", (req,res) => {
    Board.getDaysLikes().then(likes =>
        res.status(200).json(likes)
    )
    .catch(err => res.status(500).json(err))
})

router.get("/:id", (req,res) => {
    const id = Number(req.params.id);
    Board.getPage(id).then(posts =>
        res.status(200).json(posts)
    )
    .catch(err => res.status(500).json(err))
})



router.get("/post/:id", (req, res) => {
    const id = req.params.id;
    Board.findById(id).then(post => {
        res.status(200).json(post)
    })
    .catch(err => console.log(err.response))
})

router.post('/', restricted, (req, res) => {
    if (req.decodedJwt.id === 2) {
        let post = req.body;

        Board.add(post)
        .then(saved => {
            const newPost = saved[0]
            pusher.trigger('board', 'new-post', {
                "message": "new post"
            });
            res.status(201).json(newPost)
        })
        .catch(err => {
            res.status(500).json(err)
            console.log(err, 'err')
        })
    } else {
        res.status(500).json({bro: "cmon now", id: req.decodedJwt.id})
    }
  });


router.delete('/:id', restricted, (req, res) => {
    if (req.decodedJwt.id === 2) {
        Board.remove(req.params.id)
        .then(post => {
            if (!post) {
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