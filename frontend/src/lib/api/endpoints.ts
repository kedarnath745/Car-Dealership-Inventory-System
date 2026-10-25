import { api } from './index';
import type { AuthResponse, Category, Purchase, User, Vehicle } from './types';

export interface VehicleInput {
  make: string;
  model: string;
  category: Category;
  price: number;
  year: number;
  color: string;
  imageUrl: string | null;
  /** Only on create: stock changes later go through purchase and restock (D19). */
  quantity?: number;
}

export const authApi = {
  login: (body: { email: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/login', body),
  register: (body: { name: string; email: string; password: string }) =>
    api.post<AuthResponse>('/api/auth/register', body),
  me: () => api.get<{ user: User }>('/api/auth/me').then((data) => data.user),
};

export const vehiclesApi = {
  list: () => api.get<{ vehicles: Vehicle[] }>('/api/vehicles').then((data) => data.vehicles),
  search: (query: URLSearchParams) =>
    api
      .get<{ vehicles: Vehicle[] }>(`/api/vehicles/search?${query.toString()}`)
      .then((data) => data.vehicles),
  create: (body: VehicleInput) =>
    api.post<{ vehicle: Vehicle }>('/api/vehicles', body).then((data) => data.vehicle),
  update: (id: string, body: Partial<VehicleInput>) =>
    api.put<{ vehicle: Vehicle }>(`/api/vehicles/${id}`, body).then((data) => data.vehicle),
  remove: (id: string) => api.delete(`/api/vehicles/${id}`),
  purchase: (id: string, quantity: number) =>
    api.post<{ purchase: Purchase; vehicle: Vehicle }>(`/api/vehicles/${id}/purchase`, {
      quantity,
    }),
  restock: (id: string, quantity: number) =>
    api
      .post<{ vehicle: Vehicle }>(`/api/vehicles/${id}/restock`, { quantity })
      .then((data) => data.vehicle),
};

export const purchasesApi = {
  mine: () => api.get<{ purchases: Purchase[] }>('/api/purchases/me').then((d) => d.purchases),
};
