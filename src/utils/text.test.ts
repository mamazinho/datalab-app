import { describe, expect, it } from 'vitest';
import { truncateText } from './text';

describe('truncateText', () => {
  it('returns the text untouched when it fits the limit', () => {
    expect(truncateText('Cuida de anúncios', 17)).toBe('Cuida de anúncios');
  });

  it('cuts at the limit and appends an ellipsis', () => {
    expect(truncateText('Cuida de anúncios', 5)).toBe('Cuida…');
  });

  it('does not leave a space before the ellipsis', () => {
    expect(truncateText('Cuida de anúncios', 6)).toBe('Cuida…');
  });
});
