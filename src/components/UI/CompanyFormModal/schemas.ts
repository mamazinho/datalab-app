import { z } from 'zod';

// Mesmo shape para criar e editar o nome da empresa.
export const companyNameSchema = z.object({
  name: z.string().trim().min(2, 'O nome da empresa deve ter pelo menos 2 caracteres.'),
});
