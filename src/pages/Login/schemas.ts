import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'O e-mail é obrigatório.')
    .email('O e-mail deve ser em um formato válido.'),
  password: z
    .string()
    .trim()
    .min(1, 'A senha é obrigatória.'),
});