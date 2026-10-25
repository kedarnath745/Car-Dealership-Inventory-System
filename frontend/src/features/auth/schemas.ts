import { z } from 'zod';

/** Mirrors the API rules (DESIGN §4, D23) so most mistakes are caught before a request. */
export const MIN_PASSWORD_LENGTH = 15;

const email = z
  .string()
  .trim()
  .min(1, 'Enter your email address')
  .pipe(z.email('Enter a valid email address'));

export const loginSchema = z.object({
  email,
  password: z.string().min(1, 'Enter your password'),
});

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, 'Enter your name (at least 2 characters)')
    .max(60, 'Name must be at most 60 characters'),
  email,
  password: z
    .string()
    .min(MIN_PASSWORD_LENGTH, `Password must be at least ${MIN_PASSWORD_LENGTH} characters`)
    .max(72, 'Password must be at most 72 characters'),
});

export type LoginValues = z.infer<typeof loginSchema>;
export type RegisterValues = z.infer<typeof registerSchema>;
