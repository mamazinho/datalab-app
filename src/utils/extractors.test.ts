import { describe, expect, it } from 'vitest';
import { extractFirstName } from './extractors';

describe('extractFirstName', () => {
  it.each([
    ['Ana Maria Souza', 'Ana'],
    ['Ana', 'Ana'],
    ['  Ana Souza  ', 'Ana'],
  ])('turns %o into %o', (fullName, expected) => {
    expect(extractFirstName(fullName)).toBe(expected);
  });

  it('returns an empty string when there is no name', () => {
    expect(extractFirstName('')).toBe('');
    expect(extractFirstName('   ')).toBe('');
  });
});
