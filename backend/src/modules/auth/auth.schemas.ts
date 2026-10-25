import { z } from 'zod';

/** bcrypt only uses the first 72 bytes of a password, so longer ones are rejected. */
const password = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .max(72, 'Password must be at most 72 characters');

const email = z.string().trim().toLowerCase().pipe(z.email('Invalid email address'));

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
