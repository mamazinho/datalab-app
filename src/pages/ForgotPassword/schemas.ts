import { z } from 'zod';
import { emailSchema } from '../../schemas/email';

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
