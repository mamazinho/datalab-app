import { z } from 'zod';
import { passwordSchema } from '../../schemas/password';
import { emailSchema } from '../../schemas/email';
import { optionalPhoneSchema } from '../../schemas/phone';
import { uuidSchema } from '../../schemas/uuid';

export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'O nome deve ter mais de 2 caracteres.')
    .regex(/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/, 'O nome deve conter apenas letras.'),
  email: emailSchema,
  phone_number: optionalPhoneSchema,
  password: z
    .string()
    .trim()
    .min(1, 'A senha é obrigatória.'),
  confirmPassword: z
    .string()
    .trim()
    .min(1, 'A confirmação de senha é obrigatória.'),
}).superRefine(({ password, confirmPassword }, context) => {
  const passwordValidation = passwordSchema.safeParse(password);
  if (!passwordValidation.success) {
    for (const issue of passwordValidation.error.issues) {
      context.addIssue({
        code: 'custom',
        path: ['password'],
        message: issue.message,
      });
    }
  }

  if (password !== confirmPassword) {
    context.addIssue({
      code: 'custom',
      path: ['confirmPassword'],
      message: 'As senhas nao coincidem.',
    });
  }
});

export const confirmAccountSchema = z.object({
  userId: uuidSchema,
  code: z
    .string()
    .trim()
    .length(6, 'O código deve ter exatamente 6 caracteres.')
    .regex(/^\d+$/, 'O código deve conter apenas números.'),
});