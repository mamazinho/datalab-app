import { createContext, useContext, useMemo } from "react";
import type { IUserCompany, IUserMembership, IMembershipPermission } from "../../services/datalab-api/usersResource";
import type { IRoutePermissionRef } from "../../utils/route-permissions";

interface ICompanyContextProps {
  currentCompany: IUserCompany | null;
  setCurrentCompany: (company: IUserCompany) => void;
  selectCompanyById: (id: number) => void;
  currentMembership: IUserMembership | null;
  setMembership: (membership: IUserMembership) => void;
  memberPermissions: IMembershipPermission[];
  hasPermissionByTag: (tag: string) => boolean;
  hasPermissionByRoute: (ref: IRoutePermissionRef) => boolean;
  hasAnyAgentsPermission: boolean;
}

export const CompanyContext = createContext({} as ICompanyContextProps);

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