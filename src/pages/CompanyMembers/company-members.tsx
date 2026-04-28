import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { DatalabAPI } from '../../services/datalab-api';
import { useCompanyContext } from '../../contexts/company';
import type { ICompanyMembership } from '../../services/datalab-api/usersResource';
import { InviteMemberModal } from './components/invite-member-modal';
import { MembersList } from './components/members-list';
import {
  InviteMemberButton,
  MembersPageContainer,
  MembersPageHeader,
  MembersPageSubtitle,
  MembersPageTitle,
} from './company-members.style';

export const CompanyMembers = () => {
  const { currentCompany } = useCompanyContext();
  const [members, setMembers] = useState<ICompanyMembership[]>([]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const loadMembers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await DatalabAPI.CompanyMembersResource.listMembers();
      setMembers(data);
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Erro ao carregar membros.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadMembers();
  }, [loadMembers]);

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
          + Convidar membro
        </InviteMemberButton>
      </MembersPageHeader>

      {isLoading ? (
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Carregando membros...</p>
      ) : (
        <MembersList members={members} onRefresh={() => void loadMembers()} />
      )}

      <InviteMemberModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={() => void loadMembers()}
      />
    </MembersPageContainer>
  );
};
