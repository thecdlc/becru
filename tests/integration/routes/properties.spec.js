jest.mock('../../../middleware/auth', () => (_req, _res, next) => next());
jest.mock('csurf', () => () => (req, _res, next) => { req.csrfToken = () => 'dummy'; next(); });

jest.mock('axios');
const axios = require('axios');
axios.get.mockResolvedValue({
    data: { status: 'OK', results: [{ geometry: { location: { lat: 19.0, lng: -99.0 } } }] }
});

const request = require('supertest');
const path = require('path');
const fs = require('fs');
const knex = require('../../../db');
const app = require('../../../app');
const resetDb = require('../../helpers/resetDb');

const fixtures = p => path.resolve(__dirname, '../../fixtures', p);
const basePayload = {
    title: 'Casa de prueba',
    description: 'Bonita',
    price: 999,
    ubication: 'CDMX',
    number_of_bathrooms: 1,
    number_of_rooms: 2,
    total_area: 100,
    built_area: 80
};

beforeEach(resetDb);
afterAll(async () => { await knex.destroy(); });

test('POST /propiedades inserts row, saves lat/lng & redirects', async () => {
    await request(app)
        .post('/propiedades')
        .field(basePayload)
        .expect(302)
        .expect('Location', '/admin');

    const row = await knex('properties').where({ title: 'Casa de prueba' }).first();
    expect(row).toBeTruthy();
    expect(row.latitude).toBeCloseTo(19.0);
    expect(row.longitude).toBeCloseTo(-99.0);
});

test('POST /propiedades stores cover & gallery images', async () => {
    await request(app)
        .post('/propiedades')
        .field(basePayload)
        .attach('cover', fixtures('cover.png'))
        .attach('images', fixtures('img1.png'))
        .attach('images', fixtures('img2.png'))
        .expect(302);

    const property = await knex('properties').where({ title: 'Casa de prueba' }).first();
    const images = await knex('images').where({ property_id: property.id });
    expect(property.cover_image_id).toBeTruthy();
    expect(images.length).toBeGreaterThanOrEqual(3);
});

test('GET /propiedades/:id returns 200 & HTML', async () => {
    const [id] = await knex('properties').insert(basePayload);
    const res = await request(app).get(`/propiedades/${id}`).expect(200);
    expect(res.text).toContain('Casa de prueba');
});

test('GET /propiedades/:id/pdf returns application/pdf', async () => {
    const [id] = await knex('properties').insert(basePayload);
    await request(app)
        .get(`/propiedades/${id}/pdf`)
        .expect('Content-Type', /application\/pdf/)
        .expect(200);
});
test('PDF endpoint 404 on missing property', async () => {
    await request(app).get('/propiedades/999/pdf').expect(404);
});

test('POST /propiedades/:id/editar updates record & cover', async () => {
    const [id] = await knex('properties').insert(basePayload);

    await request(app)
        .post(`/propiedades/${id}/editar`)
        .field({ ...basePayload, title: 'Nueva casa' })
        .attach('cover', fixtures('cover.png'))
        .expect(302);

    const updated = await knex('properties').where({ id }).first();
    expect(updated.title).toBe('Nueva casa');
    expect(updated.cover_image_id).toBeTruthy();
});

test('DELETE /propiedades/:id removes property & images', async () => {
    const [id] = await knex('properties').insert(basePayload);
    await knex('images').insert({
        property_id: id,
        filename: 'f.png',
        filepath: '/uploads/properties/f.png'
    });

    const absPath = path.join(__dirname, '../../../public/uploads/properties/f.png');
    fs.mkdirSync(path.dirname(absPath), { recursive: true });
    fs.writeFileSync(absPath, '');

    await request(app).delete(`/propiedades/${id}`).expect(302);

    const prop = await knex('properties').where({ id }).first();
    const imgs = await knex('images').where({ property_id: id });
    expect(prop).toBeUndefined();
    expect(imgs.length).toBe(0);
});