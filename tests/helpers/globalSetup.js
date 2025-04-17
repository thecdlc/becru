process.env.NODE_ENV = 'test';
const knex = require('../../db');
module.exports = async () => { await knex.migrate.latest(); };
