import { HttpResponse, http } from 'msw';
import { server } from '../../test/server';
import { ApiError, createApiClient } from './client';

const BASE = 'http://api.test';

describe('createApiClient', () => {
  it('sends JSON with the bearer token and returns the parsed body', async () => {
    let seenAuth: string | null = null;
    let seenBody: unknown = null;
    server.use(
      http.post(`${BASE}/api/things`, async ({ request }) => {
        seenAuth = request.headers.get('Authorization');
        seenBody = await request.json();
        return HttpResponse.json({ ok: true }, { status: 201 });
      }),
    );
    const api = createApiClient({ baseUrl: BASE, getToken: () => 'abc' });

    await expect(api.post('/api/things', { a: 1 })).resolves.toEqual({ ok: true });
    expect(seenAuth).toBe('Bearer abc');
    expect(seenBody).toEqual({ a: 1 });
  });

  it('omits the Authorization header when there is no token', async () => {
    let seenAuth: string | null = 'unset';
    server.use(
      http.get(`${BASE}/api/things`, ({ request }) => {
        seenAuth = request.headers.get('Authorization');
        return HttpResponse.json([]);
      }),
    );

    await createApiClient({ baseUrl: BASE, getToken: () => null }).get('/api/things');

    expect(seenAuth).toBeNull();
  });

  it('returns undefined for 204 No Content', async () => {
    server.use(http.delete(`${BASE}/api/things/1`, () => new HttpResponse(null, { status: 204 })));

    await expect(
      createApiClient({ baseUrl: BASE, getToken: () => 't' }).delete('/api/things/1'),
    ).resolves.toBeUndefined();
  });

  it('throws an ApiError carrying the API error code, message and field details', async () => {
    server.use(
      http.post(`${BASE}/api/things`, () =>
        HttpResponse.json(
          {
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Request validation failed',
              details: [{ field: 'price', message: 'Price must be greater than 0' }],
            },
          },
          { status: 400 },
        ),
      ),
    );

    const error = await createApiClient({ baseUrl: BASE, getToken: () => 't' })
      .post('/api/things', {})
      .catch((e: unknown) => e);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({
      status: 400,
      code: 'VALIDATION_ERROR',
      message: 'Request validation failed',
      details: [{ field: 'price', message: 'Price must be greater than 0' }],
    });
  });

  it('reports unreachable servers as a NETWORK_ERROR with a helpful message', async () => {
    server.use(http.get(`${BASE}/api/things`, () => HttpResponse.error()));

    const error = await createApiClient({ baseUrl: BASE, getToken: () => null })
      .get('/api/things')
      .catch((e: unknown) => e);

    expect(error).toMatchObject({
      status: 0,
      code: 'NETWORK_ERROR',
      message: "Couldn't reach the server. Check your connection and try again.",
    });
  });

  it('calls onUnauthorized when an authenticated request gets a 401', async () => {
    server.use(
      http.get(`${BASE}/api/things`, () =>
        HttpResponse.json(
          { error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } },
          { status: 401 },
        ),
      ),
    );
    const onUnauthorized = vi.fn();
    const api = createApiClient({ baseUrl: BASE, getToken: () => 'expired', onUnauthorized });

    await expect(api.get('/api/things')).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  it('does not call onUnauthorized for a failed sign-in (no token was sent)', async () => {
    server.use(
      http.post(`${BASE}/api/auth/login`, () =>
        HttpResponse.json(
          { error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' } },
          { status: 401 },
        ),
      ),
    );
    const onUnauthorized = vi.fn();
    const api = createApiClient({ baseUrl: BASE, getToken: () => null, onUnauthorized });

    await expect(api.post('/api/auth/login', {})).rejects.toMatchObject({ status: 401 });
    expect(onUnauthorized).not.toHaveBeenCalled();
  });
});
