const db = require("./data/db-config")

module.exports = async () => {
    try {
        const { Feed }  = require('feed')
        var fs      = require('fs');
        var dirPath = __dirname + "/rssfeed.xml";

    let feed = new Feed({

        title: 'ZECpages',
      
        description: 'Zcash Encrypted Memo Board',
      
        author: {
      
          name: 'A Zcash User',
      
          link: 'http://zecpages.com/'
      
        }
      
      })

      db("board_posts").leftJoin("users", "users.zaddr", "board_posts.reply_zaddr").then(posts => {
          posts.forEach(post => {
            feed.addItem({

  
                link:"https://zecpages.com/z/post/" + post.id,
  
                post: post.memo,
  
                author: [{
  
                  name: post.username || 'A Zcash User',
                  link: `https://zecpages.com/${post.username}`
                  
  
                }],
  
                date: new Date(post.datetime),
  
              });




            })

            var rssdoc = feed.rss2();

            fs.writeFile(dirPath, rssdoc, function(err) {
                if(err) { 
                    return console.log(err); 
                } else {
                    console.log("I think we wrote a file\n\n\n\n")
                }
            });
            console.log(__dirname)
            return "Done"
      })
    } catch (err) {
        console.log(err)
    }


}