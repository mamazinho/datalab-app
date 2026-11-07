import modal from '../../../../styles/modal-form.module.css';
import mcpServersStyles from '../mcp-servers.module.css';
import { useActionState, useState } from 'react';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Collapsible } from '../../../../components/UI/Collapsible';
import { Modal } from '../../../../components/UI/Modal/modal';
import { QueryBoundary } from '../../../../components/Tools/query-boundary';
import { PermissionGate } from '../../../../components/Tools/permission-gate';
import { useActionFeedback } from '../../../../hooks/use-action-feedback';
import { useAgents } from '../../../../hooks/use-agents';
import { mcpServersQuery } from '../../../../queries';
import type { IRetrieveMcpServer } from '../../../../services/datalab-api/mcpServersResource';
import { INITIAL_ACTION_STATE } from '../../../../types/actions';
import { ApiError } from '../../../../utils/api-error';
import { MCP_SERVER_ROUTE_PERMISSIONS } from '../../../../utils/route-permissions';
import { createSaveMcpServerAction, testMcpServerConnection } from '../actions';
import { AUTH_TYPE_LABELS, TRANSPORT_LABELS } from '../schemas';
import { FormFieldset, SubmitButton } from '../../../../components/UI/Forms';

const SAVED_SECRET_PLACEHOLDER = '•••• configurado — deixe em branco para manter';

interface IMcpServerFormProps {
  mcpServer: IRetrieveMcpServer | null;
  onClose: () => void;
}

