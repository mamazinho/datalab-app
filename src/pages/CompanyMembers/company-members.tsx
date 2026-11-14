import styles from './company-members.module.css';
import { useState } from 'react';
import { QueryBoundary } from '../../components/Tools/query-boundary';
import { PermissionGate } from '../../components/Tools/permission-gate';
import { MEMBERSHIP_ROUTE_PERMISSIONS, type IRoutePermissionRef } from '../../utils/route-permissions';
import { Toggle } from '../../components/UI/Inputs/Toggle';
import { StateTabs, type IStateTabItem } from '../../components/UI/Tabs';
import { useCompanyContext } from '../../contexts/company';
import { useMembers } from '../../hooks/use-members';
import { useInvites } from '../../hooks/use-invites';
import { InviteMemberModal } from './components/invite-member-modal';
import { MembersList } from './components/members-list';
import { InvitesList } from './components/invites-list';

type MembersTabValue = 'members' | 'invites';

const MEMBERS_TABS: (IStateTabItem<MembersTabValue> & { route: IRoutePermissionRef })[] = [
  { label: 'Membros', value: 'members', route: MEMBERSHIP_ROUTE_PERMISSIONS.list },
  { label: 'Convites', value: 'invites', route: MEMBERSHIP_ROUTE_PERMISSIONS.listInvites },
];

const MembersTab = ({ includeInactive }: { includeInactive: boolean }) => {
  const { data: members } = useMembers(includeInactive);

  return <MembersList members={members} includeInactive={includeInactive} />;
};

const InvitesTab = () => {
  const { data: invites } = useInvites();

  return <InvitesList invites={invites} />;
};

export const CompanyMembers = () => {
  const { currentCompany, hasPermissionByRoute } = useCompanyContext();
  const tabs = MEMBERS_TABS.filter((tab) => hasPermissionByRoute(tab.route));
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState<MembersTabValue>('members');
  const [includeInactive, setIncludeInactive] = useState(false);
  // Permissions may arrive after the first render, so the visible tab is derived, not stored
  const activeTab = tabs.find((tab) => tab.value === selectedTab)?.value ?? tabs[0]?.value;

  return (
    <div className={styles.membersPageContainer}>
      <div className={styles.membersPageHeader}>
        <div>
          <h1 className={styles.membersPageTitle}>Gerenciamento de membros</h1>
          <p className={styles.membersPageSubtitle}>
            {currentCompany?.name} · Gerencie quem tem acesso e quais rotas cada membro pode usar.
          </p>
        </div>
        <PermissionGate route={MEMBERSHIP_ROUTE_PERMISSIONS.invite}>
          <button className={styles.inviteMemberButton} onClick={() => setIsInviteOpen(true)}>
            + Convidar membros
          </button>
        </PermissionGate>
      </div>

      {activeTab && (
        <>
          <StateTabs items={tabs} value={activeTab} onChange={setSelectedTab} />

          {activeTab === 'members' && (
            <div className={styles.membersFilter}>
              <Toggle
                label="Mostrar ex-membros"
                checked={includeInactive}
                onChange={(event) => setIncludeInactive(event.target.checked)}
              />
            </div>
          )}

          <QueryBoundary>
            {activeTab === 'members' ? <MembersTab includeInactive={includeInactive} /> : <InvitesTab />}
          </QueryBoundary>
        </>
      )}

      {/* Mounted only while open, so closing discards what was typed */}
      {isInviteOpen && <InviteMemberModal isOpen onClose={() => setIsInviteOpen(false)} />}
    </div>
  );
};
