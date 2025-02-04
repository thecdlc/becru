
const bcrypt = require('bcrypt');

exports.seed = async function(knex) {
  await knex('admins').del();

  const hashedPassword = await bcrypt.hash('admin', 10);

  await knex('admins').insert([
    {
      username: 'admin',
      password: hashedPassword,
      created_at: new Date(),
      updated_at: new Date()
    }
  ]);

  console.log('Admin user seeded successfully.');
};
