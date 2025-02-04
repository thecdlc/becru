// migrations/20240427000001_create_admins_table.js

exports.up = function(knex) {
    return knex.schema.createTable('admins', function(table) {
      table.increments('id').primary(); // Auto-incrementing primary key
      table.string('username').notNullable().unique(); // Unique username
      table.string('password').notNullable(); // Hashed password
      table.timestamps(true, true); // created_at and updated_at timestamps
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.dropTableIfExists('admins');
  };
  