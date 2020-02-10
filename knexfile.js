// Update with your config settings.

module.exports = {

  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    migrations: {
      directory: "./data/migrations",
      tableName: "dbmigrations",
    },
    seeds: {directory: "./data/seeds"},
  },

  staging: {
    client: 'postgresql',
    connection: {
      database: 'my_db',
      
    },
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      tableName: 'knex_migrations'
    }
  },

  production: {
    client: 'pg',
    connection: process.env.DATABASE_URL,
    pool: {
      min: 2,
      max: 10
    },
    migrations: {
      directory: "./data/migrations",
      tableName: "dbmigrations",
    },
    seeds: {directory: "./data/seeds"},
  }

};
