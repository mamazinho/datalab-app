import { z } from 'zod';
import { emailSchema } from '../../schemas/email';
import { uuidSchema } from '../../schemas/uuid';

export const permissionSelectionSchema = z.object({
  route_permissions: z.array(uuidSchema),
  provider_permissions: z.array(uuidSchema),
});

export const inviteMembersSchema = permissionSelectionSchema.extend({
  emails: z.array(emailSchema).min(1, 'Adicione ao menos um e-mail.'),
});

export const updateMemberPermissionsSchema = permissionSelectionSchema.extend({
  membershipId: uuidSchema,
});
