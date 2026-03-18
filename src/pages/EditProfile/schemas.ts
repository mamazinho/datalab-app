import { z } from 'zod';
import { passwordSchema } from '../../schemas/password';

const THEME_SCHEMA = z.enum(['light', 'dark', 'system']);

export const editProfileFormSchema = z
  .object({
    name: z.string().trim().min(2, 'Nome deve ter no minimo 2 letras.').default(''),
    phone_number: z
      .string()
      .trim()
      .regex(/^\+\d{1,31}$/, 'Telefone deve comecar com + e conter apenas numeros (maximo de 32 caracteres).')
      .default(''),
    avatar_url: z.string().default(''),
    theme: THEME_SCHEMA.nullable().default(null),
    password: z.string().trim().default(''),
    confirmPassword: z.string().trim().default(''),
  })
  .superRefine(({ password, confirmPassword }, context) => {
    const shouldValidatePassword = Boolean(password) || Boolean(confirmPassword);

    if (!shouldValidatePassword) {
      return;
    }

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

export type EditProfileFormValues = z.infer<typeof editProfileFormSchema>;
