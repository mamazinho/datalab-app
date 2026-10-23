import { z } from 'zod';

export const createChatSchema = z.object({
  title: z.string().trim().min(1, 'O título do chat é obrigatório'),
  is_private: z.stringbool().default(false),
});
