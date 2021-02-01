
exports.up = function(knex) {
  return knex.schema.table('users', function (table) {
      table.string("referrer");
    })
};

exports.down = function(knex) {
  return knex.schema.table('users', function(table){
      table.dropColumn('referrer');
    })
};
