import styles from '../company-members.module.css';
import { useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { ActionTable, TableAction, TableActions, TableHeaders, TableRow } from '../../../components/UI/Tables/ActionTable';
import { useCompanyContext } from '../../../contexts/company';
import { DatalabAPI } from '../../../services/datalab-api';
import { currentMembershipQuery, meQuery, membersQuery } from '../../../queries';
import type { ICompanyMembership } from '../../../services/datalab-api/membershipsResource';
import type { UUID7 } from '../../../types/ids';
import { MEMBERSHIP_ROUTE_PERMISSIONS } from '../../../utils/route-permissions';
import { MemberPermissionsModal } from './member-permissions-modal';

interface IMembersListProps {
  members: ICompanyMembership[];
}

const nameOf = (member: ICompanyMembership) => member.user?.name ?? 'este membro';

export const MembersList = ({ members }: IMembersListProps) => {
  const queryClient = useQueryClient();
  const { currentCompany, isOwner, hasPermissionByRoute } = useCompanyContext();
  // The modal reads the member's current grants before saving the new ones
  const canEditPermissions = [
    MEMBERSHIP_ROUTE_PERMISSIONS.updatePermissions,
    MEMBERSHIP_ROUTE_PERMISSIONS.listMemberRoutePermissions,
    MEMBERSHIP_ROUTE_PERMISSIONS.listMemberProviderPermissions,
  ].every((route) => hasPermissionByRoute(route));
  const canRemove = hasPermissionByRoute(MEMBERSHIP_ROUTE_PERMISSIONS.remove);
  const [selectedMember, setSelectedMember] = useState<ICompanyMembership | null>(null);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [busyId, setBusyId] = useState<UUID7 | null>(null);

  const runMemberAction = async (
    member: ICompanyMembership,
    confirmation: string,
    action: () => Promise<unknown>,
    successMessage: string,
  ) => {
    if (!window.confirm(confirmation)) return;
    setBusyId(member.id);
    try {
      await action();
      toast.success(successMessage);
      void queryClient.invalidateQueries({ queryKey: membersQuery.queryKey });
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao atualizar o membro.');
    } finally {
      setBusyId(null);
    }
  };

  const removeMember = (member: ICompanyMembership) =>
    runMemberAction(
      member,
      `Remover ${nameOf(member)} da empresa?`,
      () => DatalabAPI.MembershipsResource.removeMember(member.id),
      'Membro removido.',
    );

  const transferOwnership = (member: ICompanyMembership) =>
    runMemberAction(
      member,
      `Transferir a posse da empresa para ${nameOf(member)}? Você continua na empresa como membro, com todas as permissões.`,
      async () => {
        await DatalabAPI.MembershipsResource.transferOwnership(member.id);
        void queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
        if (currentCompany) void queryClient.invalidateQueries({ queryKey: currentMembershipQuery(currentCompany.id).queryKey });
      },
      `${nameOf(member)} agora é o owner da empresa.`,
    );

  if (members.length === 0) {
    return <p className={styles.membersEmpty}>Nenhum membro encontrado.</p>;
  }

  return (
    <>
      <ActionTable>
        <TableHeaders>
          <th>Nome</th>
          <th>E-mail</th>
          <th>Papel</th>
        </TableHeaders>

        {members.map((member) => (
          <TableRow key={member.id}>
            <td>{member.user?.name ?? '—'}</td>
            <td>
              {member.user?.email ?? '—'}
              <span className={styles.membersTableCellSecondary}>Status: {member.status}</span>
            </td>
            <td>
              <span className={styles.roleBadge} data-owner={member.membership_role === 'owner'}>
                {member.membership_role === 'owner' ? 'Owner' : 'Membro'}
              </span>
            </td>
            <td>
              {member.membership_role !== 'owner' && (canEditPermissions || canRemove) && (
                <TableActions>
                  {canEditPermissions && (
                    <TableAction onClick={() => { setSelectedMember(member); setIsPermissionsOpen(true); }}>
                      Editar permissões
                    </TableAction>
                  )}
                  {isOwner && member.status === 'active' && (
                    <TableAction disabled={busyId === member.id} onClick={() => void transferOwnership(member)}>
                      Transferir posse
                    </TableAction>
                  )}
                  {canRemove && (
                    <TableAction disabled={busyId === member.id} onClick={() => void removeMember(member)}>
                      Remover membro
                    </TableAction>
                  )}
                </TableActions>
              )}
            </td>
          </TableRow>
        ))}
      </ActionTable>

      <MemberPermissionsModal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
        member={selectedMember}
      />
    </>
  );
};
