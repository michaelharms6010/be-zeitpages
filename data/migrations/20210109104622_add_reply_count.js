
exports.up = function(knex) {
    return knex.schema.table('board_posts', function (table) {
        table.integer("reply_count").defaultTo(0);
      })
};

exports.down = function(knex) {
    return knex.schema.table('board_posts', function(table){
        table.dropColumn('reply_count');
      })
};
