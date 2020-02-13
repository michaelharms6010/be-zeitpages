const knex = require("knex");
const knexfile = require("../knexfile");

const dbEnv = "production";

module.exports= knex(knexfile[dbEnv]);