import iaStyles from '../../ia.module.css';
import styles from '../agents.module.css';
import { TruncatedText } from '../../../../components/UI/TruncatedText';
import { Avatar } from '../../../../components/UI/Avatar';
import { ActionTable, TableAction, TableActions, TableHeaders, TableRow } from '../../../../components/UI/Tables/ActionTable';
import { DatalabAPI } from '../../../../services/datalab-api';
import type { IRetrieveAgentWithState } from '../../../../services/datalab-api/agentsResource';
import { useCompanyContext } from '../../../../contexts/company';
import { useConfirm } from '../../../../contexts/confirm';
import { AGENT_ROUTE_PERMISSIONS } from '../../../../utils/route-permissions';
import { agentsQuery } from '../../../../queries';
import { useRowActions } from '../../../../hooks/use-row-actions';

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

// Same rule the API applies: an agent runs unless the company or the user turned it off
const withState = (
  agent: IRetrieveAgentWithState,
  state: Partial<Pick<IRetrieveAgentWithState, 'disabled_by_company' | 'disabled_by_user'>>,
): IRetrieveAgentWithState => {
  const next = { ...agent, ...state };
  return { ...next, is_enabled: !(next.disabled_by_company || next.disabled_by_user) };
};

export const AgentsTable = ({ agents, onEdit }: IAgentsTableProps) => {
  const { currentCompany, hasPermissionByRoute } = useCompanyContext();
  const confirm = useConfirm();
  const { rows, busyId, run } = useRowActions(agentsQuery.queryKey, agents);

  const canUpdate = hasPermissionByRoute(AGENT_ROUTE_PERMISSIONS.update);
  const canRemove = hasPermissionByRoute(AGENT_ROUTE_PERMISSIONS.remove);
  const canToggleCompany = hasPermissionByRoute(AGENT_ROUTE_PERMISSIONS.companyState);

  const handleDelete = async (agent: IRetrieveAgentWithState) => {
    const confirmed = await confirm({
      title: 'Excluir agente',
      message: `Excluir o agente "${agent.name}"? Essa ação não pode ser desfeita.`,
      confirmLabel: 'Excluir',
    });
    if (!confirmed) return;
    run({
      id: agent.id,
      request: () => DatalabAPI.AgentsResource.deleteSpecialist(agent.id),
      successMessage: 'Agente excluído.',
      optimistic: null,
    });
  };

  const handleCompanyToggle = (agent: IRetrieveAgentWithState) => {
    const enable = agent.disabled_by_company;
    run({
      id: agent.id,
      request: () => DatalabAPI.AgentsResource.setCompanyState(agent.id, enable),
      successMessage: enable ? 'Agente ativado para a empresa.' : 'Agente desativado para a empresa.',
      optimistic: withState(agent, { disabled_by_company: !enable }),
    });
  };

  const handleUserToggle = (agent: IRetrieveAgentWithState) => {
    const enable = agent.disabled_by_user;
    run({
      id: agent.id,
      request: () => DatalabAPI.AgentsResource.setUserState(agent.id, enable),
      successMessage: enable ? 'Agente ativado para você.' : 'Agente desativado para você.',
      optimistic: withState(agent, { disabled_by_user: !enable }),
    });
  };

  if (rows.length === 0) {
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

      {rows.map((agent) => {
        const isBusy = busyId === agent.id;
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
                  <TableAction disabled={isBusy} onClick={() => handleCompanyToggle(agent)}>
                    {agent.disabled_by_company ? 'Ativar para a empresa' : 'Desativar para a empresa'}
                  </TableAction>
                )}
                <TableAction disabled={isBusy} onClick={() => handleUserToggle(agent)}>
                  {agent.disabled_by_user ? 'Ativar para você' : 'Desativar para você'}
                </TableAction>
                {canDeleteAgent && (
                  <TableAction disabled={isBusy} onClick={() => void handleDelete(agent)}>
                    Excluir
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
