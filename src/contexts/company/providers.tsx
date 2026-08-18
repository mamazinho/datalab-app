import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";
import { CompanyContext } from "./contexts";
import { setCompanyId } from "../../services/datalab-api/axios";
import { currentMembershipQuery } from "../../queries";
import { COMPANY_ROUTE_PERMISSIONS, isAgentsRoutePermission, matchesRoutePermission, toRoutePermission, type IRoutePermissionRef } from "../../utils/route-permissions";
import { isUuid, type UUID } from "../../types/ids";
import type { ProviderPermissionKey } from "../../types/integrations";
import type { IProviderPermission, IUserCompany, IUserMembership, IRoutePermission } from "../../services/datalab-api/usersResource";
import type { ICompanyProviderAsset } from "../../services/datalab-api/companiesResource";

interface ICompanyProviderProps {
  children: ReactNode;
  companies: IUserCompany[];
}

const SELECTED_COMPANY_KEY = 'selectedCompanyId';

export const CompanyProvider = ({ children, companies }: ICompanyProviderProps) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<UUID | null>(() => {
    const saved = localStorage.getItem(SELECTED_COMPANY_KEY);
    return isUuid(saved) ? saved : null;
  });

  // A lista (de /users/me) decide QUAL empresa está ativa e alimenta o dropdown;
  // os dados autoritativos da empresa ativa vêm de /memberships/current.
  const currentCompany = useMemo<IUserCompany | null>(() => {
    if (selectedCompanyId) {
      const found = companies.find((c) => c.id === selectedCompanyId);
      if (found) return found;
    }
    // Auto-seleciona apenas quando há exatamente 1 empresa.
    if (companies.length === 1) return companies[0];
    return null;
  }, [selectedCompanyId, companies]);

  // Header global de empresa para os demais recursos (members, invites, agents...).
  useEffect(() => {
    setCompanyId(currentCompany?.id ?? null);
  }, [currentCompany]);

  // Fonte única do usuário na empresa ativa: membership + company + permissões (flat).
  const { data: currentMembershipData } = useQuery({
    ...currentMembershipQuery(currentCompany?.id as UUID),
    enabled: !!currentCompany,
  });

  // Role disponível de imediato pelo membership embutido em me.companies — evita
  // "bounce" de owner enquanto /memberships/current ainda carrega; é promovido ao
  // membership autoritativo assim que a query resolve.
  const currentMembership = useMemo<IUserMembership | null>(
    () => currentMembershipData ?? currentCompany?.membership ?? null,
    [currentMembershipData, currentCompany],
  );

  // /memberships/current devolve as route permissions achatadas. O shape de
  // junção (.route_permission) já valeu aqui um dia, e o custo de errar é o
  // provider inteiro cair em tela branca — então aceitamos os dois e
  // descartamos entrada inválida, no mesmo espírito do guard de normalizeRoutePath.
  const memberPermissions = useMemo<IRoutePermission[]>(
    () =>
      (currentMembershipData?.permissions ?? [])
        .map(toRoutePermission)
        .filter((permission): permission is IRoutePermission => permission !== null),
    [currentMembershipData],
  );

  // provider_permissions vem como dict por plataforma; achatamos porque as
  // checagens são por key ("ga4_property_create"), que já é única entre providers.
  const providerPermissions = useMemo<IProviderPermission[]>(
    () => Object.values(currentMembershipData?.provider_permissions ?? {}).flat(),
    [currentMembershipData],
  );

  // Allowlist da empresa ativa — trocar de empresa troca a lista inteira.
  const companyProviderAssets = useMemo<ICompanyProviderAsset[]>(
    () => currentMembershipData?.company?.provider_assets ?? [],
    [currentMembershipData],
  );

  const setCurrentCompany = useCallback((company: IUserCompany) => {
    setSelectedCompanyId(company.id);
    localStorage.setItem(SELECTED_COMPANY_KEY, company.id);
  }, []);

  const selectCompanyById = useCallback((id: UUID) => {
    setSelectedCompanyId(id);
    localStorage.setItem(SELECTED_COMPANY_KEY, id);
  }, []);

  // Limpa a empresa selecionada (ex.: após deletar a ativa) — currentCompany vira
  // null e o PrivateContent redireciona para o onboarding.
  const clearSelectedCompany = useCallback(() => {
    setSelectedCompanyId(null);
    localStorage.removeItem(SELECTED_COMPANY_KEY);
  }, []);

  const hasPermissionByTag = useCallback(
    (tag: string): boolean => {
      if (!currentMembership) return false;
      if (currentMembership.membership_role === 'owner') return true;
      return memberPermissions.some((p) => p.tag === tag);
    },
    [currentMembership, memberPermissions],
  );

  const hasPermissionByRoute = useCallback(
    (ref: IRoutePermissionRef): boolean => {
      if (!currentMembership) return false;
      if (currentMembership.membership_role === 'owner') return true;
      return memberPermissions.some((p) => matchesRoutePermission(p, ref));
    },
    [currentMembership, memberPermissions],
  );

  // Conveniência de tela (ex.: exibir a ação de criar property). Quem aplica a
  // regra de verdade é a core-api — nunca dependa disto para segurança.
  const hasProviderPermission = useCallback(
    (key: ProviderPermissionKey): boolean => {
      if (!currentMembership) return false;
      if (currentMembership.membership_role === 'owner') return true;
      return providerPermissions.some((p) => p.key === key);
    },
    [currentMembership, providerPermissions],
  );

  const hasAnyAgentsPermission = useMemo(() => {
    if (!currentMembership) return false;
    if (currentMembership.membership_role === 'owner') return true;
    return memberPermissions.some((p) => isAgentsRoutePermission(p));
  }, [currentMembership, memberPermissions]);

  const hasAnyCompanyPermission = useMemo(
    () =>
      hasPermissionByRoute(COMPANY_ROUTE_PERMISSIONS.update) ||
      hasPermissionByRoute(COMPANY_ROUTE_PERMISSIONS.remove),
    [hasPermissionByRoute],
  );

  const contextValue = useMemo(
    () => ({
      currentCompany,
      setCurrentCompany,
      selectCompanyById,
      clearSelectedCompany,
      currentMembership,
      memberPermissions,
      providerPermissions,
      companyProviderAssets,
      hasPermissionByTag,
      hasPermissionByRoute,
      hasProviderPermission,
      hasAnyAgentsPermission,
      hasAnyCompanyPermission,
    }),
    [currentCompany, setCurrentCompany, selectCompanyById, clearSelectedCompany, currentMembership, memberPermissions, providerPermissions, companyProviderAssets, hasPermissionByTag, hasPermissionByRoute, hasProviderPermission, hasAnyAgentsPermission, hasAnyCompanyPermission],
  );

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
};
