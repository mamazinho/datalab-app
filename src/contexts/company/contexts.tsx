import { createContext, useContext } from "react";
import type { IUserCompany, IMembershipPermission } from "../../services/datalab-api/usersResource";

interface ICompanyContextProps {
  currentCompany: IUserCompany | null;
  setCurrentCompany: (company: IUserCompany) => void;
  memberPermissions: IMembershipPermission[];
  hasPermissionByTag: (tag: string) => boolean;
}

export const CompanyContext = createContext({} as ICompanyContextProps);

export const useCompanyContext = () => {
  const context = useContext(CompanyContext);

  if (!context) {
    throw new Error('useCompanyContext must be used within a CompanyProvider');
  }

  return context;
};
