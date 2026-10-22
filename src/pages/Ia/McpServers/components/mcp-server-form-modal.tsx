import { useActionState, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Collapsible } from '../../../../components/UI/Collapsible';
import { Modal } from '../../../../components/UI/Modal/modal';
import { QueryBoundary } from '../../../../components/Tools/query-boundary';
import { useCompanyContext } from '../../../../contexts/company';
import { useActionFeedback } from '../../../../hooks/use-action-feedback';
import { useAgents } from '../../../../hooks/use-agents';
import { mcpServersQuery } from '../../../../queries';
import type { IRetrieveMcpServer } from '../../../../services/datalab-api/mcpServersResource';
import { INITIAL_ACTION_STATE } from '../../../../types/actions';
import { MCP_SERVER_ROUTE_PERMISSIONS } from '../../../../utils/route-permissions';
import { createSaveMcpServerAction, testMcpServerConnection } from '../actions';
import { AUTH_TYPE_LABELS, TRANSPORT_LABELS } from '../schemas';
import {
  ModalError,
  ModalField,
  ModalFieldset,
  ModalForm,
  ModalHint,
  ModalInput,
  ModalLabel,
  ModalSelect,
  ModalSubmit,
} from '../../ia.style';
import { McpTestButton, McpTestSuccess } from '../mcp-servers.style';

const SAVED_SECRET_PLACEHOLDER = '•••• configurado — deixe em branco para manter';

interface IMcpServerFormProps {
  mcpServer: IRetrieveMcpServer | null;
  onClose: () => void;
}

const McpServerForm = ({ mcpServer, onClose }: IMcpServerFormProps) => {
  const isEditing = mcpServer !== null;
  const { data: agents } = useAgents();
  const { hasPermissionByRoute } = useCompanyContext();
  const queryClient = useQueryClient();
  const boundAction = useMemo(() => createSaveMcpServerAction(mcpServer), [mcpServer]);
  const [formState, formAction, isPending] = useActionState(boundAction, INITIAL_ACTION_STATE);
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
    <ModalForm action={formAction} onChange={() => connectionTest.reset()}>
      <ModalFieldset disabled={isPending}>
        <ModalField>
          <ModalLabel htmlFor="mcp-agent">Agente *</ModalLabel>
          <ModalSelect
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
          </ModalSelect>
          {customAgents.length === 0 && (
            <ModalHint>Crie um agente na aba Agentes para vincular um servidor MCP.</ModalHint>
          )}
        </ModalField>

        <ModalFieldset disabled={!agentId}>
          <ModalField>
            <ModalLabel htmlFor="mcp-name">Nome *</ModalLabel>
            <ModalInput
              id="mcp-name"
              name="name"
              type="text"
              autoComplete="off"
              placeholder="Ex: CRM interno"
              defaultValue={mcpServer?.name ?? ''}
              required
            />
          </ModalField>

          <ModalField>
            <ModalLabel htmlFor="mcp-url">URL *</ModalLabel>
            <ModalInput
              id="mcp-url"
              name="url"
              type="url"
              autoComplete="off"
              placeholder="https://mcp.suaempresa.com/mcp"
              defaultValue={mcpServer?.url ?? ''}
              aria-describedby="mcp-url-hint"
              required
            />
            <ModalHint id="mcp-url-hint">
              Precisa ser acessível pela internet. Para usar um MCP da sua máquina, exponha-o com um túnel (ex.: ngrok).
            </ModalHint>
          </ModalField>

          <ModalField>
            <ModalLabel htmlFor="mcp-auth-type">Autenticação</ModalLabel>
            <ModalSelect
              id="mcp-auth-type"
              name="auth_type"
              value={authType}
              onChange={(e) => setAuthType(e.target.value)}
            >
              {Object.entries(AUTH_TYPE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </ModalSelect>
          </ModalField>

          {authType === 'bearer' && (
            <ModalField>
              <ModalLabel htmlFor="mcp-token">Token</ModalLabel>
              <ModalInput
                id="mcp-token"
                name="token"
                type="password"
                autoComplete="new-password"
                placeholder={secretPlaceholder}
                required={!keepsSavedSecret}
              />
            </ModalField>
          )}

          {authType === 'static_header' && (
            <>
              <ModalField>
                <ModalLabel htmlFor="mcp-header-name">Nome do header</ModalLabel>
                <ModalInput
                  id="mcp-header-name"
                  name="header_name"
                  type="text"
                  autoComplete="off"
                  placeholder="Ex: X-Api-Key"
                  value={headerName}
                  onChange={(e) => setHeaderName(e.target.value)}
                  required
                />
              </ModalField>

              <ModalField>
                <ModalLabel htmlFor="mcp-header-value">Valor do header</ModalLabel>
                <ModalInput
                  id="mcp-header-value"
                  name="header_value"
                  type="password"
                  autoComplete="new-password"
                  placeholder={secretPlaceholder}
                  required={!keepsSavedSecret}
                />
              </ModalField>
            </>
          )}

          <Collapsible label="Opções avançadas" defaultOpen={mcpServer?.transport === 'sse'}>
            <ModalField>
              <ModalLabel htmlFor="mcp-transport">Transporte</ModalLabel>
              <ModalSelect id="mcp-transport" name="transport" defaultValue={mcpServer?.transport ?? 'streamable_http'}>
                {Object.entries(TRANSPORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </ModalSelect>
            </ModalField>
          </Collapsible>

          {hasPermissionByRoute(MCP_SERVER_ROUTE_PERMISSIONS.test) && (
            <McpTestButton
              type="button"
              disabled={connectionTest.isPending}
              onClick={(event) => connectionTest.mutate(new FormData(event.currentTarget.form!))}
            >
              {connectionTest.isPending ? 'Testando...' : 'Testar conexão'}
            </McpTestButton>
          )}
          {connectionTest.error && <ModalError role="alert">{connectionTest.error.message}</ModalError>}
          {connectionTest.data && (
            <McpTestSuccess role="status">Conexão OK — tools: {toolNames || 'nenhuma'}</McpTestSuccess>
          )}
        </ModalFieldset>

        {formState.error && !formState.success && <ModalError>{formState.error}</ModalError>}

        <ModalSubmit type="submit" disabled={!agentId}>
          {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Adicionar servidor'}
        </ModalSubmit>
      </ModalFieldset>
    </ModalForm>
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
