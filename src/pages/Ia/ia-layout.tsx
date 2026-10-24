import styles from './ia.module.css';
import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useCompanyContext } from '../../contexts/company';
import { RouteTabs, type IRouteTabItem } from '../../components/UI/Tabs';
import { CHAT_ROUTE_PERMISSIONS, MCP_SERVER_ROUTE_PERMISSIONS } from '../../utils/route-permissions';

export const IaLayout = () => {
  const { hasPermissionByTag, hasPermissionByRoute, hasAnyAgentsPermission } = useCompanyContext();

  const tabs = useMemo<IRouteTabItem[]>(
    () => [
      ...(hasPermissionByTag('chat') ? [{ label: 'Conversas', to: '/ia/conversas' }] : []),
      ...(hasAnyAgentsPermission ? [{ label: 'Agentes', to: '/ia/agentes' }] : []),
      ...(hasPermissionByRoute(MCP_SERVER_ROUTE_PERMISSIONS.list) ? [{ label: 'MCP', to: '/ia/mcp' }] : []),
      ...(hasPermissionByRoute(CHAT_ROUTE_PERMISSIONS.usageReport) ? [{ label: 'Consumo', to: '/ia/consumo' }] : []),
    ],
    [hasPermissionByTag, hasPermissionByRoute, hasAnyAgentsPermission],
  );

  return (
    <div className={styles.iaContainer}>
      <RouteTabs items={tabs} label="Seções de IA" />
      <Outlet />
    </div>
  );
};
