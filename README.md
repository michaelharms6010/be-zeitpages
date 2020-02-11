# Zeitpages backend

This is a one day hack project that I made to teach about building full stack web apps from scratch. It powers the CRUD of https://github.com/michaelharms6010/fe-zeitpages this app. 

Currently a staging server is hosted on heroku at https://zeitpages-staging.herokuapp.com

Endpoints:

/auth/register - Creates a new user in the db. Expects a POST request with an object in the following format:

```{
    username: "yourusername", 
    password: "yourpassword"
}```

its response contains a json web token that will allow you to access the restricted /user endpoints.

/auth/login - Logs you in as an existing user. Expects a POST request with an object in the following format:

```{
    username: "yourusername", 
    password: "yourpassword"
}```

its response contains a json web token that will allow you to access the restricted /user endpoints.


/users - A GET request to /users will return a list of all users.

A GET request to /users/me will return the logged in user using the decoded id from the user's json web token.

A PUT request to /users expects data in the following format. It will update the user's data with the information passed. It uses the ID stored in the user's json web token to determine the user to edit.

```{
    username: "apples111",
    zaddr: zs1zxeehvq02nf0javeygdxnj6a78quvvlu7gsgg0e39n4uvp9hpdnyy3l4e494vt5kp4wjgrm7mtr,
    proofposturl: null,
    website: "zecmailer.com",
    twitter: "michaelharms70",
    email: "1@11.com"
}```

A DELETE request to /users will delete the user keyed to the id stored in the local json web token.
