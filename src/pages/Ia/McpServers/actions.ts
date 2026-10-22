import { DatalabAPI } from '../../../services/datalab-api';
import type { IMcpServerAuth, IRetrieveMcpServer } from '../../../services/datalab-api/mcpServersResource';
import { createFormAction } from '../../../utils/create-form-action';
import { mcpServerSchema } from './schemas';

const hasBlankSecret = (auth: IMcpServerAuth) =>
  (auth.type === 'bearer' && !auth.token) || (auth.type === 'static_header' && !auth.header_value);

export const createSaveMcpServerAction = (mcpServer: IRetrieveMcpServer | null) =>
  createFormAction(
    mcpServerSchema,
    (payload) => {
      if (mcpServer === null) return DatalabAPI.McpServersResource.createMcpServer(payload);

      const keepsSavedAuth = payload.auth.type === mcpServer.auth_type && hasBlankSecret(payload.auth);
      return DatalabAPI.McpServersResource.updateMcpServer(mcpServer.id, {
        ...payload,
        auth: keepsSavedAuth ? undefined : payload.auth,
      });
    },
    { errorPrefix: 'Falha ao salvar o servidor MCP: ' },
  );

export const testMcpServerConnection = async (formData: FormData) => {
  const parsed = mcpServerSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) throw new Error(parsed.error.issues[0].message);
  if (hasBlankSecret(parsed.data.auth)) throw new Error('Informe a credencial para testar a conexão.');

  const result = await DatalabAPI.McpServersResource.testMcpServer(parsed.data);
  if (!result.ok) throw new Error(result.error ?? 'Não foi possível conectar ao servidor MCP.');
  return result;
};
