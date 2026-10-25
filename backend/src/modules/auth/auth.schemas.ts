import { z } from 'zod';

/** bcrypt only uses the first 72 bytes of a password, so longer ones are rejected. */
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

const email = z
  .string('Email is required')
  .trim()
  .toLowerCase()
  .pipe(z.email('Invalid email address'));

export const registerSchema = z.object({
  name: z
    .string('Name is required')
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(60, 'Name must be at most 60 characters'),
  email,
  password,
});

export type RegisterInput = z.infer<typeof registerSchema>;

/** Login only checks presence: length rules belong to registration, not to existing passwords. */
export const loginSchema = z.object({
  email,
  password: z.string('Password is required').min(1, 'Password is required'),
});

export type LoginInput = z.infer<typeof loginSchema>;
