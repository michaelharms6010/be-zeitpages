const {exec} = require("child_process")
const PUBLISHING_KEY = process.env.PUBLISHING_KEY

server.post("/", (req,res) => {
    const {memo, zaddrs, key} = req.body;
    if (!PUBLISHING_KEY || key !== PUBLISHING_KEY) {
        console.log("bad key")

        res.status(401).json({message: "nah"})
        return
    }
    const sendParams = []
    zaddrs.forEach(zaddr => {
        sendParams.push({
            address: zaddr,
            amount: 1,
            memo: `${memo}`
        })
    })
    sendZec(sendParams);

    res.status(200).json({message: "on it guvna"})

})

function sendZec(sendParams, count=0) {
    exec(`/home/ubuntu/memo-monitor-lite/src/zecwallet-cli --server=https://lightwalletd.zecpages.com:443 send ${JSON.stringify(JSON.stringify(sendParams))}`, (err, stdout, stderr) => {
        if (err) console.log(err)
        if (count === 24 ) return
        console.log(stdout)
        if (stdout.includes("txid")) {
            exec(`echo "${JSON.stringify(JSON.stringify(sendParams))}" >> /home/ubuntu/sender/senttosubs.txt`, (err, stdout, stderr) => {})
            exec(`echo "${stdout}" >> /home/ubuntu/sender/published.txt`, (err, stdout, stderr) => {})
        } else {
       //    exec(`echo "${stdout}" >> /home/ubuntu/sender/publishfailed.txt`, (err, stdout, stderr) => {})
        }
        if ( (stdout && stdout.includes("Error")) || (err && err.includes("Error")) || (stderr && stderr.includes("Error")) ) {
          // queue failed transaction
          setTimeout(_ => sendZec(sendParams, count + 1) , (1000 * 60 * 5))
          exec(`date >> /home/ubuntu/sender/failedsend.txt`, (err, stdout, stderr) => {})
          exec(`echo "${JSON.stringify(JSON.stringify(sendParams))}" >> /home/ubuntu/sender/failedsend.txt`, (err, stdout, stderr) => {})
        }

        console.log(err)
        console.log(stderr)

    })
}