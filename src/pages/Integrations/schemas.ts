import { z } from 'zod';

// A allowlist é editada item a item: o form envia os external_ids marcados e a
// action difere contra o que já estava salvo (POST dos novos, DELETE dos que
// saíram). Lista vazia é válida — significa "esta empresa não opera nada aqui".
export const saveProviderAssetsSchema = z.object({
  external_ids: z.array(z.string().min(1)),
});
