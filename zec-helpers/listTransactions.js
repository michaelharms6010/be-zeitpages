const { exec } = require("child_process");

module.exports = () => 
    exec("./zecwallet-cli list", (err, stdout, stderr) => {
      if(err) {
        console.log(err)
      } else {
        try {
          const transactions = JSON.parse(stdout)
          // determine which, if any transactions are new
          // add new posts to database
          return transactions
        } catch (e) { console.log("Error parsing stdout: ", e) }
      }
    })
  