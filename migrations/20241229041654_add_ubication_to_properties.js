// migrations/20231001_add_ubication_to_properties.js

exports.up = function(knex) {
    return knex.schema.table('properties', function(table) {
      table.string('ubication'); // or table.text('ubication');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('properties', function(table) {
      table.dropColumn('ubication');
    });
  };
  