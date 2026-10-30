import { createContext, useContext } from "react";
import type { IProviderPermission, IUserCompany, IUserMembership, IRoutePermission } from "../../services/datalab-api/usersResource";
import type { ICompanyProviderAsset } from "../../services/datalab-api/companiesResource";
import type { IRoutePermissionRef } from "../../utils/route-permissions";
import type { UUID7 } from "../../types/ids";
import type { ProviderPermissionKey } from "../../types/integrations";

interface ICompanyContextProps {
  currentCompany: IUserCompany | null;
  setCurrentCompany: (company: IUserCompany) => void;
  selectCompanyById: (id: UUID7) => void;
  clearSelectedCompany: () => void;
  currentMembership: IUserMembership | null;
  // True until /memberships/current answers: permissions are not conclusive before that
  isMembershipLoading: boolean;
  isOwner: boolean;
  memberRoutePermissions: IRoutePermission[];
  providerPermissions: IProviderPermission[];
  companyProviderAssets: ICompanyProviderAsset[];
  hasPermissionByTag: (tag: string | string[]) => boolean;
  hasPermissionByRoute: (ref: IRoutePermissionRef | IRoutePermissionRef[]) => boolean;
  hasProviderPermission: (key: ProviderPermissionKey) => boolean;
}

export const CompanyContext = createContext<ICompanyContextProps | null>(null);

export const useCompanyContext = () => {
  const context = useContext(CompanyContext);

  if (!context) {
    throw new Error('useCompanyContext must be used within a CompanyProvider');
  }

  return context;
};
