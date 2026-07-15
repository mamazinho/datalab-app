import { createContext, useContext } from 'react';
import type { IRetrieveAgentWithState } from '../../services/datalab-api/agentsResource';

interface IAgentsContextProps {
  agents: IRetrieveAgentWithState[];
  agentsByKey: Record<string, IRetrieveAgentWithState>;
  isLoadingAgents: boolean;
  canListAgents: boolean;
  refreshAgents: () => Promise<void>;
}

export const AgentsContext = createContext({} as IAgentsContextProps);

export const useAgentsContext = () => {
  const context = useContext(AgentsContext);

  if (!context) {
    throw new Error('useAgentsContext must be used within an AgentsProvider');
  }

  return context;
};
