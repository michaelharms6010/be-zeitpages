
exports.up = function(knex) {
    return knex.schema.table('board_posts', function (table) {
        table.integer("likes").defaultTo(0);
      })
};

exports.down = function(knex) {
    return knex.schema.table('board_posts', function(table){
        table.dropColumn('likes');
      })
};
