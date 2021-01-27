# Zeitpages API
 
## Public endpoints

Some Zecpages JSON API endpoints public and reachable via HTTP request.

**Base URL:** `https://be.zecpages.com`

| Endpoint      | Returns |
| ----------- | ----------- |
| GET /users      | Returns all users |
| GET /users/\<id\>      | Query single user by id |
| GET /users/\<username\>.json   | Query single user by username  | 
| GET /board      | Returns all board posts |
| GET /board/\<id\>      | Retrieves a single post |
| GET /board/leaderboard      | Returns most liked posts |


## Older documentation for endpoints that the actual app uses, still public but not super interesting

/auth/register - Creates a new user in the db. Expects a POST request with an object in the following format:

```
{
    username: "yourusername", 
    password: "yourpassword"
}
```

its response contains a json web token that will allow you to access the restricted /user endpoints.

/auth/login - Logs you in as an existing user. Expects a POST request with an object in the following format:

```
{
    username: "yourusername", 
    password: "yourpassword"
}
```

its response contains a json web token that will allow you to access the restricted /user endpoints.


/users - A GET request to /users will return a list of all users.

A GET request to /users/me will return the logged in user using the decoded id from the user's json web token.

A PUT request to /users expects data in the following format. It will update the user's data with the information passed. It uses the ID stored in the user's json web token to determine the user to edit.

```
{
    username: "apples111",
    zaddr: zs1zxeehvq02nf0javeygdxnj6a78quvvlu7gsgg0e39n4uvp9hpdnyy3l4e494vt5kp4wjgrm7mtr,
    proofposturl: null,
    website: "zecmailer.com",
    twitter: "michaelharms70",
    email: "1@11.com"
}
```

A DELETE request to /users will delete the user keyed to the id stored in the local json web token.
