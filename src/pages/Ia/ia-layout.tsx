import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useCompanyContext } from '../../contexts/company';
import { RouteTabs, type IRouteTabItem } from '../../components/UI/Tabs';
import { IaContainer } from './ia.style';

export const IaLayout = () => {
  const { hasPermissionByTag, hasAnyAgentsPermission } = useCompanyContext();

  const tabs = useMemo<IRouteTabItem[]>(
    () => [
      ...(hasPermissionByTag('chat') ? [{ label: 'Conversas', to: '/ia/conversas' }] : []),
      ...(hasAnyAgentsPermission ? [{ label: 'Agentes', to: '/ia/agentes' }] : []),
    ],
    [hasPermissionByTag, hasAnyAgentsPermission],
  );

  return (
    <IaContainer>
      <RouteTabs items={tabs} label="Seções de IA" />
      <Outlet />
    </IaContainer>
  );
};
