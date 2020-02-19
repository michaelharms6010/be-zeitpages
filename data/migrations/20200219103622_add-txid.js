
exports.up = function(knex) {
    return knex.schema.table('board_posts', function (table) {
        table.string("txid", 128);
      })
};

exports.down = function(knex) {
    return knex.schema.table('board_posts', function(table){
        table.dropColumn('txid');
      })
};
