import styles from '../onboarding.module.css';
import { useActionState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useMe } from '../../../hooks/use-me';
import { meQuery } from '../../../queries';
import { useCompanyContext } from '../../../contexts/company';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { createCompanyAction } from '../actions';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import { useInviteActions } from '../../../hooks/use-invite-actions';
import type { IUserInvite } from '../../../services/datalab-api/usersResource';

const InviteRow = ({ invite }: { invite: IUserInvite }) => {
  const { acceptFormAction, declineFormAction, isAccepting, isDeclining } = useInviteActions();

  return (
    <li className={styles.inviteItem}>
      <div className={styles.inviteInfo}>
        <span className={styles.inviteCompanyName}>{invite.company?.name ?? `Empresa #${invite.company_id}`}</span>
        <span className={styles.inviteBy}>Convidado por {invite.invited_by?.name ?? 'alguém'}</span>
      </div>
      <div className={styles.inviteActions}>
        <form action={acceptFormAction}>
          <input type="hidden" name="inviteId" value={invite.id} />
          <button className={styles.inviteAcceptButton} type="submit" disabled={isAccepting || isDeclining}>
            {isAccepting ? '...' : 'Aceitar'}
          </button>
        </form>
        <form action={declineFormAction}>
          <input type="hidden" name="inviteId" value={invite.id} />
          <button className={styles.inviteDeclineButton} type="submit" disabled={isAccepting || isDeclining}>
            {isDeclining ? '...' : 'Recusar'}
          </button>
        </form>
      </div>
    </li>
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
    <div className={styles.onboardingWrapper}>
      <div className={styles.onboardingCard}>
        <h1 className={styles.onboardingTitle}>Bem-vindo ao DataLab</h1>
        <p className={styles.onboardingSubtitle}>
          Para começar, você precisa pertencer a uma empresa.
          Aceite um convite ou crie uma nova empresa abaixo.
        </p>

        <p>Você tem {pendingInvites.length} convite(s) pendente(s).</p>
        {pendingInvites.length > 0 && (
          <div>
            <ul className={styles.inviteList}>
              {pendingInvites.map((invite) => (
                <InviteRow key={invite.id} invite={invite} />
              ))}
            </ul>
          </div>
        )}
        <div className={styles.onboardingDivider} />
        <p className={styles.onboardingSubtitle}>Crie sua própria empresa para começar.</p>

        <form className={styles.onboardingForm} action={createFormAction}>
          <fieldset className={styles.onboardingFieldset} disabled={isCreating}>
            <div className={styles.onboardingField}>
              <label className={styles.onboardingLabel} htmlFor="companyName">Nome da empresa</label>
              <input className={styles.onboardingInput}
                id="companyName"
                type="text"
                name="name"
                placeholder="Ex: Minha Empresa Ltda."
                autoComplete="organization"
                required
                minLength={2}
                autoFocus={pendingInvites.length === 0}
              />
            </div>
            {createState.error && createState.timestamp > 0 && (
              <p className={styles.onboardingError}>{createState.error}</p>
            )}
            <button className={styles.onboardingSubmit} type="submit">
              {isCreating ? 'Criando...' : 'Criar empresa'}
            </button>
          </fieldset>
        </form>
      </div>
    </div>
  );
};
