import { useActionState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMe } from '../../../hooks/use-me';
import { meQuery } from '../../../queries';
import { useCompanyContext } from '../../../contexts/company';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import {
  InviteAcceptButton,
  InviteActions,
  InviteBy,
  InviteCompanyName,
  InviteDeclineButton,
  InviteInfo,
  InviteItem,
  InviteList,
  OnboardingCard,
  OnboardingDivider,
  OnboardingError,
  OnboardingField,
  OnboardingFieldset,
  OnboardingForm,
  OnboardingInput,
  OnboardingLabel,
  OnboardingSubmit,
  OnboardingSubtitle,
  OnboardingTitle,
  OnboardingWrapper,
} from '../onboarding.style';
import { createCompanyAction } from '../actions';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import { useInviteActions } from '../../../hooks/use-invite-actions';
import type { IUserInvite } from '../../../services/datalab-api/usersResource';

const InviteRow = ({ invite }: { invite: IUserInvite }) => {
  const { acceptFormAction, declineFormAction, isAccepting, isDeclining } = useInviteActions();

  return (
    <InviteItem>
      <InviteInfo>
        <InviteCompanyName>{invite.company?.name ?? `Empresa #${invite.company_id}`}</InviteCompanyName>
        <InviteBy>Convidado por {invite.invited_by?.name ?? 'alguém'}</InviteBy>
      </InviteInfo>
      <InviteActions>
        <form action={acceptFormAction}>
          <input type="hidden" name="inviteId" value={invite.id} />
          <InviteAcceptButton type="submit" disabled={isAccepting || isDeclining}>
            {isAccepting ? '...' : 'Aceitar'}
          </InviteAcceptButton>
        </form>
        <form action={declineFormAction}>
          <input type="hidden" name="inviteId" value={invite.id} />
          <InviteDeclineButton type="submit" disabled={isAccepting || isDeclining}>
            {isDeclining ? '...' : 'Recusar'}
          </InviteDeclineButton>
        </form>
      </InviteActions>
    </InviteItem>
  );
};

export const OnboardingWelcome = () => {
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  const { selectCompanyById } = useCompanyContext();
  const navigate = useNavigate();

  const pendingInvites = (me?.invites ?? []).filter((i) => i.status === 'pending');

  const [createState, createFormAction, isCreating] = useActionState(
    createCompanyAction,
    INITIAL_ACTION_STATE,
  );

  useActionFeedback(createState, {
    successMessage: 'Empresa criada com sucesso!',
    onSuccess: async (data) => {
      if (!data) return;
      selectCompanyById(data.company.id);
      // /memberships/current (com o novo X-Company-Id) já traz o membership fresco;
      // invalidar me repõe a empresa na lista antes de navegar.
      await queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
      navigate('/');
    },
  });

  return (
    <OnboardingWrapper>
      <OnboardingCard>
        <OnboardingTitle>Bem-vindo ao DataLab</OnboardingTitle>
        <OnboardingSubtitle>
          Para começar, você precisa pertencer a uma empresa.
          Aceite um convite ou crie uma nova empresa abaixo.
        </OnboardingSubtitle>

        <p>Você tem {pendingInvites.length} convite(s) pendente(s).</p>
        {pendingInvites.length > 0 && (
          <div>
            <InviteList>
              {pendingInvites.map((invite) => (
                <InviteRow key={invite.id} invite={invite} />
              ))}
            </InviteList>
          </div>
        )}
        <OnboardingDivider />
        <OnboardingSubtitle>Crie sua própria empresa para começar.</OnboardingSubtitle>

        <OnboardingForm action={createFormAction}>
          <OnboardingFieldset disabled={isCreating}>
            <OnboardingField>
              <OnboardingLabel htmlFor="companyName">Nome da empresa</OnboardingLabel>
              <OnboardingInput
                id="companyName"
                type="text"
                name="name"
                placeholder="Ex: Minha Empresa Ltda."
                autoComplete="organization"
                required
                minLength={2}
                autoFocus={pendingInvites.length === 0}
              />
            </OnboardingField>
            {createState.error && createState.timestamp > 0 && (
              <OnboardingError>{createState.error}</OnboardingError>
            )}
            <OnboardingSubmit type="submit">
              {isCreating ? 'Criando...' : 'Criar empresa'}
            </OnboardingSubmit>
          </OnboardingFieldset>
        </OnboardingForm>
      </OnboardingCard>
    </OnboardingWrapper>
  );
};
