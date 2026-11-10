import styles from '../company-members.module.css';
import { ActionTable, TableAction, TableActions, TableHeaders, TableRow } from '../../../components/UI/Tables/ActionTable';
import { PermissionGate } from '../../../components/Tools/permission-gate';
import { useConfirm } from '../../../contexts/confirm';
import { MEMBERSHIP_ROUTE_PERMISSIONS } from '../../../utils/route-permissions';
import { DatalabAPI } from '../../../services/datalab-api';
import { invitesQuery } from '../../../queries';
import type { IUserInvite } from '../../../services/datalab-api/usersResource';
import { useRowActions } from '../../../hooks/use-row-actions';

const statusLabel: Record<string, string> = {
  pending: 'Pendente',
  accepted: 'Aceito',
  rejected: 'Recusado',
};

interface IInvitesListProps {
  invites: IUserInvite[];
}

export const InvitesList = ({ invites }: IInvitesListProps) => {
  const confirm = useConfirm();
  const { rows, isBusy, run } = useRowActions(invitesQuery.queryKey, invites);

  const handleRemove = async (invite: IUserInvite) => {
    const confirmed = await confirm({
      title: 'Remover convite',
      message: `Remover convite para ${invite.email}?`,
      confirmLabel: 'Remover',
    });
    if (!confirmed) return;
    run({
      id: invite.id,
      request: () => DatalabAPI.MembershipsResource.deleteInvite(invite.id),
      successMessage: 'Convite removido.',
      optimistic: null,
    });
  };

  if (rows.length === 0) {
    return <p className={styles.membersEmpty}>Nenhum convite enviado ainda.</p>;
  }

  return (
    <ActionTable>
      <TableHeaders>
        <th>Email</th>
        <th>Status</th>
        <th>Enviado por</th>
        <th>Data</th>
      </TableHeaders>

      {rows.map((invite) => (
        <TableRow key={invite.id}>
          <td>{invite.email}</td>
          <td>
            <span className={styles.inviteStatusBadge} data-status={invite.status}>
              {statusLabel[invite.status] ?? invite.status}
            </span>
          </td>
          <td>
            {invite.invited_by?.name ?? 'Desconhecido'}
            <span className={styles.membersTableCellSecondary}>{invite.invited_by?.email}</span>
          </td>
          <td>{new Date(invite.created_at).toLocaleDateString('pt-BR')}</td>
          <td>
            <PermissionGate route={MEMBERSHIP_ROUTE_PERMISSIONS.removeInvite}>
              <TableActions>
                <TableAction
                  disabled={isBusy(invite.id)}
                  onClick={() => void handleRemove(invite)}
                >
                  Excluir convite
                </TableAction>
              </TableActions>
            </PermissionGate>
          </td>
        </TableRow>
      ))}
    </ActionTable>
  );
};