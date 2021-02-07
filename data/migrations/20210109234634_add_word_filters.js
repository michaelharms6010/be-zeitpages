
exports.up = function(knex) {
  return knex.schema.createTable('word_filters', function (table) {
      table.increments();
      table.string("filtered_from");
      table.string("filtered_to");
      table.datetime("date_created");
    })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("word_filters")
};
