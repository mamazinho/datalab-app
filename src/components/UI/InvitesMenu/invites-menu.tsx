import { useActionState, useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { useAuthContext } from '../../../contexts/auth';
import { DatalabAPI } from '../../../services/datalab-api';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import type { IUserInvite } from '../../../services/datalab-api/usersResource';
import type { ActionState } from '../../../types/actions';
import {
  InviteRow,
  InviteRowAccept,
  InviteRowActions,
  InviteRowBy,
  InviteRowCompany,
  InviteRowDecline,
  InvitesBadge,
  InvitesEmpty,
  InvitesMenuChevron,
  InvitesMenuPanel,
  InvitesMenuToggle,
  InvitesMenuToggleLabel,
  InvitesMenuWrapper,
  InvitesScrollArea,
  InvitesTab,
  InvitesTabs,
} from './invites-menu.style';

type InviteTab = 'pending' | 'accepted' | 'declined';

const TAB_LABELS: Record<InviteTab, string> = {
  pending: 'Pendentes',
  accepted: 'Aceitos',
  declined: 'Recusados',
};

async function acceptAction(
  _prev: ActionState<never>,
  formData: FormData,
): Promise<ActionState<never>> {
  const id = Number(formData.get('inviteId'));
  try {
    await DatalabAPI.UsersResource.acceptInvite(id);
    return { success: true, timestamp: Date.now() };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : String(e), timestamp: Date.now() };
  }
}

async function declineAction(
  _prev: ActionState<never>,
  formData: FormData,
): Promise<ActionState<never>> {
  const id = Number(formData.get('inviteId'));
  try {
    await DatalabAPI.UsersResource.declineInvite(id);
    return { success: true, timestamp: Date.now() };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : String(e), timestamp: Date.now() };
  }
}

const InviteActionRow = ({
  invite,
  onRefresh,
}: {
  invite: IUserInvite;
  onRefresh: () => Promise<unknown>;
}) => {
  const [acceptState, acceptFormAction, isAccepting] = useActionState(acceptAction, INITIAL_ACTION_STATE);
  const [declineState, declineFormAction, isDeclining] = useActionState(declineAction, INITIAL_ACTION_STATE);

  const handleAccept = useCallback((state: ActionState<never>) => {
    if (state.timestamp === 0) return;
    if (state.success) {
      toast.success('Convite aceito!');
      void onRefresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [onRefresh]);

  const handleDecline = useCallback((state: ActionState<never>) => {
    if (state.timestamp === 0) return;
    if (state.success) {
      toast.info('Convite recusado.');
      void onRefresh();
    } else if (state.error) {
      toast.error(state.error);
    }
  }, [onRefresh]);

  useEffect(() => { handleAccept(acceptState); }, [acceptState, handleAccept]);
  useEffect(() => { handleDecline(declineState); }, [declineState, handleDecline]);

  return (
    <InviteRow>
      <InviteRowCompany>{invite.company?.name ?? `Empresa #${invite.company_id}`}</InviteRowCompany>
      <InviteRowBy>Por {invite.invited_by?.name ?? 'alguém'}</InviteRowBy>
      <InviteRowActions>
        <form action={acceptFormAction}>
          <input type="hidden" name="inviteId" value={invite.id} />
          <InviteRowAccept type="submit" disabled={isAccepting || isDeclining}>
            {isAccepting ? '...' : 'Aceitar'}
          </InviteRowAccept>
        </form>
        <form action={declineFormAction}>
          <input type="hidden" name="inviteId" value={invite.id} />
          <InviteRowDecline type="submit" disabled={isAccepting || isDeclining}>
            {isDeclining ? '...' : 'Recusar'}
          </InviteRowDecline>
        </form>
      </InviteRowActions>
    </InviteRow>
  );
};

export const InvitesMenu = () => {
  const { me, getMe } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<InviteTab>('pending');

  const allInvites: IUserInvite[] = me?.invites ?? [];
  const pendingCount = allInvites.filter((i) => i.status === 'pending').length;
  const filtered = allInvites.filter((i) => i.status === activeTab);

  return (
    <InvitesMenuWrapper>
      <InvitesMenuToggle onClick={() => setIsOpen((p) => !p)}>
        <InvitesMenuToggleLabel>
          Convites
          {pendingCount > 0 && <InvitesBadge>{pendingCount}</InvitesBadge>}
        </InvitesMenuToggleLabel>
        <InvitesMenuChevron
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </InvitesMenuChevron>
      </InvitesMenuToggle>

      {isOpen && (
        <InvitesMenuPanel>
          <InvitesTabs>
            {(Object.keys(TAB_LABELS) as InviteTab[]).map((tab) => (
              <InvitesTab
                key={tab}
                $active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {TAB_LABELS[tab]}
              </InvitesTab>
            ))}
          </InvitesTabs>
          <InvitesScrollArea>
            {filtered.length === 0 ? (
              <InvitesEmpty>Nenhum convite aqui.</InvitesEmpty>
            ) : (
              filtered.map((invite) =>
                activeTab === 'pending' ? (
                  <InviteActionRow key={invite.id} invite={invite} onRefresh={getMe} />
                ) : (
                  <InviteRow key={invite.id}>
                    <InviteRowCompany>{invite.company?.name ?? `Empresa #${invite.company_id}`}</InviteRowCompany>
                    <InviteRowBy>Por {invite.invited_by?.name ?? 'alguém'}</InviteRowBy>
                  </InviteRow>
                ),
              )
            )}
          </InvitesScrollArea>
        </InvitesMenuPanel>
      )}
    </InvitesMenuWrapper>
  );
};
