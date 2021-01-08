
exports.up = function(knex) {
    return knex.schema.table('board_posts', function (table) {
        table.string("reply_zaddr");
      })
};

exports.down = function(knex) {
    return knex.schema.table('board_posts', function(table){
        table.dropColumn('reply_zaddr');
      })
};
