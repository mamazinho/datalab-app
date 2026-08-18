import { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import { useCompanyContext } from '../../contexts/company';
import { RouteTabs, type IRouteTabItem } from '../../components/UI/Tabs';
import { COMPANY_PATH, INTEGRATIONS_PATH, MEMBERS_PATH } from '../../routes/paths';
import { ManagementContainer } from './management.style';

// Sub-navegação do gerenciamento: cada aba só aparece se o usuário tiver acesso.
// Integrações é a exceção — a conexão OAuth é da conta de cada membro.
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
    <ManagementContainer>
      <RouteTabs items={tabs} label="Seções de gerenciamento" />
      <Outlet />
    </ManagementContainer>
  );
};
