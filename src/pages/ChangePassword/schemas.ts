import { z } from 'zod';
import { passwordSchema } from '../../schemas/password';

export const changePasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Link inválido (email ausente).')
    .email('Link inválido (email incorreto).'),
  code: z
    .string()
    .trim()
    .min(1, 'Link inválido (código ausente).'),
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
      message: 'As senhas não coincidem.',
    });
  }
});