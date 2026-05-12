import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { DatalabAPI } from '../../../services/datalab-api';
import type { IUserInvite } from '../../../services/datalab-api/usersResource';
import {
  MemberActionButton,
  MembersEmpty,
  MembersTable,
  MembersTableCell,
  MembersTableCellSecondary,
  MembersTableHeader,
  MembersTableHeaderCell,
  MembersTableRow,
} from '../company-members.style';

interface IInvitesListProps {
  invites: IUserInvite[];
  onRefresh: () => void;
}

export const InvitesList = ({ invites, onRefresh }: IInvitesListProps) => {
  const [removingId, setRemovingId] = useState<number | null>(null);

  const handleRemove = useCallback(
    async (invite: IUserInvite) => {
      if (!window.confirm(`Remover convite para ${invite.email}?`)) return;
      setRemovingId(invite.id);
      try {
        await DatalabAPI.MembershipsResource.deleteInvite(invite.id);
        toast.success('Convite removido.');
        onRefresh();
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : 'Erro ao remover convite.');
      } finally {
        setRemovingId(null);
      }
    },
    [onRefresh],
  );

  if (invites.length === 0) {
    return <MembersEmpty>Nenhum convite enviado ainda.</MembersEmpty>;
  }

  return (
    <MembersTable style={{ gridTemplateColumns: '1fr 1fr 1fr auto auto' }}>
      <MembersTableHeader style={{ gridTemplateColumns: '1fr 1fr 1fr auto auto' }}>
        <MembersTableHeaderCell>Email</MembersTableHeaderCell>
        <MembersTableHeaderCell>Status</MembersTableHeaderCell>
        <MembersTableHeaderCell>Enviado por</MembersTableHeaderCell>
        <MembersTableHeaderCell>Data</MembersTableHeaderCell>
        <MembersTableHeaderCell>Ações</MembersTableHeaderCell>
      </MembersTableHeader>
      {invites.map((invite) => (
        <MembersTableRow key={invite.id} style={{ gridTemplateColumns: '1fr 1fr 1fr auto auto' }}>
          <MembersTableCell>
            {invite.email}
          </MembersTableCell>
          <MembersTableCell>
            <span style={{
              color: invite.status === 'pending' ? '#f59e0b' :
                     invite.status === 'accepted' ? '#10b981' : '#ef4444'
            }}>
              {invite.status === 'pending' ? 'Pendente' :
               invite.status === 'accepted' ? 'Aceito' : 'Recusado'}
            </span>
          </MembersTableCell>
          <MembersTableCell>
            {invite.invited_by?.name ?? 'Desconhecido'}
            <MembersTableCellSecondary>
              {invite.invited_by?.email}
            </MembersTableCellSecondary>
          </MembersTableCell>
          <MembersTableCell>
            {new Date(invite.created_at).toLocaleDateString('pt-BR')}
          </MembersTableCell>
          <MembersTableCell>
            <MemberActionButton
              onClick={() => handleRemove(invite)}
              disabled={removingId === invite.id}
            >
              {removingId === invite.id ? 'Removendo...' : 'Remover'}
            </MemberActionButton>
          </MembersTableCell>
        </MembersTableRow>
      ))}
    </MembersTable>
  );
};