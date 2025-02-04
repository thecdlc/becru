// migrations/20231001_remove_image_from_properties.js

exports.up = function(knex) {
    return knex.schema.table('properties', function(table) {
      table.dropColumn('image');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('properties', function(table) {
      table.string('image');
    });
  };
  