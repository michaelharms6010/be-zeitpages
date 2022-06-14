const router = require('express').Router();
const Users = require('./users-model');
const restricted = require("../auth/restricted-middleware");
const validator = require('password-validator');
const axios = require('axios');
const zaddrRegex = /^zs[a-z0-9]{76}$/;
const uaddrRegex = /u1\w{211}/
const ADMIN_IDS = [2]
const db = require("../data/db-config")


router.get("/", (req,res) => {
    Users.getAll().then(users =>
    res.status(201).json(users))
})

router.get("/page/:page", (req,res) => {
    Users.getPage(+req.params.page).then(users =>
    res.status(200).json(users))
    .catch(err => res.status(500).json({err}))
})

router.get("/count", (req,res) => {
    Users.getCount().then(count =>
    res.status(200).json({count: count[0].CNT}))
    .catch(err => res.status(500).json({err}))
})

router.get("/zaddr/:zaddr", (req, res) => {
    const {zaddr} = req.params
    Users.findBy({zaddr})
    .then(r => res.status(200).json(r))
    .catch(err => res.status(500).json({err}))
})


router.get("/getsubscriptiontotals", restricted, (req, res) => {

    if (ADMIN_IDS.includes(req.decodedJwt.id)) {
        Users.getUserSubscriptionTotals()
        .then(r => res.status(200).json(r))
        .catch(err => res.status(500).json({err}))
    } else {
        res.status(500).json({bro: "cmon now"})
    }
    

})

router.get("/getsubscriptions", restricted, (req, res) => {
    
    Users.getSubscriptions(req.decodedJwt.id)
    .then(r => res.status(200).json(r))
    .catch(err => res.status(500).json({err}))
})

router.get("/getsubs", restricted, (req, res) => {
    
    Users.getSubscribers(req.decodedJwt.id)
    .then(r => res.status(200).json(r))
    .catch(err => res.status(500).json({err}))
})

router.get("/allpublished", restricted, (req, res) => {
    if (ADMIN_IDS.includes(req.decodedJwt.id)) {
        Users.getAllPublished()
        .then(r => res.status(200).json(r))
        .catch(err => res.status(500).json({err}))
    } else {
        res.status(500).json({bro: "cmon now"})
    }
})


router.post("/publish", restricted, async (req, res) => {
    let {memo} = req.body;
    if (!memo) {
        res.status(500).json({error: "you need to provide a memo"})
        return
    }
    memo = memo.replace(/\$/g, "USD")
    const author_id = req.decodedJwt.id;
    const key= process.env.PUBLISHING_KEY;
    const canPublish = await Users.checkIfCanPublish(author_id)
    if (!canPublish) {
        
        res.status(200).json({message: "You can publish to your subscribers once every four hours."})
        return
    }

    Users.getSubscribers(author_id)
        .then(subscribers => {

            let zaddrs = subscribers.filter(sub => sub).filter(sub => sub.zaddr || sub.subscriber_zaddr ).map(sub => sub.subscriber_zaddr || sub.zaddr);
            if (zaddrs.length) {
                Users.findById(author_id).then(user => { 
                    zaddrs.push(user.zaddr)
                    zaddrs = [ ...new Set(zaddrs) ]
                    Users.saveArticle(memo, author_id).then(r => {
                        axios.post("http://3.139.195.111:6677/", {memo, zaddrs, key})
                        .then(r => {
                            console.log(r)
                            res.status(200).json({message: "Publishing..."})
                        })
                        .catch(err => {console.log(err) ; res.status(500).json({err})})
                    }).catch(err => console.log(err))
                }).catch(err => console.log(err))
            }
        })
        .catch(err => res.status(500).json(err))
})

router.get("/getsubinfo", (req, res) => {
    Users.getSubcriptionInfo()
        .then(r => res.status(200).json(r))
        .catch(err => res.status(500).json(err))
})

router.get("/me", restricted, (req,res) => {
    Users.findById(req.decodedJwt.id).then(user => {
        delete user.password;
        res.status(201).json(user)
    })
})

router.get("/lastarticle", restricted, (req,res) => {
    Users.getLastArticle(req.decodedJwt.id).then(article =>
    res.status(200).json({article}))
    .catch(err => res.status(500).json({err}))
})

