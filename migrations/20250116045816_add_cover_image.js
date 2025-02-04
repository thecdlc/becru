exports.up = function(knex) {
    return knex.schema.table('properties', table => {
      table
        .integer('cover_image_id')
        .unsigned()
        .references('id')
        .inTable('images')
        .onDelete('SET NULL')
        .nullable();
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('properties', table => {
      table.dropColumn('cover_image_id');
    });
  };
  