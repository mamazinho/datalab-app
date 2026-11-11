import { z } from 'zod';

export const scanSiteSchema = z.object({
  site_url: z.string().trim().min(1, 'Informe a URL do site a ser tagueado.'),
});

export const buildContainersSchema = z
  .object({
    client_name: z.string().trim(),
    tools: z.array(z.string().min(1)).min(1, 'Escolha ao menos uma ferramenta.'),
    server_side: z.boolean(),
    banner: z.enum(['opt_in', 'opt_out', 'region']),
    mode: z.enum(['advanced', 'basic']),
    has_cmp: z.boolean(),
    term_accepted: z.boolean(),
    ids: z.record(z.string(), z.string()),
    client_export: z.instanceof(File).optional(),
  })
  .refine((data) => data.has_cmp || data.term_accepted, {
    message: 'Sem banner de cookies, é preciso aceitar o termo de responsabilidade antes de gerar.',
    path: ['term_accepted'],
  });

export const BANNER_LABELS: Record<z.infer<typeof buildContainersSchema>['banner'], string> = {
  opt_in: 'Opt-in (tudo negado até aceitar)',
  opt_out: 'Opt-out (tudo concedido até recusar)',
  region: 'Por região (negado na Europa e no Reino Unido)',
};

export const MODE_LABELS: Record<z.infer<typeof buildContainersSchema>['mode'], string> = {
  advanced: 'Avançado (sinais sem cookies antes do aceite)',
  basic: 'Básico (tags do Google bloqueadas até o aceite)',
};

export const ID_FIELD_PREFIX = 'id:';
