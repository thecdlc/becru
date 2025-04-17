const knex = require('../../db');
module.exports = async () => { await knex.destroy(); };
