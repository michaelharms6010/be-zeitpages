
exports.up = function(knex) {
    return knex.schema.table('board_posts', function (table) {
        table.string("board_zaddr");
      })
};

exports.down = function(knex) {
    return knex.schema.table('board_posts', function(table){
        table.dropColumn('board_zaddr');
      })
};
