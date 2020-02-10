const router = require('express').Router();
const Users = require('./users-model');
const restricted = require("../auth/restricted-middleware");
const validator = require('password-validator')

router.get("/", (req,res) => {
    Users.getAll().then(users =>
    res.status(201).json(users))
})

router.get("/:id", (req,res) => {
    Users.findById(req.params.id).then(user => {
        delete user.password;
        res.status(201).json(user)
    })
})

router.put('/', restricted, (req,res) => {
    const {zaddr} = req.body;
    const id = req.decodedJwt.id;
    console.log(id)
    console.log(zaddr)

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

router.delete('/:id', restricted, (req, res) => {
    // if (Number(req.params.id) !== Number(req.decodedJwt.id)) {
    //     res.status(401).json({message: 'You cannot access another user'})
    // } 
    // else {
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
    // }
})
  

module.exports = router;