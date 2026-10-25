/** Shapes returned by the Showroom API (see docs/DESIGN.md §4). */

export type Role = 'USER' | 'ADMIN';

/** Display order used by the category chips and selects. */
export const CATEGORIES = [
  'SEDAN',
  'SUV',
  'HATCHBACK',
  'COUPE',
  'CONVERTIBLE',
  'TRUCK',
  'VAN',
  'ELECTRIC',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
}

export interface Vehicle {
  id: string;
  make: string;
  model: string;
  category: Category;
  price: number;
  quantity: number;
  year: number;
  color: string;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Purchase {
  id: string;
  /** Null once the vehicle has been deleted; make and model are kept as a snapshot. */
  vehicleId: string | null;
  make: string;
  model: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  createdAt: string;
}

export interface FieldError {
  field: string;
  message: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}
