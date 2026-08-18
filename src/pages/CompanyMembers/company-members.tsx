import { useState } from 'react';
import { QueryBoundary } from '../../components/Tools/query-boundary';
import { StateTabs, type IStateTabItem } from '../../components/UI/Tabs';
import { useCompanyContext } from '../../contexts/company';
import { useMembers } from '../../hooks/use-members';
import { useInvites } from '../../hooks/use-invites';
import { InviteMemberModal } from './components/invite-member-modal';
import { MembersList } from './components/members-list';
import { InvitesList } from './components/invites-list';
import {
  InviteMemberButton,
  MembersPageContainer,
  MembersPageHeader,
  MembersPageSubtitle,
  MembersPageTitle,
} from './company-members.style';

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
    <MembersPageContainer>
      <MembersPageHeader>
        <div>
          <MembersPageTitle>Gerenciamento de membros</MembersPageTitle>
          <MembersPageSubtitle>
            {currentCompany?.name} · Gerencie quem tem acesso e quais rotas cada membro pode usar.
          </MembersPageSubtitle>
        </div>
        <InviteMemberButton onClick={() => setIsInviteOpen(true)}>
          + Convidar membros
        </InviteMemberButton>
      </MembersPageHeader>

      <StateTabs items={MEMBERS_TABS} value={activeTab} onChange={setActiveTab} />

      <QueryBoundary>
        {activeTab === 'members' ? <MembersTab /> : <InvitesTab />}
      </QueryBoundary>

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
      />
    </MembersPageContainer>
  );
};
