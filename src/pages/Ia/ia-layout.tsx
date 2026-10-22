import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useCompanyContext } from '../../contexts/company';
import { RouteTabs, type IRouteTabItem } from '../../components/UI/Tabs';
import { MCP_SERVER_ROUTE_PERMISSIONS } from '../../utils/route-permissions';
import { IaContainer } from './ia.style';

export const IaLayout = () => {
  const { hasPermissionByTag, hasPermissionByRoute, hasAnyAgentsPermission } = useCompanyContext();

  const tabs = useMemo<IRouteTabItem[]>(
    () => [
      ...(hasPermissionByTag('chat') ? [{ label: 'Conversas', to: '/ia/conversas' }] : []),
      ...(hasAnyAgentsPermission ? [{ label: 'Agentes', to: '/ia/agentes' }] : []),
      ...(hasPermissionByRoute(MCP_SERVER_ROUTE_PERMISSIONS.list) ? [{ label: 'MCP', to: '/ia/mcp' }] : []),
    ],
    [hasPermissionByTag, hasPermissionByRoute, hasAnyAgentsPermission],
  );

  return (
    <IaContainer>
      <RouteTabs items={tabs} label="Seções de IA" />
      <Outlet />
    </IaContainer>
  );
};
