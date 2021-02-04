# Zeitpages API
 
## Public endpoints

Some Zecpages JSON API endpoints public and reachable via HTTP request. Great way for ppl who don't want to play around with browsers and client-side scripts to grab ZECpages' data.

It's rate-limited but I think it's pretty generous at >100 requests/hr. Please be nice so I don't have to lower the rate limit :)

**Base URL:** `https://be.zecpages.com`

| Endpoint      | Returns |
| ----------- | ----------- |
| GET /users      | Returns all users |
| GET /users/\<id\>      | Query single user by id |
| GET /users/\<username\>.json   | Query single user by username  | 
| GET /board      | Returns all board posts |
| GET /board/\<id\>      | Retrieves a single post |
| GET /board/leaderboard      | Returns most liked posts |
| GET /board/payableposts | Returns like count, grouped by zaddr | 
| GET /board/likecount | Get total number of likes for the whole board |
| GET /board/rss | Board RSS feed |
