import styles from './management.module.css';
import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useCompanyContext } from '../../contexts/company';
import { RouteTabs, type IRouteTabItem } from '../../components/UI/Tabs';
import { COMPANY_PATH, INTEGRATIONS_PATH, MEMBERS_PATH } from '../../routes/paths';

// Integrations has no gate: the OAuth connection belongs to each member's account
export const ManagementLayout = () => {
  const { hasPermissionByTag, hasAnyCompanyPermission } = useCompanyContext();

  const tabs = useMemo<IRouteTabItem[]>(
    () => [
      ...(hasPermissionByTag('company') ? [{ label: 'Membros', to: MEMBERS_PATH }] : []),
      ...(hasAnyCompanyPermission ? [{ label: 'Empresa', to: COMPANY_PATH }] : []),
      { label: 'Integrações', to: INTEGRATIONS_PATH },
    ],
    [hasPermissionByTag, hasAnyCompanyPermission],
  );

  return (
    <div className={styles.managementContainer}>
      <RouteTabs items={tabs} label="Seções de gerenciamento" />
      <Outlet />
    </div>
  );
};
