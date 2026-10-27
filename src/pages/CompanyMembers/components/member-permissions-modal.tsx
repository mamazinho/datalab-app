import styles from '../company-members.module.css';
import { useCallback, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient, useSuspenseQueries } from '@tanstack/react-query';
import {
  memberPermissionsQuery,
  memberProviderPermissionsQuery,
  providerPermissionsQuery,
  routePermissionsQuery,
} from '../../../queries';
import { Modal } from '../../../components/UI/Modal/modal';
import { QueryBoundary } from '../../../components/Tools/query-boundary';
import { DatalabAPI } from '../../../services/datalab-api';
import type { ICompanyMembership } from '../../../services/datalab-api/membershipsResource';
import type {
  IMembershipPermission,
  IMembershipProviderPermission,
} from '../../../services/datalab-api/usersResource';
import type { UUID7 } from '../../../types/ids';
import { providerPermissionGroups, routePermissionGroups } from './permission-options';
import { PermissionToggles } from './permission-toggles';

interface IMemberPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: ICompanyMembership | null;
}

const MemberPermissionsContent = ({ memberId }: { memberId: UUID7 }) => {
  const queryClient = useQueryClient();
  const [togglingId, setTogglingId] = useState<UUID7 | null>(null);

  const [
    { data: routes },
    { data: memberPermissions },
    { data: providerPermissions },
    { data: memberProviderPermissions },
  ] = useSuspenseQueries({
    queries: [
      routePermissionsQuery,
      memberPermissionsQuery(memberId),
      providerPermissionsQuery,
      memberProviderPermissionsQuery(memberId),
    ],
  });

  // The cache is the source of truth: toggles update it with setQueryData
  const grantedRouteIds = useMemo(
    () => new Set(memberPermissions.map((p) => p.route_permission_id)),
    [memberPermissions],
  );

  const grantedProviderIds = useMemo(
    () => new Set(memberProviderPermissions.map((p) => p.provider_permission_id)),
    [memberProviderPermissions],
  );

  const routeGroups = useMemo(() => routePermissionGroups(routes), [routes]);
  const providerGroups = useMemo(
    () => providerPermissionGroups(providerPermissions),
    [providerPermissions],
  );

  // One toggle at a time: concurrent grants would scramble the optimistic state
  const withToggle = useCallback(
    async (id: UUID7, run: () => Promise<void>) => {
      if (togglingId !== null) return;
      setTogglingId(id);
      try {
        await run();
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Erro ao alterar permissão.');
      } finally {
        setTogglingId(null);
      }
    },
    [togglingId],
  );

  const handleToggleRoute = useCallback(
    (routeId: UUID7, isGranted: boolean) =>
      void withToggle(routeId, async () => {
        const { queryKey } = memberPermissionsQuery(memberId);
        if (isGranted) {
          await DatalabAPI.MembershipsResource.revokePermission(memberId, routeId);
          queryClient.setQueryData<IMembershipPermission[]>(queryKey, (old = []) =>
            old.filter((p) => p.route_permission_id !== routeId),
          );
          return;
        }
        const created = await DatalabAPI.MembershipsResource.grantPermission(memberId, routeId);
        queryClient.setQueryData<IMembershipPermission[]>(queryKey, (old = []) => [...old, created]);
      }),
    [memberId, queryClient, withToggle],
  );

  const handleToggleProvider = useCallback(
    (providerPermissionId: UUID7, isGranted: boolean) =>
      void withToggle(providerPermissionId, async () => {
        const { queryKey } = memberProviderPermissionsQuery(memberId);
        if (isGranted) {
          await DatalabAPI.MembershipsResource.revokeProviderPermission(
            memberId,
            providerPermissionId,
          );
          queryClient.setQueryData<IMembershipProviderPermission[]>(queryKey, (old = []) =>
            old.filter((p) => p.provider_permission_id !== providerPermissionId),
          );
          return;
        }
        const created = await DatalabAPI.MembershipsResource.grantProviderPermission(
          memberId,
          providerPermissionId,
        );
        queryClient.setQueryData<IMembershipProviderPermission[]>(queryKey, (old = []) => [
          ...old,
          created,
        ]);
      }),
    [memberId, queryClient, withToggle],
  );

  return (
    <div className={styles.permissionSections}>
      <section className={styles.permissionSection}>
        <h3 className={styles.permissionSectionTitle}>Permissões do app</h3>
        <p className={styles.permissionSectionHint}>
          Rotas da Datalab que este membro pode chamar.
        </p>
        <PermissionToggles
          groups={routeGroups}
          grantedIds={grantedRouteIds}
          togglingId={togglingId}
          onToggle={handleToggleRoute}
        />
      </section>

      {providerPermissions.length > 0 && (
        <section className={styles.permissionSection}>
          <h3 className={styles.permissionSectionTitle}>Permissões nos agentes</h3>
          <p className={styles.permissionSectionHint}>
            O que o agente pode executar por este membro dentro do Google/Meta. É independente
            das permissões do app: quem pode criar uma property pelo agente não necessariamente
            pode adicioná-la à empresa.
          </p>
          <PermissionToggles
            groups={providerGroups}
            grantedIds={grantedProviderIds}
            togglingId={togglingId}
            onToggle={handleToggleProvider}
          />
        </section>
      )}
    </div>
  );
};

export const MemberPermissionsModal = ({ isOpen, onClose, member }: IMemberPermissionsModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={`Permissões — ${member?.user?.name ?? 'Membro'}`}
  >
    {member && (
      // Owners have everything implicitly; the API refuses to grant or revoke for them
      member.membership_role === 'owner' ? (
        <p className={styles.ownerNotice}>
          Este membro é owner da empresa e tem todas as permissões implicitamente — não há o
          que conceder ou revogar.
        </p>
      ) : (
        <QueryBoundary>
          <MemberPermissionsContent memberId={member.id} />
        </QueryBoundary>
      )
    )}
  </Modal>
);
