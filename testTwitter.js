const Twitter = require('twitter');

const client = new Twitter({
  consumer_key: 'hwjMGMiDqfP9GOq6LjzXcQt7h',
  consumer_secret: 'P9OZfzr2bcmG9BmmrcOL6p4lbdq1lNmWYEj2xLcug06u2gZ9DK',
  access_token_key: '2345772514-owDwvKfwxnwfA4leP94fGAQSSPsI5o0m19yiJfG',
  access_token_secret: 'Oyhi33InhTW39Sw6EhwspAcux6cPYuqLNwSKYaaMfLRF8',
});

var params = {status: 'nodejs here nice to meet ya'};
client.post('statuses/update', params, function(error, tweets, response) {
    console.log(error)
  if (!error) {
    console.log(tweets);
  }
});