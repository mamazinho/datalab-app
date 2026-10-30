import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { CompanyContext } from "./contexts";
import { setCompanyId } from "../../services/datalab-api/axios";
import { currentMembershipQuery, meQuery } from "../../queries";
import { matchesRoutePermission, type IRoutePermissionRef } from "../../utils/route-permissions";
import { isUuid7, type UUID7 } from "../../types/ids";
import type { ProviderPermissionKey } from "../../types/integrations";
import type { IProviderPermission, IUserCompany, IUserMembership, IRoutePermission } from "../../services/datalab-api/usersResource";
import type { ICompanyProviderAsset } from "../../services/datalab-api/companiesResource";

interface ICompanyProviderProps {
  children: ReactNode;
  companies: IUserCompany[];
}

const SELECTED_COMPANY_KEY = 'selectedCompanyId';

export const CompanyProvider = ({ children, companies }: ICompanyProviderProps) => {
  const queryClient = useQueryClient();
  const [selectedCompanyId, setSelectedCompanyId] = useState<UUID7 | null>(() => {
    const saved = localStorage.getItem(SELECTED_COMPANY_KEY);
    return isUuid7(saved) ? saved : null;
  });

  const currentCompany = useMemo<IUserCompany | null>(() => {
    if (selectedCompanyId) {
      const found = companies.find((c) => c.id === selectedCompanyId);
      if (found) return found;
    }
    if (companies.length === 1) return companies[0];
    return null;
  }, [selectedCompanyId, companies]);

  useEffect(() => {
    setCompanyId(currentCompany?.id ?? null);
  }, [currentCompany]);

  const { data: currentMembershipData, isLoading: isMembershipLoading } = useQuery({
    ...currentMembershipQuery(currentCompany?.id as UUID7),
    enabled: !!currentCompany,
  });

  // Falls back to the membership embedded in /users/me so an owner is not bounced while /memberships/current loads
  const currentMembership = useMemo<IUserMembership | null>(
    () => currentMembershipData ?? currentCompany?.membership ?? null,
    [currentMembershipData, currentCompany],
  );

  const memberRoutePermissions = useMemo<IRoutePermission[]>(
    () => currentMembershipData?.route_permissions ?? [],
    [currentMembershipData],
  );

  // Flattened because checks go by key, which is already unique across providers
  const providerPermissions = useMemo<IProviderPermission[]>(
    () => Object.values(currentMembershipData?.provider_permissions ?? {}).flat(),
    [currentMembershipData],
  );

  const companyProviderAssets = useMemo<ICompanyProviderAsset[]>(
    () => currentMembershipData?.company?.provider_assets ?? [],
    [currentMembershipData],
  );

  // Company queries have no company id in their keys, so switching resets all of them but /me
  const selectCompanyById = useCallback((id: UUID7) => {
    setCompanyId(id);
    setSelectedCompanyId(id);
    localStorage.setItem(SELECTED_COMPANY_KEY, id);
    void queryClient.resetQueries({ predicate: (query) => query.queryKey[0] !== meQuery.queryKey[0] });
  }, [queryClient]);

  const setCurrentCompany = useCallback((company: IUserCompany) => selectCompanyById(company.id), [selectCompanyById]);

  const clearSelectedCompany = useCallback(() => {
    setSelectedCompanyId(null);
    localStorage.removeItem(SELECTED_COMPANY_KEY);
  }, []);

  const isOwner = currentMembership?.membership_role === 'owner';

  // A list is granted when any of its entries is
  const hasPermissionByTag = useCallback(
    (tag: string | string[]): boolean => {
      const tags = [tag].flat();
      return isOwner || memberRoutePermissions.some((p) => p.tag !== null && tags.includes(p.tag));
    },
    [isOwner, memberRoutePermissions],
  );

  const hasPermissionByRoute = useCallback(
    (ref: IRoutePermissionRef | IRoutePermissionRef[]): boolean =>
      isOwner || [ref].flat().some((r) => memberRoutePermissions.some((p) => matchesRoutePermission(p, r))),
    [isOwner, memberRoutePermissions],
  );

  // UI convenience only: the core-api enforces this rule
  const hasProviderPermission = useCallback(
    (key: ProviderPermissionKey): boolean => isOwner || providerPermissions.some((p) => p.key === key),
    [isOwner, providerPermissions],
  );

  const contextValue = useMemo(
    () => ({
      currentCompany,
      setCurrentCompany,
      selectCompanyById,
      clearSelectedCompany,
      currentMembership,
      isMembershipLoading,
      isOwner,
      memberRoutePermissions,
      providerPermissions,
      companyProviderAssets,
      hasPermissionByTag,
      hasPermissionByRoute,
      hasProviderPermission,
    }),
    [currentCompany, setCurrentCompany, selectCompanyById, clearSelectedCompany, currentMembership, isMembershipLoading, isOwner, memberRoutePermissions, providerPermissions, companyProviderAssets, hasPermissionByTag, hasPermissionByRoute, hasProviderPermission],
  );

  return (
    <CompanyContext.Provider value={contextValue}>
      {children}
    </CompanyContext.Provider>
  );
};
