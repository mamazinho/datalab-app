import { useCallback, useState } from 'react';
import { AsyncResource } from '../../components/Tools/async-resource';
import { useCompanyContext } from '../../contexts/company';
import { DatalabAPI } from '../../services/datalab-api';
import type { ICompanyMembership } from '../../services/datalab-api/membershipsResource';
import type { IUserInvite } from '../../services/datalab-api/usersResource';
import { InviteMemberModal } from './components/invite-member-modal';
import { MembersList } from './components/members-list';
import { InvitesList } from './components/invites-list';
import {
  InviteMemberButton,
  MembersPageContainer,
  MembersPageHeader,
  MembersPageSubtitle,
  MembersPageTitle,
  TabsContainer,
  TabButton,
} from './company-members.style';

const fetchMembers = () => DatalabAPI.MembershipsResource.listMembers();
const fetchInvites = () => DatalabAPI.MembershipsResource.listInvites();

export const CompanyMembers = () => {
  const { currentCompany } = useCompanyContext();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members');
  const [membersKey, setMembersKey] = useState(0);
  const [invitesKey, setInvitesKey] = useState(0);

  const refreshMembers = useCallback(() => setMembersKey((k) => k + 1), []);
  const refreshInvites = useCallback(() => setInvitesKey((k) => k + 1), []);

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

      <TabsContainer>
        <TabButton active={activeTab === 'members'} onClick={() => setActiveTab('members')}>
          Membros
        </TabButton>
        <TabButton active={activeTab === 'invites'} onClick={() => setActiveTab('invites')}>
          Convites
        </TabButton>
      </TabsContainer>

      {activeTab === 'members' ? (
        <AsyncResource fetcher={fetchMembers} dependencies={[membersKey]}>
          {(members: ICompanyMembership[]) => (
            <MembersList members={members} onRefresh={refreshMembers} />
          )}
        </AsyncResource>
      ) : (
        <AsyncResource fetcher={fetchInvites} dependencies={[invitesKey]}>
          {(invites: IUserInvite[]) => (
            <InvitesList invites={invites} onRefresh={refreshInvites} />
          )}
        </AsyncResource>
      )}

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => { refreshMembers(); refreshInvites(); }}
      />
    </MembersPageContainer>
  );
};
