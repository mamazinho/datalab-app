import styles from './invites-menu.module.css';
import { useState } from 'react';
import { useMe } from '../../../hooks/use-me';
import { useInviteActions } from '../../../hooks/use-invite-actions';
import type { IUserInvite } from '../../../services/datalab-api/usersResource';

type InviteTab = 'pending' | 'accepted' | 'declined';

const TAB_LABELS: Record<InviteTab, string> = {
  pending: 'Pendentes',
  accepted: 'Aceitos',
  declined: 'Recusados',
};

const InviteActionRow = ({ invite }: { invite: IUserInvite }) => {
  const { acceptFormAction, declineFormAction, isAccepting, isDeclining } = useInviteActions();

  return (
    <div className={styles.inviteRow}>
      <span className={styles.inviteRowCompany}>{invite.company?.name ?? `Empresa #${invite.company_id}`}</span>
      <span className={styles.inviteRowBy}>Por {invite.invited_by?.name ?? 'alguém'}</span>
      <div className={styles.inviteRowActions}>
        <form action={acceptFormAction}>
          <input type="hidden" name="inviteId" value={invite.id} />
          <button className={styles.inviteRowAccept} type="submit" disabled={isAccepting || isDeclining}>
            {isAccepting ? '...' : 'Aceitar'}
          </button>
        </form>
        <form action={declineFormAction}>
          <input type="hidden" name="inviteId" value={invite.id} />
          <button className={styles.inviteRowDecline} type="submit" disabled={isAccepting || isDeclining}>
            {isDeclining ? '...' : 'Recusar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export const InvitesMenu = () => {
  const { data: me } = useMe();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<InviteTab>('pending');

  const allInvites: IUserInvite[] = me?.invites ?? [];
  const pendingCount = allInvites.filter((i) => i.status === 'pending').length;
  const filtered = allInvites.filter((i) => i.status === activeTab);

  return (
    <div className={styles.invitesMenuWrapper}>
      <button className={styles.invitesMenuToggle} onClick={() => setIsOpen((p) => !p)}>
        <span className={styles.invitesMenuToggleLabel}>
          Convites
          {pendingCount > 0 && <span className={styles.invitesBadge}>{pendingCount}</span>}
        </span>
        <svg className={styles.invitesMenuChevron}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.invitesMenuPanel}>
          <div className={styles.invitesTabs}>
            {(Object.keys(TAB_LABELS) as InviteTab[]).map((tab) => (
              <button className={styles.invitesTab}
                key={tab}
                data-active={activeTab === tab}
                onClick={() => setActiveTab(tab)}
              >
                {TAB_LABELS[tab]}
              </button>
            ))}
          </div>
          <div className={styles.invitesScrollArea}>
            {filtered.length === 0 ? (
              <p className={styles.invitesEmpty}>Nenhum convite aqui.</p>
            ) : (
              filtered.map((invite) =>
                activeTab === 'pending' ? (
                  <InviteActionRow key={invite.id} invite={invite} />
                ) : (
                  <div className={styles.inviteRow} key={invite.id}>
                    <span className={styles.inviteRowCompany}>{invite.company?.name ?? `Empresa #${invite.company_id}`}</span>
                    <span className={styles.inviteRowBy}>Por {invite.invited_by?.name ?? 'alguém'}</span>
                  </div>
                ),
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
