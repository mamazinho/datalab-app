import { z } from 'zod';

export const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+\d{1,31}$/, 'Telefone deve comecar com + e conter apenas numeros (maximo de 32 caracteres).');

export const optionalPhoneSchema = phoneSchema.optional().or(z.literal(''));
