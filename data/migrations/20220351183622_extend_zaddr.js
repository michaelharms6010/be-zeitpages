
exports.up = function(knex) {
  return knex.raw("ALTER TABLE users ALTER COLUMN zaddr TYPE varchar(255)")
};

exports.down = function(knex) {
  return knex.raw("ALTER TABLE users ALTER COLUMN zaddr TYPE varchar(128)")
};
