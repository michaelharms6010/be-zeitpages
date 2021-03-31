
exports.up = function(knex) {
  return knex.schema.table('users', function (table) {
      table.string("viewing_key", 300);

    })
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table){
      table.dropColumn('viewing_key');
    })
};
