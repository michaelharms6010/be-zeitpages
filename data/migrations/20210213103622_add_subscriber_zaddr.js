
exports.up = function(knex) {
    return knex.schema.table('subscriptions', function (table) {
        table.string("subscriber_zaddr", 128);
      })
};

exports.down = function(knex) {
    return knex.schema.table('subscriptions', function(table){
        table.dropColumn('subscriber_zaddr');
      })
};