router.get("/myreferrals", restricted, (req,res) => {
    Users.getReferralsLikes(req.decodedJwt.id).then(referrals => {
        res.status(201).json(referrals)
    })
})

router.get("/getusernames", (req,res) => {
    Users.getUsernames().then(user => {
        delete user.password;
        res.status(201).json({usernames: user.map(u => u.username)})
    })
})

router.get('/exportdb', restricted, (req, res) => {
    if (ADMIN_IDS.includes(req.decodedJwt.id)) {
        Users.exportAll()
        .then(user => {
                res.status(200).json({user})
        })
        .catch(err => {
            console.log(err)
            res.status(500).json(err)
        })
    } else {
        res.status(500).json({bro: "cmon now"})
    }
})

router.get("/allsubscriptions", restricted, (req,res) => {
    if (ADMIN_IDS.includes(req.decodedJwt.id)) {
        db("subscriptions")
        .then(subs => res.status(200).json({subs}))
        .catch(err => res.status(500).json({err}))

    } else {
        res.status(401).json({bruh: "bruh"})
    }
})


router.get(/^\/(.+).json$/, (req, res) => {
    const username = req.params[0];
    Users.findByUsername(username)
    .then(r => res.status(200).json(r))
    .catch(err => res.status(500).json(err))
})

router.get(/^\/(\d+)/, (req, res) => {
    const id = req.params[0];
    Users.findById(id)
    .then(r => res.status(200).json(r))
    .catch(err => res.status(500).json(err))
})

router.get(/^\/(.+)/, (req, res) => {
    const username = req.params[0];
    Users.findByUsername(username)
    .then(r => res.status(200).json(r))
    .catch(err => res.status(500).json(err))
})

router.post("/search", (req, res) => {
    const {search, require_proof, require_twitter} = req.body;

    Users.search(search, require_proof, require_twitter)
    .then(r => res.status(200).json(r))
    .catch(err => res.status(500).json(err))
})

router.put('/', restricted, (req,res) => {
    let {zaddr, twitter, website} = req.body;
    const id = req.decodedJwt.id;
    if (website) {
        if (!website.includes("https://") && !website.includes("http://")) {
            website = `https://${website}`
        } 
    }
    if (twitter){
        req.body.twitter = twitter.replace("https://", "").replace("www.", "").replace("twitter.com/", "").replace("http://", "").replace("@", "")
    }

    if(zaddr){
        if (!zaddrRegex.test(zaddr) && !uaddrRegex.test(zaddr)){
            res.status(400).json({
            message: 'Your zaddr is invalid.'
            })
            return;
        }
    }
    
    if (req.body.password) {
        delete req.body.password;
    }
    if (req.body.id) {
        delete req.body.id;
    }
    if (req.body.referrer) {
        delete req.body.referrer;
    }
    if (req.body.board_cutoff_date) {
        delete req.body.board_cutoff_date;
    }
    Users.updateUser(id, req.body)
    .then( _ => Users.findById(id)).then(user => {
        delete user.password;
        res.status(200).json(user);
    })
    .catch(err => {
        res.status(500).json({message: 'Unable to update', error: err})
    })}

)

router.delete('/', restricted, (req, res) => {

        Users.remove(req.decodedJwt.id)
        .then(user => {
            if (!user) {
                res.status(404).json({message: "No user exists by that ID!"})
            } else {
                res.status(200).json({message: "deleted"})
            }
        })
        .catch(err => {
            console.log(err)
            res.status(500).json(err)
        })

})





router.delete('/:id', restricted, (req, res) => {
    if (ADMIN_IDS.includes(req.decodedJwt.id)) {
        Users.remove(req.params.id)
        .then(user => {
            if (!user) {
                res.status(404).json({message: "No user exists by that ID!"})
            } else {
                res.status(200).json({message: "deleted"})
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

router.put('/:id', restricted, (req,res) => {
    if (ADMIN_IDS.includes(req.decodedJwt.id)) {
        
        const id = req.params.id;
        
        Users.updateUser(id, req.body)
        .then( _ => Users.findById(id)).then(user => {
            delete user.password;
            res.status(200).json(user);
        })
        .catch(err => {
            res.status(500).json({message: 'Unable to update', error: err})
        })
    } else {
        res.json({message: "cmon now"})
    }
})
  

module.exports = router;