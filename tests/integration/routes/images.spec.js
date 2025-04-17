jest.mock('../../../middleware/auth', () => (_req, _res, next) => next());

const request = require('supertest');
const path    = require('path');
const app     = require('../../../app');
const resetDb = require('../../helpers/resetDb');
const knex    = require('../../../db');

const COVER = path.resolve(__dirname, '../../fixtures/cover.png');
const IMG1  = path.resolve(__dirname, '../../fixtures/img1.png');

let propertyId;

beforeEach(async () => {
  await resetDb();

  [propertyId] = await knex('properties').insert({
    title: 'Test prop',
    description: '',
    price: 100,
    ubication: '',
    number_of_bathrooms: 0,
    number_of_rooms: 0,
    total_area: 0,
    built_area: 0
  });
});

afterAll(async () => { await knex.destroy(); });

test('POST /images uploads cover + gallery', async () => {
  const res = await request(app)
    .post('/images')
    .field('property_id', propertyId)      
    .attach('cover',  COVER)
    .attach('images', IMG1);

  expect(res.status).toBe(200);
  expect(res.body.coverImage).toBeTruthy();

   const images = await knex('images').where({ property_id: propertyId });
   expect(images.length).toBeGreaterThanOrEqual(2);
});
