
exports.up = function(knex) {
    return knex.schema.table('board_posts', function (table) {
        table.boolean("ispoll").defaultTo(false);
      })
};

exports.down = function(knex) {
    return knex.schema.table('board_posts', function(table){
        table.dropColumn('ispoll');
      })
};
