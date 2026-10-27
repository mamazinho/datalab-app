import { z } from 'zod';

// An empty list is valid: the company operates nothing in this integration
export const saveProviderAssetsSchema = z.object({
  external_ids: z.array(z.string().min(1)),
});
