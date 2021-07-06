const { exec } = require("child_process");

// One argument is an object - each key is a zaddr, its value is how many likes it received today.
module.exports = (zaddr_likes) => {
    if (Object.keys(zaddr_likes).length === 0) return
    const zaddrs = Object.keys(zaddr_likes)
    const sendParams = []
    zaddrs.forEach(zaddr => {
        const likecount = zaddr_likes[zaddr]
        sendParams.push({
            address: zaddr,
            amount: (50000 * likecount),
            memo: `${likecount} Zecpages Like(s) - Thank you for posting!`
        })
    })
    exec(`./zecwallet-cli send ${JSON.stringify(JSON.stringify(sendParams))}`, (err, stdout, stderr) => {
        if (err) {
            console.log(err)
            return
        }
        console.log(stdout)
    })
}