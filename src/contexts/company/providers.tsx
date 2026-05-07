import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { CompanyContext } from "./contexts";
import { setCompanyId } from "../../services/datalab-api/axios";
import { DatalabAPI } from "../../services/datalab-api";
import type { IUserCompany, IUserMembership, IMembershipPermission } from "../../services/datalab-api/usersResource";

interface ICompanyProviderProps {
  children: ReactNode;
  companies: IUserCompany[];
}

const SELECTED_COMPANY_KEY = 'selectedCompanyId';

export const CompanyProvider = ({ children, companies }: ICompanyProviderProps) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<number | null>(() => {
    const saved = localStorage.getItem(SELECTED_COMPANY_KEY);
    return saved ? Number(saved) : null;
  });
  const [membershipOverride, setMembershipOverride] = useState<IUserMembership | null>(null);
  const [memberPermissions, setMemberPermissions] = useState<IMembershipPermission[]>([]);

  const currentCompany = useMemo<IUserCompany | null>(() => {
    if (selectedCompanyId) {
      const found = companies.find((c) => c.id === selectedCompanyId);
      if (found) return found;
    }
    // Auto-seleciona apenas quando há exatamente 1 empresa.
    if (companies.length === 1) return companies[0];
    return null;
  }, [selectedCompanyId, companies]);

  // Membership: usa override (ex: após criar company) ou o embutido na company da lista
  const currentMembership = useMemo<IUserMembership | null>(
    () => membershipOverride ?? currentCompany?.membership ?? null,
    [membershipOverride, currentCompany],
  );

  // Reseta o override ao trocar de empresa
  useEffect(() => {
    setMembershipOverride(null);
  }, [selectedCompanyId]);

  // Sincroniza o ID da company no interceptor axios
  useEffect(() => {
    setCompanyId(currentCompany?.id ?? null);
  }, [currentCompany]);

  // Carrega permissões de rota sempre que o membership ativo mudar
  useEffect(() => {
    if (!currentCompany || !currentMembership) {
      setMemberPermissions([]);
      return;
    }
    // Owners têm acesso total — não precisam de lista explícita
    if (currentMembership.membership_role === 'owner') {
      setMemberPermissions([]);
      return;
    }
    DatalabAPI.MembershipsResource.listMemberPermissions(currentMembership.id)
      .then(setMemberPermissions)
      .catch(() => setMemberPermissions([]));
  }, [currentCompany, currentMembership]);

  const setCurrentCompany = useCallback((company: IUserCompany) => {
    setSelectedCompanyId(company.id);
    localStorage.setItem(SELECTED_COMPANY_KEY, String(company.id));
  }, []);

  const selectCompanyById = useCallback((id: number) => {
    setSelectedCompanyId(id);
    localStorage.setItem(SELECTED_COMPANY_KEY, String(id));
  }, []);

  const setMembership = useCallback((membership: IUserMembership) => {
    setMembershipOverride(membership);
  }, []);

  const hasPermissionByTag = useCallback(
    (tag: string): boolean => {
      if (!currentMembership) return false;
      if (currentMembership.membership_role === 'owner') return true;
      return memberPermissions.some((p) => p.route_permission.tag === tag);
    },
    [currentMembership, memberPermissions],
  );

  const contextValue = useMemo(
    () => ({
      currentCompany,
      setCurrentCompany,
      selectCompanyById,
      currentMembership,
      setMembership,
      memberPermissions,
      hasPermissionByTag,
    }),
    [currentCompany, setCurrentCompany, selectCompanyById, currentMembership, setMembership, memberPermissions, hasPermissionByTag],
  );

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
};
