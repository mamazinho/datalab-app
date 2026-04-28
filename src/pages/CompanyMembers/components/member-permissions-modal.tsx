import { useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '../../../components/UI/Modal/modal';
import { DatalabAPI } from '../../../services/datalab-api';
import type { ICompanyMembership, IRoutePermission } from '../../../services/datalab-api/usersResource';
import {
  PermissionGroup,
  PermissionGroupLabel,
  PermissionsList,
  PermissionToggleDesc,
  PermissionToggleInfo,
  PermissionToggleMethod,
  PermissionToggleName,
  PermissionToggleRow,
  ToggleSwitch,
} from '../company-members.style';

interface IMemberPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: ICompanyMembership | null;
}

export const MemberPermissionsModal = ({ isOpen, onClose, member }: IMemberPermissionsModalProps) => {
  const [allRoutes, setAllRoutes] = useState<IRoutePermission[]>([]);
  const [grantedIds, setGrantedIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    if (!member) return;
    setIsLoading(true);
    try {
      const [routes, permissions] = await Promise.all([
        DatalabAPI.CompanyPermissionsResource.listRoutePermissions(),
        DatalabAPI.CompanyPermissionsResource.listMemberPermissions(member.id),
      ]);
      setAllRoutes(routes);
      setGrantedIds(new Set(permissions.map((p) => p.route_permission_id)));
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar permissões.');
    } finally {
      setIsLoading(false);
    }
  }, [member]);

  useEffect(() => {
    if (isOpen) void loadData();
  }, [isOpen, loadData]);

  const handleToggle = useCallback(
    async (routeId: number, isGranted: boolean) => {
      if (!member || togglingId !== null) return;
      setTogglingId(routeId);
      try {
        if (isGranted) {
          await DatalabAPI.CompanyPermissionsResource.revokePermission(member.id, routeId);
          setGrantedIds((prev) => { const next = new Set(prev); next.delete(routeId); return next; });
        } else {
          await DatalabAPI.CompanyPermissionsResource.grantPermission(member.id, routeId);
          setGrantedIds((prev) => new Set(prev).add(routeId));
        }
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Erro ao alterar permissão.');
      } finally {
        setTogglingId(null);
      }
    },
    [member, togglingId],
  );

  // Agrupa as rotas por tag
  const grouped = useMemo(() => {
    const groups: Record<string, IRoutePermission[]> = {};
    for (const route of allRoutes) {
      const tag = route.tag ?? 'Geral';
      if (!groups[tag]) groups[tag] = [];
      groups[tag].push(route);
    }
    return groups;
  }, [allRoutes]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Permissões — ${member?.user?.name ?? 'Membro'}`}
    >
      {isLoading ? (
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-secondary)' }}>Carregando...</p>
      ) : (
        <PermissionsList>
          {Object.entries(grouped).map(([tag, routes]) => (
            <PermissionGroup key={tag}>
              <PermissionGroupLabel>{tag}</PermissionGroupLabel>
              {routes.map((route) => {
                const isGranted = grantedIds.has(route.id);
                const isToggling = togglingId === route.id;
                return (
                  <PermissionToggleRow key={route.id}>
                    <PermissionToggleInfo>
                      <PermissionToggleName>{route.description || route.name}</PermissionToggleName>
                      <PermissionToggleDesc>
                        <PermissionToggleMethod>{route.method}</PermissionToggleMethod>
                        {' '}{route.path}
                      </PermissionToggleDesc>
                    </PermissionToggleInfo>
                    <ToggleSwitch
                      checked={isGranted}
                      disabled={isToggling}
                      onChange={() => void handleToggle(route.id, isGranted)}
                    />
                  </PermissionToggleRow>
                );
              })}
            </PermissionGroup>
          ))}
        </PermissionsList>
      )}
    </Modal>
  );
};
