
exports.up = function(knex) {
    return knex.schema.createTable("board_posts", posts => {
      posts.increments();
      posts.string("memo", 512)
      .notNullable()
      posts.string("datetime", 64)
      .notNullable();
      posts.integer("amount")
      .notNullable();
    })
  };
  
  exports.down = function(knex) {
      return knex.schema.dropTableIfExists('board_posts')
  };
  