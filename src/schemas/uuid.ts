import { z } from 'zod';
import { isUuid7, type UUID7 } from '../types/ids';

export const uuidSchema = z.custom<UUID7>(isUuid7, 'Identificador inválido.');
