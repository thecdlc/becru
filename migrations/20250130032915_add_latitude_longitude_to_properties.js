exports.up = function(knex) {
    return knex.schema.table('properties', function(table) {
      table.decimal('latitude', 9, 6); // Latitude with 9 digits total and 6 decimal places
      table.decimal('longitude', 9, 6); // Longitude with 9 digits total and 6 decimal places
    });
  };
  
  exports.down = function(knex) {
    return knex.schema.table('properties', function(table) {
      table.dropColumn('latitude');
      table.dropColumn('longitude');
    });
  };