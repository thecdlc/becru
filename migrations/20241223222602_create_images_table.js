// migrations/20231001_create_images_table.js

exports.up = function(knex) {
    return knex.schema.createTable('images', function(table) {
      table.increments('id').primary();
      table.integer('property_id').unsigned().notNullable();
      table.string('filename').notNullable();
      table.string('filepath').notNullable();
      table.timestamp('created_at').defaultTo(knex.fn.now());
  
      table.foreign('property_id')
           .references('id')
           .inTable('properties')
           .onDelete('CASCADE');
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('images');
  };
  