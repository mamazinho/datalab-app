import { z } from 'zod';
import { isUuid7, type UUID7 } from '../../../types/ids';
import type {
  ICreateMcpServerRequest,
  McpAuthType,
  McpTransport,
} from '../../../services/datalab-api/mcpServersResource';

export const AUTH_TYPE_LABELS: Record<McpAuthType, string> = {
  none: 'Nenhuma',
  bearer: 'Bearer token',
  static_header: 'Header personalizado',
};

export const TRANSPORT_LABELS: Record<McpTransport, string> = {
  streamable_http: 'Streamable HTTP',
  sse: 'SSE',
};

export const mcpServerSchema = z
  .object({
    agent_id: z.custom<UUID7>(isUuid7, 'Selecione o agente'),
    name: z.string().trim().min(2, 'O nome precisa ter ao menos 2 caracteres'),
    url: z.string().trim().regex(/^https?:\/\/\S+$/, 'Informe uma URL válida (http/https)'),
    transport: z.enum(['streamable_http', 'sse']),
    auth_type: z.enum(['none', 'bearer', 'static_header']),
    token: z.string().trim().default(''),
    header_name: z.string().trim().default(''),
    header_value: z.string().trim().default(''),
  })
  .transform(({ auth_type, token, header_name, header_value, ...server }): ICreateMcpServerRequest => ({
    ...server,
    auth:
      auth_type === 'bearer' ? { type: auth_type, token }
      : auth_type === 'static_header' ? { type: auth_type, header_name, header_value }
      : { type: auth_type },
  }));
