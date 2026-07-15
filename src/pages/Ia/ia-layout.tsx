import { Outlet } from 'react-router-dom';
import { AgentsProvider } from '../../contexts/agents';
import { useCompanyContext } from '../../contexts/company';
import { IaContainer, IaTabLink, IaTabs } from './ia.style';

export const IaLayout = () => {
  const { hasPermissionByTag, hasAnyAgentsPermission } = useCompanyContext();

  return (
    <AgentsProvider>
      <IaContainer>
        <IaTabs>
          {hasPermissionByTag('chat') && (
            <IaTabLink to="/ia/conversas">Conversas</IaTabLink>
          )}
          {hasAnyAgentsPermission && (
            <IaTabLink to="/ia/agentes">Agentes</IaTabLink>
          )}
        </IaTabs>
        <Outlet />
      </IaContainer>
    </AgentsProvider>
  );
};
