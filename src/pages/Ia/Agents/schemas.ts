import { z } from 'zod';

const agentFormBaseSchema = z.object({
  name: z.string().trim().min(1, 'O nome do agente é obrigatório'),
  avatar_url: z
    .string()
    .trim()
    .refine((value) => !value || /^https?:\/\/\S+$/.test(value), 'Informe uma URL válida (http/https)'),
  description: z.string().trim(),
  instructions: z.string().trim(),
  model_name: z.string().trim(),
});

export const createAgentSchema = agentFormBaseSchema.extend({
  instructions: z.string().trim().min(1, 'As instruções do agente são obrigatórias'),
});

// The API does not return the current instructions, so an empty field on edit keeps them
export const updateAgentSchema = agentFormBaseSchema;
