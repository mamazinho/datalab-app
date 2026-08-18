// IDs do backend são UUIDv4 — mesmo shape do retorno de crypto.randomUUID()
export type UUID = `${string}-${string}-${string}-${string}-${string}`;

const UUID_V4_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export const isUuid = (value: string | null | undefined): value is UUID =>
  !!value && UUID_V4_REGEX.test(value);
