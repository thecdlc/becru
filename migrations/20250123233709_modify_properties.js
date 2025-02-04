// migrations/20250123_add_columns_to_properties.js

exports.up = function(knex) {
    return knex.schema.table('properties', function(table) {
      table.integer('number_of_bathrooms')
        .notNullable()
        .defaultTo(0); 
  
      table.integer('number_of_rooms')
        .notNullable()
        .defaultTo(0);
  
      table.float('total_area')
        .notNullable()
        .defaultTo(0);
  
      table.float('built_area')
        .notNullable()
        .defaultTo(0);
  
      table.integer('ubication_image_id')
        .unsigned()
        .nullable();
  
      table.foreign('ubication_image_id')
        .references('id')
        .inTable('images')
        .onDelete('SET NULL')
        .onUpdate('CASCADE');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('properties', function(table) {
      table.dropForeign('ubication_image_id');
  
      table.dropColumn('ubication_image_id');
      table.dropColumn('built_area');
      table.dropColumn('total_area');
      table.dropColumn('number_of_rooms');
      table.dropColumn('number_of_bathrooms');
    });
  };
  