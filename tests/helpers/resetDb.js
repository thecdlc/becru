const knex = require('../../db');

module.exports = async () => {
  await knex.raw('PRAGMA foreign_keys = OFF;');

  await knex.migrate.rollback(undefined, true);
  await knex.migrate.latest();
  await knex.seed.run();

  await knex.raw('PRAGMA foreign_keys = ON;');
};
