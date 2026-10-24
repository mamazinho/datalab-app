import styles from '../ia.module.css';
import { useState } from 'react';
import { QueryBoundary } from '../../../components/Tools/query-boundary';
import { useCompanyContext } from '../../../contexts/company';
import { useAgents } from '../../../hooks/use-agents';
import type { IRetrieveAgentWithState } from '../../../services/datalab-api/agentsResource';
import { AGENT_ROUTE_PERMISSIONS } from '../../../utils/route-permissions';
import { AgentsTable } from './components/agents-table';
import { AgentFormModal } from './components/agent-form-modal';

interface IAgentsListSectionProps {
  onEdit: (agent: IRetrieveAgentWithState) => void;
}

const AgentsListSection = ({ onEdit }: IAgentsListSectionProps) => {
  const { data: agents } = useAgents();

  return <AgentsTable agents={agents} onEdit={onEdit} />;
};

export const Agents = () => {
  const { currentCompany, hasPermissionByRoute } = useCompanyContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<IRetrieveAgentWithState | null>(null);

  const canCreate = hasPermissionByRoute(AGENT_ROUTE_PERMISSIONS.create);

  const openCreateModal = () => {
    setEditingAgent(null);
    setIsFormOpen(true);
  };

  const openEditModal = (agent: IRetrieveAgentWithState) => {
    setEditingAgent(agent);
    setIsFormOpen(true);
  };

  return (
    <div className={styles.pageContainer}>
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.pageTitle}>Agentes</h1>
          <p className={styles.pageSubtitle}>
            {currentCompany?.name} · Gerencie os agentes especialistas disponíveis no chat.
          </p>
        </div>
        <button className={styles.createButton}
          onClick={openCreateModal}
          disabled={!canCreate}
          title={canCreate ? undefined : 'Você não tem permissão para criar agentes'}
        >
          + Criar agente
        </button>
      </div>

      <QueryBoundary>
        <AgentsListSection onEdit={openEditModal} />
      </QueryBoundary>

      <AgentFormModal
        isOpen={isFormOpen}
        agent={editingAgent}
        onClose={() => setIsFormOpen(false)}
      />
    </div>
  );
};
