import { HttpResponse, http } from 'msw';
import type { User, Vehicle } from '../lib/api/types';

export const shopper: User = {
  id: 'u-1',
  name: 'Asha Rao',
  email: 'asha@example.com',
  role: 'USER',
};

export const admin: User = {
  id: 'u-admin',
  name: 'Ritu Admin',
  email: 'admin@dealership.com',
  role: 'ADMIN',
};

/** Tokens the mock API accepts, mapped to their users. */
export const TOKENS = { shopper: 'shopper-token', admin: 'admin-token' } as const;

let vehicleSequence = 0;

export function makeVehicle(overrides: Partial<Vehicle> = {}): Vehicle {
  vehicleSequence += 1;
  return {
    id: `v-${vehicleSequence}`,
    make: 'Hyundai',
    model: 'Creta',
    category: 'SUV',
    price: 1250000,
    quantity: 5,
    year: 2025,
    color: 'Abyss Black',
    imageUrl: null,
    createdAt: `2026-01-${String(vehicleSequence).padStart(2, '0')}T00:00:00.000Z`,
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  };
}

/** GET /api/auth/me answering for the known tokens, 401 otherwise. */
export const meHandler = http.get('/api/auth/me', ({ request }) => {
  const auth = request.headers.get('Authorization');
  if (auth === `Bearer ${TOKENS.shopper}`) return HttpResponse.json({ user: shopper });
  if (auth === `Bearer ${TOKENS.admin}`) return HttpResponse.json({ user: admin });
  return HttpResponse.json(
    { error: { code: 'INVALID_TOKEN', message: 'Invalid or expired token' } },
    { status: 401 },
  );
});

export const apiError = (status: number, code: string, message: string, details?: unknown) =>
  HttpResponse.json({ error: { code, message, ...(details ? { details } : {}) } }, { status });
