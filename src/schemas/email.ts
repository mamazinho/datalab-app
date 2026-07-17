import { z } from 'zod';

export const emailSchema = z
  .email('O e-mail deve ser em um formato válido.')
  .trim()
  .min(1, 'O e-mail é obrigatório.');
