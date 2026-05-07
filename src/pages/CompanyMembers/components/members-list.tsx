import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { DatalabAPI } from '../../../services/datalab-api';
import type { ICompanyMembership } from '../../../services/datalab-api/membershipsResource';
import { MemberPermissionsModal } from './member-permissions-modal';
import {
  MemberActionButton,
  MemberActionsCell,
  MemberRemoveButton,
  MembersEmpty,
  MembersTable,
  MembersTableCell,
  MembersTableCellSecondary,
  MembersTableHeader,
  MembersTableHeaderCell,
  MembersTableRow,
  RoleBadge,
} from '../company-members.style';

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

  const openPermissions = (member: ICompanyMembership) => {
    setSelectedMember(member);
    setIsPermissionsOpen(true);
  };

  if (members.length === 0) {
    return <MembersEmpty>Nenhum membro encontrado.</MembersEmpty>;
  }

  return (
    <>
      <MembersTable>
        <MembersTableHeader>
          <MembersTableHeaderCell>Nome</MembersTableHeaderCell>
          <MembersTableHeaderCell>E-mail</MembersTableHeaderCell>
          <MembersTableHeaderCell>Papel</MembersTableHeaderCell>
          <MembersTableHeaderCell>Ações</MembersTableHeaderCell>
        </MembersTableHeader>

        {members.map((member) => (
          <MembersTableRow key={member.id}>
            <MembersTableCell>
              {member.user?.name ?? '—'}
            </MembersTableCell>
            <MembersTableCell>
              {member.user?.email ?? '—'}
              <MembersTableCellSecondary>
                Status: {member.status}
              </MembersTableCellSecondary>
            </MembersTableCell>
            <MembersTableCell>
              <RoleBadge $owner={member.membership_role === 'owner'}>
                {member.membership_role === 'owner' ? 'Owner' : 'Membro'}
              </RoleBadge>
            </MembersTableCell>
            <MembersTableCell>
              <MemberActionsCell>
                {member.membership_role !== 'owner' && (
                  <MemberActionButton onClick={() => openPermissions(member)}>
                    Permissões
                  </MemberActionButton>
                )}
                {member.membership_role !== 'owner' && (
                  <MemberRemoveButton
                    disabled={removingId === member.id}
                    onClick={() => void handleRemove(member)}
                  >
                    {removingId === member.id ? '...' : 'Remover'}
                  </MemberRemoveButton>
                )}
              </MemberActionsCell>
            </MembersTableCell>
          </MembersTableRow>
        ))}
      </MembersTable>

      <MemberPermissionsModal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
        member={selectedMember}
      />
    </>
  );
};
