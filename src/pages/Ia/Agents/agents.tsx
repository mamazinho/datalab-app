import { useCallback, useState } from 'react';
import { AsyncResource } from '../../../components/Tools/async-resource';
import { useCompanyContext } from '../../../contexts/company';
import { DatalabAPI } from '../../../services/datalab-api';
import type { IRetrieveAgentWithState } from '../../../services/datalab-api/agentsResource';
import { AGENT_ROUTE_PERMISSIONS } from '../../../utils/route-permissions';
import { AgentsTable } from './components/agents-table';
import { AgentFormModal } from './components/agent-form-modal';
import {
  AgentsPageContainer,
  AgentsPageHeader,
  AgentsPageSubtitle,
  AgentsPageTitle,
  CreateAgentButton,
} from './agents.style';

export const Agents = () => {
  const { currentCompany, hasPermissionByRoute } = useCompanyContext();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingAgent, setEditingAgent] = useState<IRetrieveAgentWithState | null>(null);
  const [agentsKey, setAgentsKey] = useState(0);

  const refreshAgents = useCallback(() => setAgentsKey((k) => k + 1), []);
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
    <AgentsPageContainer>
      <AgentsPageHeader>
        <div>
          <AgentsPageTitle>Agentes</AgentsPageTitle>
          <AgentsPageSubtitle>
            {currentCompany?.name} · Gerencie os agentes especialistas disponíveis no chat.
          </AgentsPageSubtitle>
        </div>
        <CreateAgentButton
          onClick={openCreateModal}
          disabled={!canCreate}
          title={canCreate ? undefined : 'Você não tem permissão para criar agentes'}
        >
          + Criar agente
        </CreateAgentButton>
      </AgentsPageHeader>

      <AsyncResource fetcher={() => DatalabAPI.AgentsResource.listAgents()} dependencies={[agentsKey]}>
        {(agents) => (
          <AgentsTable agents={agents} onEdit={openEditModal} onRefresh={refreshAgents} />
        )}
      </AsyncResource>

      <AgentFormModal
        isOpen={isFormOpen}
        agent={editingAgent}
        onClose={() => setIsFormOpen(false)}
        onSuccess={refreshAgents}
      />
    </AgentsPageContainer>
  );
};
