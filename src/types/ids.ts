import { validate, version } from 'uuid';

export type UUID7 = `${string}-${string}-${string}-${string}-${string}`;

export const isUuid7 = (value: unknown): value is UUID7 =>
  validate(value) && version(value as string) === 7;
