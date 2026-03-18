import { z } from 'zod';

export const PASSWORD_MIN_LENGTH = 8;
export const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
export const PASSWORD_SYMBOL_REGEX = /[^A-Za-z0-9]/;

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, `A senha deve ter no minimo ${PASSWORD_MIN_LENGTH} caracteres.`)
  .regex(PASSWORD_UPPERCASE_REGEX, 'A senha deve conter pelo menos uma letra maiuscula.')
  .regex(PASSWORD_SYMBOL_REGEX, 'A senha deve conter pelo menos um simbolo.');

export interface PasswordRuleStatus {
  minLength: boolean;
  hasUppercase: boolean;
  hasSymbol: boolean;
}

export const getPasswordRuleStatus = (password: string): PasswordRuleStatus => ({
  minLength: password.length >= PASSWORD_MIN_LENGTH,
  hasUppercase: PASSWORD_UPPERCASE_REGEX.test(password),
  hasSymbol: PASSWORD_SYMBOL_REGEX.test(password),
});
