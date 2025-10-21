import { z } from 'zod';

export const messageSchema = z.object({
  message: z.string().min(4, 'A mensagem precisa ter pelo menos 4 caracteres')
});

export type MessageInput = z.infer<typeof messageSchema>;