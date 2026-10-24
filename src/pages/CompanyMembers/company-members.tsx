import styles from './company-members.module.css';
import { useState } from 'react';
import { QueryBoundary } from '../../components/Tools/query-boundary';
import { StateTabs, type IStateTabItem } from '../../components/UI/Tabs';
import { useCompanyContext } from '../../contexts/company';
import { useMembers } from '../../hooks/use-members';
import { useInvites } from '../../hooks/use-invites';
import { InviteMemberModal } from './components/invite-member-modal';
import { MembersList } from './components/members-list';
import { InvitesList } from './components/invites-list';

type MembersTabValue = 'members' | 'invites';

const MEMBERS_TABS: IStateTabItem<MembersTabValue>[] = [
  { label: 'Membros', value: 'members' },
  { label: 'Convites', value: 'invites' },
];

const MembersTab = () => {
  const { data: members } = useMembers();

  return <MembersList members={members} />;
};

const InvitesTab = () => {
  const { data: invites } = useInvites();

  return <InvitesList invites={invites} />;
};

export const CompanyMembers = () => {
  const { currentCompany } = useCompanyContext();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<MembersTabValue>('members');

  return (
    <div className={styles.membersPageContainer}>
      <div className={styles.membersPageHeader}>
        <div>
          <h1 className={styles.membersPageTitle}>Gerenciamento de membros</h1>
          <p className={styles.membersPageSubtitle}>
            {currentCompany?.name} · Gerencie quem tem acesso e quais rotas cada membro pode usar.
          </p>
        </div>
        <button className={styles.inviteMemberButton} onClick={() => setIsInviteOpen(true)}>
          + Convidar membros
        </button>
      </div>

      <StateTabs items={MEMBERS_TABS} value={activeTab} onChange={setActiveTab} />

      <QueryBoundary>
        {activeTab === 'members' ? <MembersTab /> : <InvitesTab />}
      </QueryBoundary>

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </div>
  );
};