const McpServerForm = ({ mcpServer, onClose }: IMcpServerFormProps) => {
  const isEditing = mcpServer !== null;
  const { data: agents } = useAgents();
  const queryClient = useQueryClient();
  const boundAction = createSaveMcpServerAction(mcpServer);
  const [formState, formAction] = useActionState(boundAction, INITIAL_ACTION_STATE);
  const connectionTest = useMutation({ mutationFn: testMcpServerConnection });
  const [agentId, setAgentId] = useState(mcpServer?.agent_id ?? '');
  const [authType, setAuthType] = useState<string>(mcpServer?.auth_type ?? 'none');
  const [headerName, setHeaderName] = useState(mcpServer?.auth_header_name ?? '');

  useActionFeedback(formState, {
    onSuccess: () => {
      toast.success(isEditing ? 'Servidor MCP atualizado.' : 'Servidor MCP adicionado.');
      void queryClient.invalidateQueries({ queryKey: mcpServersQuery.queryKey });
      onClose();
    },
    onError: () => {},
  });

  const customAgents = agents.filter((agent) => !agent.is_system);
  const keepsSavedSecret =
    isEditing && authType === mcpServer.auth_type && headerName === (mcpServer.auth_header_name ?? '');
  const secretPlaceholder = keepsSavedSecret ? SAVED_SECRET_PLACEHOLDER : undefined;
  const toolNames = connectionTest.data?.tools.map((tool) => tool.name).join(', ');

  return (
    <form className={modal.form} action={formAction} onChange={() => connectionTest.reset()}>
      <FormFieldset className={modal.fieldset}>
        <div className={modal.field}>
          <label className={modal.label} htmlFor="mcp-agent">Agente *</label>
          <select className={modal.select}
            id="mcp-agent"
            name="agent_id"
            value={agentId}
            onChange={(e) => setAgentId(e.target.value)}
            required
            autoFocus
          >
            <option value="" disabled>Selecione um agente</option>
            {customAgents.map((agent) => (
              <option key={agent.id} value={agent.id}>{agent.name}</option>
            ))}
          </select>
          {customAgents.length === 0 && (
            <p className={modal.hint}>Crie um agente na aba Agentes para vincular um servidor MCP.</p>
          )}
        </div>

        <FormFieldset className={modal.fieldset} disabled={!agentId}>
          <div className={modal.field}>
            <label className={modal.label} htmlFor="mcp-name">Nome *</label>
            <input className={modal.input}
              id="mcp-name"
              name="name"
              type="text"
              autoComplete="off"
              placeholder="Ex: CRM interno"
              defaultValue={mcpServer?.name ?? ''}
              required
            />
          </div>

          <div className={modal.field}>
            <label className={modal.label} htmlFor="mcp-url">URL *</label>
            <input className={modal.input}
              id="mcp-url"
              name="url"
              type="url"
              autoComplete="off"
              placeholder="https://mcp.suaempresa.com/mcp"
              defaultValue={mcpServer?.url ?? ''}
              aria-describedby="mcp-url-hint"
              required
            />
            <p className={modal.hint} id="mcp-url-hint">
              Precisa ser acessível pela internet. Para usar um MCP da sua máquina, exponha-o com um túnel (ex.: ngrok).
            </p>
          </div>

          <div className={modal.field}>
            <label className={modal.label} htmlFor="mcp-auth-type">Autenticação</label>
            <select className={modal.select}
              id="mcp-auth-type"
              name="auth_type"
              value={authType}
              onChange={(e) => setAuthType(e.target.value)}
            >
              {Object.entries(AUTH_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>

          {authType === 'bearer' && (
            <div className={modal.field}>
              <label className={modal.label} htmlFor="mcp-token">Token</label>
              <input className={modal.input}
                id="mcp-token"
                name="token"
                type="password"
                autoComplete="new-password"
                placeholder={secretPlaceholder}
                required={!keepsSavedSecret}
              />
            </div>
          )}

          {authType === 'static_header' && (
            <>
              <div className={modal.field}>
                <label className={modal.label} htmlFor="mcp-header-name">Nome do header</label>
                <input className={modal.input}
                  id="mcp-header-name"
                  name="header_name"
                  type="text"
                  autoComplete="off"
                  placeholder="Ex: X-Api-Key"
                  value={headerName}
                  onChange={(e) => setHeaderName(e.target.value)}
                  required
                />
              </div>

              <div className={modal.field}>
                <label className={modal.label} htmlFor="mcp-header-value">Valor do header</label>
                <input className={modal.input}
                  id="mcp-header-value"
                  name="header_value"
                  type="password"
                  autoComplete="new-password"
                  placeholder={secretPlaceholder}
                  required={!keepsSavedSecret}
                />
              </div>
            </>
          )}

          <Collapsible label="Opções avançadas" defaultOpen={mcpServer?.transport === 'sse'}>
            <div className={modal.field}>
              <label className={modal.label} htmlFor="mcp-transport">Transporte</label>
              <select className={modal.select} id="mcp-transport" name="transport" defaultValue={mcpServer?.transport ?? 'streamable_http'}>
                {Object.entries(TRANSPORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </Collapsible>

          <PermissionGate route={MCP_SERVER_ROUTE_PERMISSIONS.test}>
            <button className={mcpServersStyles.mcpTestButton}
              type="button"
              disabled={connectionTest.isPending}
              onClick={(event) => connectionTest.mutate(new FormData(event.currentTarget.form!))}
            >
              {connectionTest.isPending ? 'Testando...' : 'Testar conexão'}
            </button>
          </PermissionGate>
          {connectionTest.error && <p className={modal.error} role="alert">{ApiError.from(connectionTest.error).friendly_message}</p>}
          {connectionTest.data && (
            <p className={mcpServersStyles.mcpTestSuccess} role="status">Conexão OK — tools: {toolNames || 'nenhuma'}</p>
          )}
        </FormFieldset>

        {formState.error && !formState.success && <p className={modal.error}>{formState.error}</p>}

        <SubmitButton className={modal.submit} disabled={!agentId} pendingLabel="Salvando...">
          {isEditing ? 'Salvar alterações' : 'Adicionar servidor'}
        </SubmitButton>
      </FormFieldset>
    </form>
  );
};

interface IMcpServerFormModalProps {
  isOpen: boolean;
  mcpServer: IRetrieveMcpServer | null;
  onClose: () => void;
}

export const McpServerFormModal = ({ isOpen, mcpServer, onClose }: IMcpServerFormModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={mcpServer !== null ? `Editar MCP: ${mcpServer.name}` : 'Adicionar servidor MCP'}
  >
    <QueryBoundary>
      <McpServerForm mcpServer={mcpServer} onClose={onClose} />
    </QueryBoundary>
  </Modal>
);
