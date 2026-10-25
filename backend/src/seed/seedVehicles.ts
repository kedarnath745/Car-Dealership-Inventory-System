import type { Category } from '@prisma/client';
import { prisma } from '../lib/prisma';

export interface SampleVehicle {
  make: string;
  model: string;
  category: Category;
  /** Approximate Indian ex-showroom price in rupees. Illustrative demo data only. */
  price: number;
  quantity: number;
  year: number;
  color: string;
  imageUrl: null;
}

/**
 * Demo inventory for local development and screenshots. Covers every category and
 * includes sold-out (0) and low-stock (1–3) cars so every stock badge is visible.
 * Images are left empty: the UI shows a category illustration instead (decision Q14).
 */
export const SAMPLE_VEHICLES: readonly SampleVehicle[] = [
  {
    make: 'Maruti Suzuki',
    model: 'Swift',
    category: 'HATCHBACK',
    price: 649000,
    quantity: 8,
    year: 2025,
    color: 'Sizzling Red',
    imageUrl: null,
  },
  {
    make: 'Hyundai',
    model: 'i20',
    category: 'HATCHBACK',
    price: 704000,
    quantity: 2,
    year: 2024,
    color: 'Starry Night',
    imageUrl: null,
  },
  {
    make: 'Honda',
    model: 'City',
    category: 'SEDAN',
    price: 1182000,
    quantity: 5,
    year: 2025,
    color: 'Platinum White Pearl',
    imageUrl: null,
  },
  {
    make: 'Skoda',
    model: 'Slavia',
    category: 'SEDAN',
    price: 1069000,
    quantity: 3,
    year: 2025,
    color: 'Lava Blue',
    imageUrl: null,
  },
  {
    make: 'Hyundai',
    model: 'Verna',
    category: 'SEDAN',
    price: 1099000,
    quantity: 0,
    year: 2024,
    color: 'Titan Grey',
    imageUrl: null,
  },
  {
    make: 'Hyundai',
    model: 'Creta',
    category: 'SUV',
    price: 1110900,
    quantity: 6,
    year: 2025,
    color: 'Abyss Black',
    imageUrl: null,
  },
  {
    make: 'Mahindra',
    model: 'XUV700',
    category: 'SUV',
    price: 1399000,
    quantity: 4,
    year: 2025,
    color: 'Everest White',
    imageUrl: null,
  },
  {
    make: 'Toyota',
    model: 'Fortuner',
    category: 'SUV',
    price: 3343000,
    quantity: 1,
    year: 2024,
    color: 'Attitude Black',
    imageUrl: null,
  },
  {
    make: 'Tata',
    model: 'Nexon EV',
    category: 'ELECTRIC',
    price: 1249000,
    quantity: 7,
    year: 2025,
    color: 'Pristine White',
    imageUrl: null,
  },
  {
    make: 'Mahindra',
    model: 'BE 6',
    category: 'ELECTRIC',
    price: 1890000,
    quantity: 3,
    year: 2025,
    color: 'Tango Red',
    imageUrl: null,
  },
  {
    make: 'MG',
    model: 'ZS EV',
    category: 'ELECTRIC',
    price: 1898000,
    quantity: 0,
    year: 2024,
    color: 'Glaze Red',
    imageUrl: null,
  },
  {
    make: 'Maruti Suzuki',
    model: 'Eeco',
    category: 'VAN',
    price: 532000,
    quantity: 10,
    year: 2025,
    color: 'Cerulean Blue',
    imageUrl: null,
  },
  {
    make: 'Kia',
    model: 'Carnival',
    category: 'VAN',
    price: 6390000,
    quantity: 2,
    year: 2025,
    color: 'Fusion Black',
    imageUrl: null,
  },
  {
    make: 'Isuzu',
    model: 'D-Max V-Cross',
    category: 'TRUCK',
    price: 2600000,
    quantity: 2,
    year: 2024,
    color: 'Galena Grey',
    imageUrl: null,
  },
  {
    make: 'Toyota',
    model: 'Hilux',
    category: 'TRUCK',
    price: 3040000,
    quantity: 0,
    year: 2024,
    color: 'Emotional Red',
    imageUrl: null,
  },
  {
    make: 'BMW',
    model: 'M2',
    category: 'COUPE',
    price: 10300000,
    quantity: 1,
    year: 2024,
    color: 'Zandvoort Blue',
    imageUrl: null,
  },
  {
    make: 'BMW',
    model: 'Z4 M40i',
    category: 'CONVERTIBLE',
    price: 9290000,
    quantity: 1,
    year: 2024,
    color: 'San Francisco Red',
    imageUrl: null,
  },
  {
    make: 'Mini',
    model: 'Cooper Convertible',
    category: 'CONVERTIBLE',
    price: 4950000,
    quantity: 2,
    year: 2024,
    color: 'Chili Red',
    imageUrl: null,
  },
];

/**
 * Inserts the sample inventory only when the vehicle table is empty, so re-running
 * the seed never duplicates cars or overwrites an admin's edits. Returns how many
 * vehicles were inserted (0 when inventory already existed).
 */
export async function seedVehicles(): Promise<number> {
  const existing = await prisma.vehicle.count();
  if (existing > 0) return 0;

  // Spread creation times so "newest first" has a stable, meaningful order.
  const now = Date.now();
  const { count } = await prisma.vehicle.createMany({
    data: SAMPLE_VEHICLES.map((vehicle, index) => ({
      ...vehicle,
      createdAt: new Date(now - (SAMPLE_VEHICLES.length - index) * 60_000),
    })),
  });
  return count;
}
