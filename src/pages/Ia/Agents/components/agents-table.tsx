import iaStyles from '../../ia.module.css';
import styles from '../agents.module.css';
import { TruncatedText } from '../../../../components/UI/TruncatedText';
import { Avatar } from '../../../../components/UI/Avatar';
import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { ActionTable, TableAction, TableActions, TableHeaders, TableRow } from '../../../../components/UI/Tables/ActionTable';
import { DatalabAPI } from '../../../../services/datalab-api';
import type { IRetrieveAgentWithState } from '../../../../services/datalab-api/agentsResource';
import type { UUID7 } from '../../../../types/ids';
import { useCompanyContext } from '../../../../contexts/company';
import { AGENT_ROUTE_PERMISSIONS } from '../../../../utils/route-permissions';
import { agentsQuery } from '../../../../queries';

interface IAgentsTableProps {
  agents: IRetrieveAgentWithState[];
  onEdit: (agent: IRetrieveAgentWithState) => void;
}

const renderStatusBadge = (agent: IRetrieveAgentWithState) =>
  agent.disabled_by_company ? (
    <span className={styles.agentBadge} data-variant="company-disabled">Desativado pela empresa</span>
  ) : agent.disabled_by_user ? (
    <span className={styles.agentBadge} data-variant="user-disabled">Desativado por você</span>
  ) : agent.is_enabled ? (
    <span className={styles.agentBadge} data-variant="active">Ativo</span>
  ) : (
    <span className={styles.agentBadge} data-variant="user-disabled">Inativo</span>
  );

export const AgentsTable = ({ agents, onEdit }: IAgentsTableProps) => {
  const { currentCompany, hasPermissionByRoute } = useCompanyContext();
  const queryClient = useQueryClient();
  const [removingId, setRemovingId] = useState<UUID7 | null>(null);
  const [togglingId, setTogglingId] = useState<UUID7 | null>(null);

  const invalidateAgents = useCallback(
    () => void queryClient.invalidateQueries({ queryKey: agentsQuery.queryKey }),
    [queryClient],
  );

  const canUpdate = hasPermissionByRoute(AGENT_ROUTE_PERMISSIONS.update);
  const canRemove = hasPermissionByRoute(AGENT_ROUTE_PERMISSIONS.remove);
  const canToggleCompany = hasPermissionByRoute(AGENT_ROUTE_PERMISSIONS.companyState);

  const handleDelete = useCallback(async (agent: IRetrieveAgentWithState) => {
    if (!window.confirm(`Excluir o agente "${agent.name}"? Essa ação não pode ser desfeita.`)) return;
    setRemovingId(agent.id);
    try {
      await DatalabAPI.AgentsResource.deleteSpecialist(agent.id);
      toast.success('Agente excluído.');
      invalidateAgents();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao excluir o agente.');
    } finally {
      setRemovingId(null);
    }
  }, [invalidateAgents]);

  const handleCompanyToggle = useCallback(async (agent: IRetrieveAgentWithState) => {
    const enable = agent.disabled_by_company;
    setTogglingId(agent.id);
    try {
      await DatalabAPI.AgentsResource.setCompanyState(agent.id, enable);
      toast.success(enable ? 'Agente ativado para a empresa.' : 'Agente desativado para a empresa.');
      invalidateAgents();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao alterar o estado do agente.');
    } finally {
      setTogglingId(null);
    }
  }, [invalidateAgents]);

  const handleUserToggle = useCallback(async (agent: IRetrieveAgentWithState) => {
    const enable = agent.disabled_by_user;
    setTogglingId(agent.id);
    try {
      await DatalabAPI.AgentsResource.setUserState(agent.id, enable);
      toast.success(enable ? 'Agente ativado para você.' : 'Agente desativado para você.');
      invalidateAgents();
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao alterar o estado do agente.');
    } finally {
      setTogglingId(null);
    }
  }, [invalidateAgents]);

  if (agents.length === 0) {
    return <p className={iaStyles.emptyMessage}>Nenhum agente encontrado.</p>;
  }

  return (
    <ActionTable>
      <TableHeaders>
        <th>Agente</th>
        <th>Descrição</th>
        <th>Modelo</th>
        <th>Status</th>
        <th>Gerenciado por</th>
      </TableHeaders>

      {agents.map((agent) => {
        const isBusy = removingId === agent.id || togglingId === agent.id;
        const canEditAgent = canUpdate && !agent.is_system;
        const canDeleteAgent = canRemove && !agent.is_system;

        return (
          <TableRow key={agent.id}>
            <td>
              <div className={styles.agentCell}>
                <Avatar className={styles.agentAvatar} src={agent.avatar_url} name={agent.name} seed="initial" alt="" />
                <div className={styles.agentIdentity}>
                  <span className={styles.agentName}>{agent.name}</span>
                  <span className={styles.agentKey}>{agent.key}</span>
                </div>
              </div>
            </td>
            <td>
              <TruncatedText className={styles.agentDescription} text={agent.description} lines={3} />
            </td>
            <td>
              <span className={styles.agentModel}>{agent.model_name || '—'}</span>
            </td>
            <td>{renderStatusBadge(agent)}</td>
            <td>
              {agent.is_system ? (
                <span className={styles.agentBadge} data-variant="system">Sistema</span>
              ) : (
                <span className={styles.agentOwner}>{currentCompany?.name ?? '—'}</span>
              )}
            </td>
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
