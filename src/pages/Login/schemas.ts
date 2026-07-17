import { z } from 'zod';
import { emailSchema } from '../../schemas/email';

export const loginSchema = z.object({
  email: emailSchema,
  password: z
    .string()
    .trim()
    .min(1, 'A senha é obrigatória.'),
});
