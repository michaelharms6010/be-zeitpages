# Zeitpages API
 
## Public endpoints

Some Zecpages JSON API endpoints public and reachable via HTTP request. Great way for ppl who don't want to play around with browsers and client-side scripts to grab ZECpages' data.

**Base URL:** `https://be.zecpages.com`

| Endpoint      | Returns |
| ----------- | ----------- |
| GET /users      | Returns all users |
| GET /users/\<id\>      | Query single user by id |
| GET /users/\<username\>.json   | Query single user by username  | 
| GET /board      | Returns all board posts |
| GET /board/\<id\>      | Retrieves a single post |
| GET /board/leaderboard      | Returns most liked posts |

