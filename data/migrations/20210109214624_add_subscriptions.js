
exports.up = function(knex) {
  return knex.schema.createTable('subscriptions', function (table) {
      table.integer("subscriber_id");
      table.integer("subscribed_to_id");
      table.datetime("cutoff_date");
      table.string("amount");
    })
};

exports.down = function(knex) {
  return knex.schema.dropTableIfExists("subscriptions")
};
