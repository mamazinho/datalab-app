import { useState } from 'react';
import { useAuthContext } from '../../../contexts/auth';
import { useInviteActions } from '../../../hooks/use-invite-actions';
import type { IUserInvite } from '../../../services/datalab-api/usersResource';
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

const InviteActionRow = ({
  invite,
  onRefresh,
}: {
  invite: IUserInvite;
  onRefresh: () => Promise<unknown>;
}) => {
  const { acceptFormAction, declineFormAction, isAccepting, isDeclining } = useInviteActions(onRefresh);

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
