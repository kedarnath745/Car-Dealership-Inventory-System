import request from 'supertest';
import { createApp } from '../../src/app';
import { bearerFor } from '../helpers/auth';
import { resetDatabase } from '../helpers/db';
import { createUser } from '../helpers/factories';
import { createVehicle } from '../helpers/vehicles';

const app = createApp();

describe('GET /api/vehicles/search', () => {
  let userAuth: string;

  beforeAll(async () => {
    await resetDatabase();
    userAuth = bearerFor(await createUser());
    await createVehicle({
      make: 'Toyota',
      model: 'Fortuner',
      category: 'SUV',
      price: 3850000,
      createdAt: new Date('2026-01-01'),
    });
    await createVehicle({
      make: 'Toyota',
      model: 'Camry Hybrid',
      category: 'SEDAN',
      price: 4600000,
      createdAt: new Date('2026-01-02'),
    });
    await createVehicle({
      make: 'Tata',
      model: 'Nexon EV',
      category: 'ELECTRIC',
      price: 1499000,
      createdAt: new Date('2026-01-03'),
    });
    await createVehicle({
      make: 'Mahindra',
      model: 'XUV700',
      category: 'SUV',
      price: 2450000,
      quantity: 0,
      createdAt: new Date('2026-01-04'),
    });
    await createVehicle({
      make: 'Maruti',
      model: 'Swift',
      category: 'HATCHBACK',
      price: 699000,
      createdAt: new Date('2026-01-05'),
    });
  });

  const search = async (query: string) => {
    const res = await request(app)
      .get(`/api/vehicles/search${query}`)
      .set('Authorization', userAuth);
    return { res, models: (res.body.vehicles ?? []).map((v: { model: string }) => v.model) };
  };

  it('matches make case-insensitively on part of the name', async () => {
    const { res, models } = await search('?make=toy');

    expect(res.status).toBe(200);
    expect(models).toEqual(['Camry Hybrid', 'Fortuner']);
  });

  it('matches model case-insensitively on part of the name', async () => {
    const { models } = await search('?model=xuv');

    expect(models).toEqual(['XUV700']);
  });

  it('matches category exactly, accepting any letter case', async () => {
    const { models } = await search('?category=suv');

    expect(models).toEqual(['XUV700', 'Fortuner']);
  });

  it('filters by an inclusive price range', async () => {
    const { models } = await search('?minPrice=1499000&maxPrice=3850000');

    expect(models).toEqual(['XUV700', 'Nexon EV', 'Fortuner']);
  });

  it('supports only a minimum or only a maximum price', async () => {
    expect((await search('?minPrice=4000000')).models).toEqual(['Camry Hybrid']);
    expect((await search('?maxPrice=700000')).models).toEqual(['Swift']);
  });

  it('combines every filter with AND', async () => {
    const { models } = await search('?make=toyota&category=SUV&maxPrice=4000000');

    expect(models).toEqual(['Fortuner']);
  });

  it('includes out-of-stock vehicles in results', async () => {
    const { models } = await search('?make=mahindra');

    expect(models).toEqual(['XUV700']);
  });

  it('returns everything, newest first, when no filters (or only empty ones) are given', async () => {
    const all = ['Swift', 'XUV700', 'Nexon EV', 'Camry Hybrid', 'Fortuner'];

    expect((await search('')).models).toEqual(all);
    expect((await search('?make=&category=&minPrice=')).models).toEqual(all);
  });

  it('returns an empty list when nothing matches', async () => {
    const { res, models } = await search('?make=Ferrari');

    expect(res.status).toBe(200);
    expect(models).toEqual([]);
  });

  it.each(['%', '_'])('treats "%s" as a literal character, not a wildcard', async (char) => {
    const { models } = await search(`?make=${encodeURIComponent(char)}`);

    expect(models).toEqual([]);
  });

  it.each([
    ['minPrice is greater than maxPrice', '?minPrice=500&maxPrice=100', 'minPrice'],
    ['minPrice is not a number', '?minPrice=cheap', 'minPrice'],
    ['maxPrice is negative', '?maxPrice=-1', 'maxPrice'],
    ['category is not in the list', '?category=SPACESHIP', 'category'],
  ])('returns 400 when %s', async (_case, query, field) => {
    const { res } = await search(query);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details).toEqual(
      expect.arrayContaining([expect.objectContaining({ field })]),
    );
  });

  it('returns 401 without a token', async () => {
    const res = await request(app).get('/api/vehicles/search?make=toyota');

    expect(res.status).toBe(401);
  });
});
