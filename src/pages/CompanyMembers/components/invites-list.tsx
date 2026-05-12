import { useCallback, useState } from 'react';
import { toast } from 'react-toastify';
import { ActionTable, TableAction, TableActions, TableHeaders, TableRow } from '../../../components/UI/Tables/ActionTable';
import { DatalabAPI } from '../../../services/datalab-api';
import type { IUserInvite } from '../../../services/datalab-api/usersResource';
import { InviteStatusBadge, MembersEmpty, MembersTableCellSecondary } from '../company-members.style';

const statusLabel: Record<string, string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  rejected: 'Recusado',
};

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
    <ActionTable>
      <TableHeaders>
        <th>Email</th>
        <th>Status</th>
        <th>Enviado por</th>
        <th>Data</th>
      </TableHeaders>

      {invites.map((invite) => (
        <TableRow key={invite.id}>
          <td>{invite.email}</td>
          <td>
            <InviteStatusBadge $status={invite.status as 'pending' | 'accepted' | 'rejected'}>
              {statusLabel[invite.status] ?? invite.status}
            </InviteStatusBadge>
          </td>
          <td>
            {invite.invited_by?.name ?? 'Desconhecido'}
            <MembersTableCellSecondary>{invite.invited_by?.email}</MembersTableCellSecondary>
          </td>
          <td>{new Date(invite.created_at).toLocaleDateString('pt-BR')}</td>
          <td>
            <TableActions>
              <TableAction
                disabled={removingId === invite.id}
                onClick={() => void handleRemove(invite)}
              >
                {removingId === invite.id ? 'Excluindo...' : 'Excluir convite'}
              </TableAction>
            </TableActions>
          </td>
        </TableRow>
      ))}
    </ActionTable>
  );
};