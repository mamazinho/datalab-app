import { z } from 'zod';
import { emailSchema } from '../../schemas/email';

export const inviteMembersSchema = z.object({
  emails: z.array(emailSchema).min(1, 'Adicione ao menos um e-mail.'),
  permissions: z.array(z.coerce.number()),
});
