
exports.up = function(knex) {
    return knex.schema.table('board_posts', function (table) {
        table.integer("reply_to_post");
      })
};

exports.down = function(knex) {
    return knex.schema.table('board_posts', function(table){
        table.dropColumn('reply_to_post');
      })
};
