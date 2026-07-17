import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '../../../components/UI/Modal/modal';
import { AsyncResource } from '../../../components/Tools/async-resource';
import { DatalabAPI } from '../../../services/datalab-api';
import type { ICompanyMembership } from '../../../services/datalab-api/membershipsResource';
import type { IRoutePermission } from '../../../services/datalab-api/usersResource';
import { groupPermissionsByTag } from '../permissions-helpers';
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

interface IMemberPermissionsData {
  routes: IRoutePermission[];
  grantedIds: number[];
}

const fetchMemberPermissionsData = async (memberId: number): Promise<IMemberPermissionsData> => {
  const [routes, permissions] = await Promise.all([
    DatalabAPI.MembershipsResource.listRoutePermissions(),
    DatalabAPI.MembershipsResource.listMemberPermissions(memberId),
  ]);

  return { routes, grantedIds: permissions.map((p) => p.route_permission_id) };
};

const MemberPermissionToggles = ({ memberId, data }: { memberId: number; data: IMemberPermissionsData }) => {
  const [grantedIds, setGrantedIds] = useState<Set<number>>(() => new Set(data.grantedIds));
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const grouped = useMemo(() => groupPermissionsByTag(data.routes), [data.routes]);

  const handleToggle = useCallback(
    async (routeId: number, isGranted: boolean) => {
      if (togglingId !== null) return;
      setTogglingId(routeId);
      try {
        if (isGranted) {
          await DatalabAPI.MembershipsResource.revokePermission(memberId, routeId);
          setGrantedIds((prev) => { const next = new Set(prev); next.delete(routeId); return next; });
        } else {
          await DatalabAPI.MembershipsResource.grantPermission(memberId, routeId);
          setGrantedIds((prev) => new Set(prev).add(routeId));
        }
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Erro ao alterar permissão.');
      } finally {
        setTogglingId(null);
      }
    },
    [memberId, togglingId],
  );

  return (
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
  );
};

export const MemberPermissionsModal = ({ isOpen, onClose, member }: IMemberPermissionsModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={`Permissões — ${member?.user?.name ?? 'Membro'}`}
  >
    {member && (
      <AsyncResource fetcher={() => fetchMemberPermissionsData(member.id)} dependencies={[member.id]}>
        {(data) => <MemberPermissionToggles memberId={member.id} data={data} />}
      </AsyncResource>
    )}
  </Modal>
);
