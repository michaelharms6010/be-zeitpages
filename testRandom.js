const axios = require("axios")

const zaddrs = ['zsdfjdskla', 'zsdfjksa', 'zsdfsafdsa']

axios.get("https://api.zcha.in/v2/mainnet/network")
.then(r => {
    console.log(r.data.blockHash)
    const lastTwo = r.data.blockHash.slice(-2)
    const rawVal = parseInt(lastTwo,16)
    console.log(rawVal % zaddrs.length)
})
.catch(err => console.log(err))



