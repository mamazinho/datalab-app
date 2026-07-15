import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DatalabAPI } from '../../services/datalab-api';
import type { IRetrieveAgentWithState } from '../../services/datalab-api/agentsResource';
import { AgentsContext } from './contexts';

export const AgentsProvider = ({ children }: { children: ReactNode }) => {
  const [agents, setAgents] = useState<IRetrieveAgentWithState[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(true);
  const [canListAgents, setCanListAgents] = useState(true);

  const refreshAgents = useCallback(async () => {
    setIsLoadingAgents(true);

    try {
      const data = await DatalabAPI.AgentsResource.listAgents();
      setAgents(data);
      setCanListAgents(true);
    } catch {
      // Usuário pode ter acesso ao chat sem acesso a agents — degrada silenciosamente
      setAgents([]);
      setCanListAgents(false);
    } finally {
      setIsLoadingAgents(false);
    }
  }, []);

  useEffect(() => {
    void refreshAgents();
  }, [refreshAgents]);

  const agentsByKey = useMemo(() => {
    const map: Record<string, IRetrieveAgentWithState> = {};
    for (const agent of agents) {
      map[agent.key] = agent;
    }
    return map;
  }, [agents]);

  const contextValue = useMemo(
    () => ({ agents, agentsByKey, isLoadingAgents, canListAgents, refreshAgents }),
    [agents, agentsByKey, isLoadingAgents, canListAgents, refreshAgents],
  );

  return (
    <AgentsContext.Provider value={contextValue}>
      {children}
    </AgentsContext.Provider>
  );
};
