import styles from '../company-members.module.css';
import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { ActionTable, TableAction, TableActions, TableHeaders, TableRow } from '../../../components/UI/Tables/ActionTable';
import { useCompanyContext } from '../../../contexts/company';
import { useConfirm, type IConfirmOptions } from '../../../contexts/confirm';
import { DatalabAPI } from '../../../services/datalab-api';
import { currentMembershipQuery, meQuery, membersQuery } from '../../../queries';
import type { ICompanyMembership } from '../../../services/datalab-api/membershipsResource';
import { MEMBERSHIP_ROUTE_PERMISSIONS } from '../../../utils/route-permissions';
import { MemberPermissionsModal } from './member-permissions-modal';
import { useRowActions } from '../../../hooks/use-row-actions';

interface IMembersListProps {
  members: ICompanyMembership[];
}

const nameOf = (member: ICompanyMembership) => member.user?.name ?? 'este membro';

export const MembersList = ({ members }: IMembersListProps) => {
  const queryClient = useQueryClient();
  const confirm = useConfirm();
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
  const { rows, busyId, run } = useRowActions(membersQuery.queryKey, members);

  const runMemberAction = async (
    member: ICompanyMembership,
    confirmation: IConfirmOptions,
    request: () => Promise<unknown>,
    successMessage: string,
    optimistic?: ICompanyMembership | null,
  ) => {
    if (await confirm(confirmation)) run({ id: member.id, request, successMessage, optimistic });
  };

  const removeMember = (member: ICompanyMembership) =>
    runMemberAction(
      member,
      { title: 'Remover membro', message: `Remover ${nameOf(member)} da empresa?`, confirmLabel: 'Remover' },
      () => DatalabAPI.MembershipsResource.removeMember(member.id),
      'Membro removido.',
      null,
    );

  const transferOwnership = (member: ICompanyMembership) =>
    runMemberAction(
      member,
      {
        title: 'Transferir posse',
        message: `Transferir a posse da empresa para ${nameOf(member)}? Você continua na empresa como membro, com todas as permissões.`,
        confirmLabel: 'Transferir',
      },
      async () => {
        await DatalabAPI.MembershipsResource.transferOwnership(member.id);
        void queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
        if (currentCompany) void queryClient.invalidateQueries({ queryKey: currentMembershipQuery(currentCompany.id).queryKey });
      },
      `${nameOf(member)} agora é o owner da empresa.`,
    );

  if (rows.length === 0) {
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

        {rows.map((member) => (
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
