/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
    return knex.schema.createTable('properties', function(table) {
        table.increments('id').primary();
        table.string('title').notNullable();
        table.text('description');
        table.integer('price').notNullable();
        table.string('image');
        table.timestamps(true, true);
      });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
    return knex.schema.dropTableIfExists('properties');
};
