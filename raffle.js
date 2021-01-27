// raffles remaining like swag

const axios = require("axios");
const {exec} = require("child_process");
const { send } = require("process");
var fs = require('fs');
var filename='/home/ubuntu/sender/paidlikes.txt';
let zaddrs;


let likes, zaddrs;
axios.get("https://be.zecpages.com/board/likecount")
    .then(r => {
        likes = r.likes[0].sum
        axios.get("https://be.zecpages.com/board/monthlyzaddrs")
        .then(r => {
            zaddrs = r.zaddrs;
            var winner = zaddrs[Math.floor(Math.random() * zaddrs.length)];
            exec(`echo "${JSON.stringify(likes)}, ${zaddr}, ${new Date().toISOString()}" >> /home/ubuntu/sender/rafflewinner.txt`, (err, stdout, stderr) => {})
            let winnings = likes * 50000;
            payWinner(winner, winnings)
        
        }).catch(err => console.log(err))
    }).catch(err => console.log(err))


function payWinner(zaddr, likes) {
    if (Object.keys(zaddr_likes).length === 0) return

    const sendParams = []

    sendParams.push({
        address: zaddr,
        amount: (50000 * +likes),
        memo: `Monthly Raffle Winner - ${likes} Zecpages Like(s) - Thank you for posting!`
    })
    exec(`echo "${JSON.stringify(JSON.stringify(newlikes))}" >> /home/ubuntu/sender/rafflewinner.txt`, (err, stdout, stderr) => {})
        // exec(`/home/ubuntu/memo-monitor-lite/src/zecwallet-cli --server=https://lightwalletd.zecpages.com:443 send ${JSON.stringify(JSON.stringify(sendParams))}`,(err, stdout, stderr) => {

        //     if (err) console.log(err)       
        //     console.log(stdout)
        //     console.log(err)
        //     console.log(stderr)

        // })
}
