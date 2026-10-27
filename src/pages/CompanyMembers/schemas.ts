import { z } from 'zod';
import { emailSchema } from '../../schemas/email';
import { uuidSchema } from '../../schemas/uuid';

export const inviteMembersSchema = z.object({
  emails: z.array(emailSchema).min(1, 'Adicione ao menos um e-mail.'),
  permissions: z.array(uuidSchema),
  provider_permissions: z.array(uuidSchema),
});
