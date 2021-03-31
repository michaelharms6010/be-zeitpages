
exports.up = function(knex) {
  return knex.schema.table('users', function (table) {
      table.string("view_key");
      table.date("board_cutoff_date");
    })
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table){
      table.dropColumn('view_key');
      table.dropColumn('board_cutoff_date');
    })
};
