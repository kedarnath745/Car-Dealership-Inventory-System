import request from 'supertest';
import { createApp } from '../../src/app';

describe('GET /api/health', () => {
  const app = createApp();

  it('responds 200 with status ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });
});

describe('unknown routes', () => {
  const app = createApp();

  it('responds 404 with the standard error shape', async () => {
    const res = await request(app).get('/api/does-not-exist');

    expect(res.status).toBe(404);
    expect(res.body).toEqual({
      error: { code: 'NOT_FOUND', message: 'Route GET /api/does-not-exist not found' },
    });
  });
});
