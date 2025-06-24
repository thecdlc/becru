exports.up = async function(knex) {
    // 1. Rename existing column
    await knex.schema.table('properties', function(table) {
      table.renameColumn('number_of_bathrooms', 'number_of_bathrooms_int');
    });
  
    // 2. Add new decimal column
    await knex.schema.table('properties', function(table) {
      table.decimal('number_of_bathrooms', 3, 1).notNullable().defaultTo(0);
    });
  
    // 3. Copy data
    await knex('properties').update({
      number_of_bathrooms: knex.raw('CAST(number_of_bathrooms_int AS REAL)')
    });
  
    // 4. Drop the old column
    await knex.schema.table('properties', function(table) {
      table.dropColumn('number_of_bathrooms_int');
    });
  };
  
  exports.down = async function(knex) {
    // Reverse the process if needed
    await knex.schema.table('properties', function(table) {
      table.integer('number_of_bathrooms_int').notNullable().defaultTo(0);
    });
  
    await knex('properties').update({
      number_of_bathrooms_int: knex.raw('CAST(number_of_bathrooms AS INTEGER)')
    });
  
    await knex.schema.table('properties', function(table) {
      table.dropColumn('number_of_bathrooms');
      table.renameColumn('number_of_bathrooms_int', 'number_of_bathrooms');
    });
  };
  