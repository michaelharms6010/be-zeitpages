const axios = require("axios");
const {exec} = require("child_process");
const { send } = require("process");
var fs = require('fs');
var filename='./paidlikes.txt';
let zaddrs;

fs.readFile(filename, 'utf8', function(err, data) {
        if (err) return err;
        console.log('OK: ' + filename)
        let paidlikes = data.total_likes
        console.log(data)

        axios.get("https://be.zecpages.com/board/payableposts")
            .then(r => {
                let newlikes = r.data.total_likes;
                let payments = {}
                Object.keys(newlikes).forEach(zaddr => {
                    var difference;
                    if (!paidlikes[zaddr]) {
                        difference = newlikes[zaddr]
                    } else {
                        difference = newlikes[zaddr] - paidlikes[zaddr]
                    }
                    if (difference > 0) payments[zaddr] = difference;
                })
                console.log(payments)
                console.log(zaddrs)
            })
            .catch(err => console.log(err))

});