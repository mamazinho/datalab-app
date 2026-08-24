import { createContext, useContext, useMemo } from "react";
import type { IProviderPermission, IUserCompany, IUserMembership, IRoutePermission } from "../../services/datalab-api/usersResource";
import type { ICompanyProviderAsset } from "../../services/datalab-api/companiesResource";
import type { IRoutePermissionRef } from "../../utils/route-permissions";
import type { UUID } from "../../types/ids";
import type { ProviderPermissionKey } from "../../types/integrations";

interface ICompanyContextProps {
  currentCompany: IUserCompany | null;
  setCurrentCompany: (company: IUserCompany) => void;
  selectCompanyById: (id: UUID) => void;
  clearSelectedCompany: () => void;
  currentMembership: IUserMembership | null;
  /** true enquanto /memberships/current não respondeu — as permissões ainda não são conclusivas */
  isMembershipLoading: boolean;
  memberPermissions: IRoutePermission[];
  /** Permissões nos agentes (provider) do usuário na empresa ativa — já resolvidas */
  providerPermissions: IProviderPermission[];
  /** Allowlist de ativos da EMPRESA (todo membro vê a mesma lista) */
  companyProviderAssets: ICompanyProviderAsset[];
  hasPermissionByTag: (tag: string) => boolean;
  hasPermissionByRoute: (ref: IRoutePermissionRef) => boolean;
  hasProviderPermission: (key: ProviderPermissionKey) => boolean;
  hasAnyAgentsPermission: boolean;
  hasAnyCompanyPermission: boolean;
}

export const CompanyContext = createContext<ICompanyContextProps | null>(null);

export const useCompanyContext = () => {
  const context = useContext(CompanyContext);

  if (!context) {
    throw new Error('useCompanyContext must be used within a CompanyProvider');
  }

  return context;
};

export const useCompanyPermissions = () => {
  const { currentMembership } = useCompanyContext();

  const isOwner = useMemo(
    () => currentMembership?.membership_role === 'owner',
    [currentMembership],
  );

  return {
    isOwner,
    canManageUsers: isOwner,
  };
};