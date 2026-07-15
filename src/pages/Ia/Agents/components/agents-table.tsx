import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { ActionTable, TableAction, TableActions, TableHeaders, TableRow } from '../../../../components/UI/Tables/ActionTable';
import { DatalabAPI } from '../../../../services/datalab-api';
import type { IRetrieveAgentWithState } from '../../../../services/datalab-api/agentsResource';
import { useCompanyContext } from '../../../../contexts/company';
import { AGENT_ROUTE_PERMISSIONS } from '../../../../utils/route-permissions';
import {
  AgentAvatar,
  AgentBadge,
  AgentBadges,
  AgentCell,
  AgentDescription,
  AgentIdentity,
  AgentKey,
  AgentModel,
  AgentName,
  AgentsEmpty,
} from '../agents.style';

interface IAgentsTableProps {
  agents: IRetrieveAgentWithState[];
  onEdit: (agent: IRetrieveAgentWithState) => void;
  onRefresh: () => Promise<void>;
}

const getAvatarUrl = (agent: IRetrieveAgentWithState): string => {
  if (agent.avatar_url) return agent.avatar_url;

  const seed = agent.name.trim()[0] ?? 'A';
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(seed)}&background=FFBE00&color=00001F&bold=true&format=png&size=64`;
};

const renderStatusBadges = (agent: IRetrieveAgentWithState) => (
  <AgentBadges>
    {agent.is_system && <AgentBadge $variant="system">Sistema</AgentBadge>}
    {agent.disabled_by_company ? (
      <AgentBadge $variant="company-disabled">Desativado pela empresa</AgentBadge>
    ) : agent.disabled_by_user ? (
      <AgentBadge $variant="user-disabled">Desativado por você</AgentBadge>
    ) : agent.is_enabled ? (
      <AgentBadge $variant="active">Ativo</AgentBadge>
    ) : (
      <AgentBadge $variant="user-disabled">Inativo</AgentBadge>
    )}
  </AgentBadges>
);

export const AgentsTable = ({ agents, onEdit, onRefresh }: IAgentsTableProps) => {
  const { hasPermissionByRoute } = useCompanyContext();
  const [removingId, setRemovingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const canUpdate = hasPermissionByRoute(AGENT_ROUTE_PERMISSIONS.update);
  const canRemove = hasPermissionByRoute(AGENT_ROUTE_PERMISSIONS.remove);
  const canToggleCompany = hasPermissionByRoute(AGENT_ROUTE_PERMISSIONS.companyState);

  const handleDelete = useCallback(async (agent: IRetrieveAgentWithState) => {
    if (!window.confirm(`Excluir o agente "${agent.name}"? Essa ação não pode ser desfeita.`)) return;
    setRemovingId(agent.id);
    try {
      await DatalabAPI.AgentsResource.deleteSpecialist(agent.id);
      toast.success('Agente excluído.');
      await onRefresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao excluir o agente.');
    } finally {
      setRemovingId(null);
    }
  }, [onRefresh]);

  const handleCompanyToggle = useCallback(async (agent: IRetrieveAgentWithState) => {
    const enable = agent.disabled_by_company;
    setTogglingId(agent.id);
    try {
      await DatalabAPI.AgentsResource.setCompanyState(agent.id, enable);
      toast.success(enable ? 'Agente ativado para a empresa.' : 'Agente desativado para a empresa.');
      await onRefresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao alterar o estado do agente.');
    } finally {
      setTogglingId(null);
    }
  }, [onRefresh]);

  const handleUserToggle = useCallback(async (agent: IRetrieveAgentWithState) => {
    const enable = agent.disabled_by_user;
    setTogglingId(agent.id);
    try {
      await DatalabAPI.AgentsResource.setUserState(agent.id, enable);
      toast.success(enable ? 'Agente ativado para você.' : 'Agente desativado para você.');
      await onRefresh();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao alterar o estado do agente.');
    } finally {
      setTogglingId(null);
    }
  }, [onRefresh]);

  if (agents.length === 0) {
    return <AgentsEmpty>Nenhum agente encontrado.</AgentsEmpty>;
  }

  return (
    <ActionTable>
      <TableHeaders>
        <th>Agente</th>
        <th>Descrição</th>
        <th>Modelo</th>
        <th>Status</th>
      </TableHeaders>

      {agents.map((agent) => {
        const isBusy = removingId === agent.id || togglingId === agent.id;
        const canEditAgent = canUpdate && !agent.is_system;
        const canDeleteAgent = canRemove && !agent.is_system;

        return (
          <TableRow key={agent.id}>
            <td>
              <AgentCell>
                <AgentAvatar src={getAvatarUrl(agent)} alt="" />
                <AgentIdentity>
                  <AgentName>{agent.name}</AgentName>
                  <AgentKey>{agent.key}</AgentKey>
                </AgentIdentity>
              </AgentCell>
            </td>
            <td>
              <AgentDescription title={agent.description}>
                {agent.description || '—'}
              </AgentDescription>
            </td>
            <td>
              <AgentModel>{agent.model_name || '—'}</AgentModel>
            </td>
            <td>{renderStatusBadges(agent)}</td>
            <td>
              <TableActions>
                {canEditAgent && (
                  <TableAction disabled={isBusy} onClick={() => onEdit(agent)}>
                    Editar
                  </TableAction>
                )}
                {canToggleCompany && (
                  <TableAction disabled={isBusy} onClick={() => void handleCompanyToggle(agent)}>
                    {agent.disabled_by_company ? 'Ativar para a empresa' : 'Desativar para a empresa'}
                  </TableAction>
                )}
                <TableAction disabled={isBusy} onClick={() => void handleUserToggle(agent)}>
                  {agent.disabled_by_user ? 'Ativar para você' : 'Desativar para você'}
                </TableAction>
                {canDeleteAgent && (
                  <TableAction disabled={isBusy} onClick={() => void handleDelete(agent)}>
                    {removingId === agent.id ? 'Excluindo...' : 'Excluir'}
                  </TableAction>
                )}
              </TableActions>
            </td>
          </TableRow>
        );
      })}
    </ActionTable>
  );
};
