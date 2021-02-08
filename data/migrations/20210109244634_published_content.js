
exports.up = function(knex) {
  return knex.schema.createTable('published_content', function (table) {
      table.increments();
      tbl.integer("author_id");
      table.string("memo", 512);
      table.datetime("date_created").defaultTo(knex.fn.now(6));
    })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("published_content")
};
