jest.mock('../../../middleware/auth', () => (_req, _res, next) => next()); // bypass any extra auth guards

const request = require('supertest');
const bcrypt  = require('bcrypt');
const path    = require('path');
const app     = require('../../../app');
const resetDb = require('../../helpers/resetDb');
const knex    = require('../../../db');

beforeEach(async () => {
  await resetDb();

  const hash = await bcrypt.hash('secret123', 10);
  await knex('admins').insert({ username: 'admin', password: hash });

  await knex('properties').insert({  title: 'Test‑prop', created_at: new Date(), price: 1000 });
});

afterAll(async () => { await knex.destroy(); });

test('POST /admin/login with valid creds sets session and redirects', async () => {
  const agent = request.agent(app);                 
  await agent
    .post('/admin/login')
    .send({ username: 'admin', password: 'secret123' })
    .expect(302)
    .expect('Location', '/admin');

  await agent.get('/admin').expect(200);
});

test('POST /admin/login with wrong password shows error message', async () => {
  const res = await request(app)
    .post('/admin/login')
    .send({ username: 'admin', password: 'wrongpass' })
    .expect(200);

  expect(res.text).toContain('Credenciales inválidas');
});

test('GET /admin/logout destroys session and redirects back to /admin', async () => {
  const agent = request.agent(app);

  await agent
    .post('/admin/login')
    .send({ username: 'admin', password: 'secret123' })
    .expect(302);

  await agent
    .get('/admin/logout')
    .expect(302)
    .expect('Location', '/admin');

  const res = await agent.get('/admin').expect(200);
  expect(res.text).toContain('<form');            
});
