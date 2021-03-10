
exports.up = function(knex) {
  return knex.schema.createTable('polls', function (table) {
      table.increments();
      table.string("option_1");
      table.string("option_2");
      table.string("option_3");
      table.string("option_4");
      table.integer("board_post_id")
    })
    .createTable('votes', function (table) {
      table.increments();
      table.integer("poll_id");
      table.integer("option_voted");
    })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("polls").dropTableIfExists("votes")
};
