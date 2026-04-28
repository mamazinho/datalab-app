import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { CompanyContext } from "./contexts";
import { setCompanyId } from "../../services/datalab-api/axios";
import { DatalabAPI } from "../../services/datalab-api";
import type { IUserCompany, IMembershipPermission } from "../../services/datalab-api/usersResource";

interface ICompanyProviderProps {
  children: ReactNode;
  companies: IUserCompany[];
}

const SELECTED_COMPANY_KEY = 'selectedCompanyId';

export const CompanyProvider = ({ children, companies }: ICompanyProviderProps) => {
  const [selectedCompany, setSelectedCompany] = useState<IUserCompany | null>(null);
  const [memberPermissions, setMemberPermissions] = useState<IMembershipPermission[]>([]);

  // Derivação síncrona: não depende de useEffect, atualiza no mesmo render que `companies` muda.
  // Tenta restaurar do localStorage quando companies são carregadas após refresh.
  const currentCompany = useMemo<IUserCompany | null>(() => {
    if (selectedCompany) {
      const stillExists = companies.some((company) => company.id === selectedCompany.id);
      if (stillExists) return selectedCompany;
    }
    const savedId = localStorage.getItem(SELECTED_COMPANY_KEY);
    if (savedId) {
      const saved = companies.find((company) => String(company.id) === savedId);
      if (saved) return saved;
    }
    // Auto-seleciona apenas quando há exatamente 1 empresa.
    // Com 2+, o usuário precisa escolher explicitamente no onboarding.
    if (companies.length === 1) return companies[0];
    return null;
  }, [selectedCompany, companies]);

  // Sincroniza o ID da company no interceptor axios
  useEffect(() => {
    setCompanyId(currentCompany?.id ?? null);
  }, [currentCompany]);

  // Carrega as permissões do membro sempre que a company ativa mudar
  useEffect(() => {
    if (!currentCompany) {
      setMemberPermissions([]);
      return;
    }
    // Owners têm acesso total — não precisam de lista explícita
    if (currentCompany.membership.membership_role === 'owner') {
      setMemberPermissions([]);
      return;
    }
    DatalabAPI.CompanyPermissionsResource.listMemberPermissions(currentCompany.membership.id)
      .then(setMemberPermissions)
      .catch(() => setMemberPermissions([]));
  }, [currentCompany]);

  const setCurrentCompany = useCallback((company: IUserCompany) => {
    setSelectedCompany(company);
    localStorage.setItem(SELECTED_COMPANY_KEY, String(company.id));
  }, []);

  const hasPermissionByTag = useCallback(
    (tag: string): boolean => {
      if (!currentCompany) return false;
      if (currentCompany.membership.membership_role === 'owner') return true;
      return memberPermissions.some((p) => p.route_permission.tag === tag);
    },
    [currentCompany, memberPermissions],
  );

  const contextValue = useMemo(
    () => ({ currentCompany, setCurrentCompany, memberPermissions, hasPermissionByTag }),
    [currentCompany, setCurrentCompany, memberPermissions, hasPermissionByTag],
  );

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
};
