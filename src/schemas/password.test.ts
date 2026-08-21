import { describe, expect, it } from 'vitest';
import { getPasswordRuleStatus, passwordSchema } from './password';

describe('passwordSchema', () => {
  it('accepts a password with length, uppercase, symbol and number', () => {
    expect(passwordSchema.safeParse('Senha@123').success).toBe(true);
  });

  it.each([
    ['too short', 'Ab@1'],
    ['without uppercase', 'senha@123'],
    ['without symbol', 'Senha1234'],
    ['without number', 'Senha@abc'],
  ])('rejects a password %s', (_case, password) => {
    expect(passwordSchema.safeParse(password).success).toBe(false);
  });

  it('reports the message of the broken rule', () => {
    const result = passwordSchema.safeParse('senha@123');

    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.message).toContain('maiuscula');
  });
});

describe('getPasswordRuleStatus', () => {
  it('marks every rule as valid for a complete password', () => {
    const status = getPasswordRuleStatus('Senha@123');

    expect(Object.values(status).every((rule) => rule.valid)).toBe(true);
  });

  it('pinpoints which rule failed, for the on-screen feedback', () => {
    const status = getPasswordRuleStatus('senha@123');

    expect(status.hasUppercase.valid).toBe(false);
    expect(status.minLength.valid).toBe(true);
    expect(status.hasSymbol.valid).toBe(true);
    expect(status.hasNumber.valid).toBe(true);
  });

  it('marks every rule as invalid for an empty password', () => {
    const status = getPasswordRuleStatus('');

    expect(Object.values(status).some((rule) => rule.valid)).toBe(false);
  });
});
