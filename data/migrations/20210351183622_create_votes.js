
exports.up = function(knex) {
  return knex.schema.createTable('votes', function (table) {
      table.increments();
      table.integer("poll_id");
      table.string("poll_txid");
      table.integer("option");
    })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("votes")
};
