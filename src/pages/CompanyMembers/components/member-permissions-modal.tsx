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
import type { UUID } from '../../../types/ids';
import { providerPermissionGroups, routePermissionGroups } from './permission-options';
import { PermissionToggles } from './permission-toggles';
import {
  OwnerNotice,
  PermissionSection,
  PermissionSectionHint,
  PermissionSections,
  PermissionSectionTitle,
} from '../company-members.style';

interface IMemberPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: ICompanyMembership | null;
}

const MemberPermissionsContent = ({ memberId }: { memberId: UUID }) => {
  const queryClient = useQueryClient();
  const [togglingId, setTogglingId] = useState<UUID | null>(null);

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

  // O cache é a fonte de verdade: os toggles atualizam a query via setQueryData
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

  // Um toggle por vez: concessões concorrentes embaralhariam o estado otimista.
  const withToggle = useCallback(
    async (id: UUID, run: () => Promise<void>) => {
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
    (routeId: UUID, isGranted: boolean) =>
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
    (providerPermissionId: UUID, isGranted: boolean) =>
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
    <PermissionSections>
      <PermissionSection>
        <PermissionSectionTitle>Permissões do app</PermissionSectionTitle>
        <PermissionSectionHint>
          Rotas da Datalab que este membro pode chamar.
        </PermissionSectionHint>
        <PermissionToggles
          groups={routeGroups}
          grantedIds={grantedRouteIds}
          togglingId={togglingId}
          onToggle={handleToggleRoute}
        />
      </PermissionSection>

      {providerPermissions.length > 0 && (
        <PermissionSection>
          <PermissionSectionTitle>Permissões nos agentes</PermissionSectionTitle>
          <PermissionSectionHint>
            O que o agente pode executar por este membro dentro do Google/Meta. É independente
            das permissões do app: quem pode criar uma property pelo agente não necessariamente
            pode adicioná-la à empresa.
          </PermissionSectionHint>
          <PermissionToggles
            groups={providerGroups}
            grantedIds={grantedProviderIds}
            togglingId={togglingId}
            onToggle={handleToggleProvider}
          />
        </PermissionSection>
      )}
    </PermissionSections>
  );
};

export const MemberPermissionsModal = ({ isOpen, onClose, member }: IMemberPermissionsModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={`Permissões — ${member?.user?.name ?? 'Membro'}`}
  >
    {member && (
      // Owner tem tudo implicitamente — a API recusa conceder e revogar para ele.
      member.membership_role === 'owner' ? (
        <OwnerNotice>
          Este membro é owner da empresa e tem todas as permissões implicitamente — não há o
          que conceder ou revogar.
        </OwnerNotice>
      ) : (
        <QueryBoundary>
          <MemberPermissionsContent memberId={member.id} />
        </QueryBoundary>
      )
    )}
  </Modal>
);
