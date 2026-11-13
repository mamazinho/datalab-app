import { z } from 'zod';
import type { PageKind } from '../../services/datalab-api/trackingResource';

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


const containerId = z
  .string()
  .trim()
  .toUpperCase()
  .regex(/^GTM-[A-Z0-9]{4,10}$/, 'Informe o código do contêiner no formato GTM-XXXXXXX.');

export const PAGE_KINDS: Array<{ kind: PageKind; label: string; hint: string }> = [
  { kind: 'home', label: 'Página inicial', hint: 'https://www.loja.com.br' },
  { kind: 'category', label: 'Categoria ou busca', hint: 'Uma página com lista de produtos' },
  { kind: 'product', label: 'Produto', hint: 'Uma página de produto' },
  { kind: 'cart', label: 'Carrinho', hint: 'A página do carrinho' },
  { kind: 'checkout', label: 'Checkout', hint: 'A primeira etapa do checkout' },
  { kind: 'confirmation', label: 'Confirmação do pedido', hint: 'A página de pedido concluído, se abrir sem compra' },
];

export const validateImplementationSchema = z.object({
  container_id: containerId,
  pages: z
    .array(z.object({ kind: z.enum(['home', 'category', 'product', 'cart', 'checkout', 'confirmation']), url: z.string() }))
    .min(1, 'Informe ao menos a página inicial.'),
});

export const verifyPublicationSchema = z.object({ container_id: containerId });

export const importHelpSchema = z.object({
  kind: z.string().min(1, 'Escolha o tipo de problema.'),
  message: z.string().trim().max(2000, 'Cole até 2.000 caracteres da mensagem.'),
});

export const ANTI_BOT_MESSAGE =
  'Seu site tem proteção anti-robô e não pôde ser mapeado automaticamente. Você pode continuar informando os dados manualmente ou liberar nosso leitor no firewall.';
