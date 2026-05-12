import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { ActionTable, TableAction, TableActions, TableHeaders, TableRow } from '../../../components/UI/Tables/ActionTable';
import { DatalabAPI } from '../../../services/datalab-api';
import type { ICompanyMembership } from '../../../services/datalab-api/membershipsResource';
import { MembersEmpty, MembersTableCellSecondary, RoleBadge } from '../company-members.style';
import { MemberPermissionsModal } from './member-permissions-modal';

interface IMembersListProps {
  members: ICompanyMembership[];
  onRefresh: () => void;
}

export const MembersList = ({ members, onRefresh }: IMembersListProps) => {
  const [selectedMember, setSelectedMember] = useState<ICompanyMembership | null>(null);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [removingId, setRemovingId] = useState<number | null>(null);

  const handleRemove = useCallback(
    async (membership: ICompanyMembership) => {
      if (!window.confirm(`Remover ${membership.user?.name ?? 'este membro'} da empresa?`)) return;
      setRemovingId(membership.id);
      try {
        await DatalabAPI.MembershipsResource.removeMember(membership.id);
        toast.success('Membro removido.');
        onRefresh();
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Erro ao remover membro.');
      } finally {
        setRemovingId(null);
      }
    },
    [onRefresh],
  );
  
  if (members.length === 0) {
    return <MembersEmpty>Nenhum membro encontrado.</MembersEmpty>;
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
              <MembersTableCellSecondary>Status: {member.status}</MembersTableCellSecondary>
            </td>
            <td>
              <RoleBadge $owner={member.membership_role === 'owner'}>
                {member.membership_role === 'owner' ? 'Owner' : 'Membro'}
              </RoleBadge>
            </td>
            <td>
              {member.membership_role !== 'owner' && (
                <TableActions>
                  <TableAction onClick={() => { setSelectedMember(member); setIsPermissionsOpen(true); }}>
                    Editar permissões
                  </TableAction>
                  <TableAction
                    disabled={removingId === member.id}
                    onClick={() => void handleRemove(member)}
                  >
                    {removingId === member.id ? 'Removendo...' : 'Remover membro'}
                  </TableAction>
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
