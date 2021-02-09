const Twitter = require('twitter');
require('dotenv').config()
const twitterCreds = {
  consumer_key: process.env.TWITTER_CONSUMER_KEY,
  consumer_secret: process.env.TWITTER_CONSUMER_SECRET,
  access_token_key: process.env.ACCESS_TOKEN_KEY,
  access_token_secret: process.env.ACCESS_TOKEN_SECRET,
}
console.log(twitterCreds)
const client = new Twitter(twitterCreds);


var params = {status: 'nodejs here nice to meet ya'};
client.post('statuses/update', params, function(error, tweets, response) {
    console.log(error)
  if (!error) {
    console.log(tweets);
  }
});