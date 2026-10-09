import { describe, expect, it } from 'vitest';
import { v4, v7 } from 'uuid';
import { isUuid7 } from './ids';

describe('isUuid', () => {
  it('accepts a UUIDv7', () => {
    expect(isUuid7(v7())).toBe(true);
  });

  it.each([
    ['a UUIDv4', v4()],
    ['a malformed id', 'nao-e-uuid'],
    ['an empty string', ''],
    ['null', null],
    ['undefined', undefined],
  ])('rejects %s', (_, value) => {
    expect(isUuid7(value)).toBe(false);
  });
});
