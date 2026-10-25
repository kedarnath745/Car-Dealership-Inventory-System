import { HttpResponse, http } from 'msw';
import type { Vehicle } from '../lib/api/types';
import { apiError, meHandler } from './fixtures';

/**
 * A small in-memory stand-in for the vehicle API, so page tests exercise real
 * request/response cycles. Records every request URL for assertions.
 */
export function mockInventoryApi(initial: Vehicle[]) {
  let vehicles = [...initial];
  const requests: string[] = [];

  const newestFirst = (list: Vehicle[]) =>
    [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  const handlers = [
    meHandler,
    http.get('/api/vehicles', ({ request }) => {
      requests.push(new URL(request.url).pathname);
      return HttpResponse.json({ vehicles: newestFirst(vehicles) });
    }),
    http.get('/api/vehicles/search', ({ request }) => {
      const url = new URL(request.url);
      requests.push(url.pathname + url.search);
      const q = url.searchParams;
      const contains = (value: string, term: string | null) =>
        !term || value.toLowerCase().includes(term.toLowerCase());
      const result = vehicles.filter(
        (v) =>
          contains(v.make, q.get('make')) &&
          contains(v.model, q.get('model')) &&
          (!q.get('category') || v.category === q.get('category')) &&
          (!q.get('minPrice') || v.price >= Number(q.get('minPrice'))) &&
          (!q.get('maxPrice') || v.price <= Number(q.get('maxPrice'))),
      );
      return HttpResponse.json({ vehicles: newestFirst(result) });
    }),
    http.post('/api/vehicles/:id/purchase', async ({ params, request }) => {
      const { quantity = 1 } = (await request.json()) as { quantity?: number };
      const vehicle = vehicles.find((v) => v.id === params.id);
      if (!vehicle) return apiError(404, 'NOT_FOUND', 'Vehicle not found');
      if (vehicle.quantity === 0)
        return apiError(409, 'OUT_OF_STOCK', 'This vehicle is out of stock');
      if (vehicle.quantity < quantity) {
        return apiError(409, 'INSUFFICIENT_STOCK', `Only ${vehicle.quantity} left in stock`);
      }
      const updated = { ...vehicle, quantity: vehicle.quantity - quantity };
      vehicles = vehicles.map((v) => (v.id === vehicle.id ? updated : v));
      return HttpResponse.json(
        {
          vehicle: updated,
          purchase: {
            id: 'p-1',
            vehicleId: vehicle.id,
            make: vehicle.make,
            model: vehicle.model,
            quantity,
            unitPrice: vehicle.price,
            totalPrice: vehicle.price * quantity,
            createdAt: new Date().toISOString(),
          },
        },
        { status: 201 },
      );
    }),
    http.post('/api/vehicles', async ({ request }) => {
      const body = (await request.json()) as Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'>;
      requests.push('POST /api/vehicles');
      const created: Vehicle = {
        ...body,
        id: `v-new-${vehicles.length + 1}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      vehicles = [...vehicles, created];
      return HttpResponse.json({ vehicle: created }, { status: 201 });
    }),
    http.put('/api/vehicles/:id', async ({ params, request }) => {
      const changes = (await request.json()) as Partial<Vehicle>;
      const vehicle = vehicles.find((v) => v.id === params.id);
      if (!vehicle) return apiError(404, 'NOT_FOUND', 'Vehicle not found');
      const updated = { ...vehicle, ...changes, updatedAt: new Date().toISOString() };
      vehicles = vehicles.map((v) => (v.id === vehicle.id ? updated : v));
      return HttpResponse.json({ vehicle: updated });
    }),
    http.delete('/api/vehicles/:id', ({ params }) => {
      if (!vehicles.some((v) => v.id === params.id)) {
        return apiError(404, 'NOT_FOUND', 'Vehicle not found');
      }
      requests.push(`DELETE /api/vehicles/${String(params.id)}`);
      vehicles = vehicles.filter((v) => v.id !== params.id);
      return new HttpResponse(null, { status: 204 });
    }),
    http.post('/api/vehicles/:id/restock', async ({ params, request }) => {
      const { quantity } = (await request.json()) as { quantity: number };
      const vehicle = vehicles.find((v) => v.id === params.id);
      if (!vehicle) return apiError(404, 'NOT_FOUND', 'Vehicle not found');
      const updated = { ...vehicle, quantity: vehicle.quantity + quantity };
      vehicles = vehicles.map((v) => (v.id === vehicle.id ? updated : v));
      return HttpResponse.json({ vehicle: updated });
    }),
  ];

  return {
    handlers,
    requests,
    /** Change the server's data behind the client's back (e.g. another buyer). */
    setVehicles: (next: Vehicle[]) => {
      vehicles = next;
    },
  };
}
