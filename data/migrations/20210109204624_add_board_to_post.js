
exports.up = function(knex) {
  return knex.schema.table('board_posts', function (table) {
      table.string("board_name")
    })
};

exports.down = function(knex) {
  return knex.schema.table('board_posts', function(table){
      table.dropColumn('board_name');
    })
};
