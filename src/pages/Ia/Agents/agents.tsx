import { useState } from 'react';
import { LoadingPiece } from '../../../components/Feedback/Loadings/loading';
import { useAgentsContext } from '../../../contexts/agents';
import { useCompanyContext } from '../../../contexts/company';
import type { IRetrieveAgentWithState } from '../../../services/datalab-api/agentsResource';
import { AGENT_ROUTE_PERMISSIONS } from '../../../utils/route-permissions';
import { AgentsTable } from './components/agents-table';
import { AgentFormModal } from './components/agent-form-modal';
import {
  AgentsEmpty,
  AgentsPageContainer,
  AgentsPageHeader,
  AgentsPageSubtitle,
  AgentsPageTitle,
  CreateAgentButton,
} from './agents.style';

export const Agents = () => {
  const { agents, isLoadingAgents, canListAgents, refreshAgents } = useAgentsContext();
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

      {isLoadingAgents ? (
        <LoadingPiece />
      ) : !canListAgents ? (
        <AgentsEmpty>Não foi possível carregar os agentes. Verifique suas permissões.</AgentsEmpty>
      ) : (
        <AgentsTable agents={agents} onEdit={openEditModal} onRefresh={refreshAgents} />
      )}

      <AgentFormModal
        isOpen={isFormOpen}
        agent={editingAgent}
        onClose={() => setIsFormOpen(false)}
        onSuccess={() => void refreshAgents()}
      />
    </AgentsPageContainer>
  );
};
