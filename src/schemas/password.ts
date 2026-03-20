import { z } from 'zod';

const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_UPPERCASE_REGEX = /[A-Z]/;
const PASSWORD_SYMBOL_REGEX = /[^A-Za-z0-9]/;
const PASSWORD_NUMBER_REGEX = /[0-9]/;

const PASSWORD_MIN_LENGTH_MESSAGE = `A senha deve ter no minimo ${PASSWORD_MIN_LENGTH} caracteres.`;
const PASSWORD_UPPERCASE_MESSAGE = 'A senha deve conter pelo menos uma letra maiuscula.';
const PASSWORD_SYMBOL_MESSAGE = 'A senha deve conter pelo menos um simbolo.';
const PASSWORD_NUMBER_MESSAGE = 'A senha deve conter pelo menos um número.';

export const passwordSchema = z
  .string()
  .min(PASSWORD_MIN_LENGTH, PASSWORD_MIN_LENGTH_MESSAGE)
  .regex(PASSWORD_UPPERCASE_REGEX, PASSWORD_UPPERCASE_MESSAGE)
  .regex(PASSWORD_SYMBOL_REGEX, PASSWORD_SYMBOL_MESSAGE)
  .regex(PASSWORD_NUMBER_REGEX, PASSWORD_NUMBER_MESSAGE);

interface PasswordRulesResponse {
  valid: boolean;
  message: string;
}

interface PasswordRuleStatus {
  minLength: PasswordRulesResponse;
  hasUppercase: PasswordRulesResponse;
  hasSymbol: PasswordRulesResponse;
  hasNumber: PasswordRulesResponse;
}

export const getPasswordRuleStatus = (password: string): PasswordRuleStatus => ({
  minLength: {
    valid: password.length >= PASSWORD_MIN_LENGTH,
    message: PASSWORD_MIN_LENGTH_MESSAGE,
  },
  hasUppercase: {
    valid: PASSWORD_UPPERCASE_REGEX.test(password),
    message: PASSWORD_UPPERCASE_MESSAGE,
  },
  hasSymbol: {
    valid: PASSWORD_SYMBOL_REGEX.test(password),
    message: PASSWORD_SYMBOL_MESSAGE,
  },
  hasNumber: {
    valid: PASSWORD_NUMBER_REGEX.test(password),
    message: PASSWORD_NUMBER_MESSAGE,
  },
});
