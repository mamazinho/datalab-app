import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { DatalabAPI } from '../../services/datalab-api';
import { useCompanyContext } from '../../contexts/company';
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

export const CompanyMembers = () => {
  const { currentCompany } = useCompanyContext();
  const [members, setMembers] = useState<ICompanyMembership[]>([]);
  const [invites, setInvites] = useState<IUserInvite[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'members' | 'invites'>('members');

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await DatalabAPI.MembershipsResource.listMembers();
      setMembers(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar membros.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadInvites = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await DatalabAPI.MembershipsResource.listInvites();
      setInvites(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar convites.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'members') {
      void loadMembers();
    } else {
      void loadInvites();
    }
  }, [activeTab, loadMembers, loadInvites]);

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
        <TabButton
          active={activeTab === 'members'}
          onClick={() => setActiveTab('members')}
        >
          Membros
        </TabButton>
        <TabButton
          active={activeTab === 'invites'}
          onClick={() => setActiveTab('invites')}
        >
          Convites
        </TabButton>
      </TabsContainer>

      {activeTab === 'members' ? (
        isLoading ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Carregando membros...</p>
        ) : (
          <MembersList members={members} onRefresh={() => void loadMembers()} />
        )
      ) : (
        isLoading ? (
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Carregando convites...</p>
        ) : (
          <InvitesList invites={invites} onRefresh={() => void loadInvites()} />
        )
      )}

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => {
          void loadMembers();
          void loadInvites();
        }}
      />
    </MembersPageContainer>
  );
};
