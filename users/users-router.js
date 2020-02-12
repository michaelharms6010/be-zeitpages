const router = require('express').Router();
const Users = require('./users-model');
const restricted = require("../auth/restricted-middleware");
const validator = require('password-validator')

router.get("/", (req,res) => {
    Users.getAll().then(users =>
    res.status(201).json(users))
})

router.get("/me", restricted, (req,res) => {
    Users.findById(req.decodedJwt.id).then(user => {
        delete user.password;
        res.status(201).json(user)
    })
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
    var schema = new validator();

    schema
        .is().min(78)                                    
        .is().max(78)                                  
        let firstTwo = "";      
        if (zaddr) {
            firstTwo = zaddr.split("").slice(0,2).join("");
        }
        console.log(firstTwo)
    if(zaddr){
        if (firstTwo!=="zs" || !schema.validate(zaddr)){
            res.status(500).json({
            message: 'Your zaddr is invalid.'
            })
            return;
        }
    }
    
    if (req.body.password) {
        delete req.body.password
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
    if (req.decodedJwt.id === 9) {
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
  

module.exports = router;