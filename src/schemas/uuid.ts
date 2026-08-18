import { z } from 'zod';
import type { UUID } from '../types/ids';

export const uuidSchema = z
  .uuid('Identificador inválido.')
  .transform((value) => value as UUID);
