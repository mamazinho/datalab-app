import styles from '../edit-profile.module.css';
import designSystemStyles from '../../../styles/design-system.module.css';
import { useActionState, useState } from 'react';
import { Modal } from '../../../components/UI/Modal/modal';
import { useAuthContext } from '../../../contexts/auth';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import type { IUserResponse } from '../../../services/datalab-api/usersResource';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { deleteAccountAction } from '../actions';

export const DeleteAccount = ({ me }: { me: IUserResponse }) => {
  const { logout } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [formState, formAction, isPending] = useActionState(deleteAccountAction, INITIAL_ACTION_STATE);
  const ownsACompany = me.companies.some((company) => company.membership.membership_role === 'owner');

  useActionFeedback(formState, {
    successMessage: 'Sua conta foi excluída.',
    onSuccess: logout,
    onError: () => {},
  });

  const close = () => {
    setIsOpen(false);
    setConfirmation('');
  };

  return (
    <section className={styles.dangerZone} aria-labelledby="delete-account-title">
      <h2 className={styles.dangerTitle} id="delete-account-title">Excluir conta</h2>
      <p className={styles.dangerText}>Seus dados pessoais são apagados e você sai de todas as empresas. Não dá para desfazer.</p>
      <button className={styles.dangerButton} type="button" onClick={() => setIsOpen(true)}>
        Excluir minha conta
      </button>

      <Modal isOpen={isOpen} onClose={close} title="Excluir sua conta?">
        <form className={styles.deleteAccountForm} action={formAction}>
          {me.companies.length > 0 && (
            <div>
              <p className={styles.dangerText}>Você vai sair de todas as empresas em que participa:</p>
              <ul className={styles.companyList}>
                {me.companies.map((company) => (
                  <li key={company.id}>
                    {company.name}
                    {company.membership.membership_role === 'owner' && <span className={designSystemStyles.badge}>Owner</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {ownsACompany && (
            <p className={styles.dangerText}>
              Nas empresas em que você é owner, transfira a posse para outro membro antes. Se você for o único
              membro, a empresa é excluída junto.
            </p>
          )}

          <div className={designSystemStyles.field}>
            <label className={designSystemStyles.label} htmlFor="confirm-account-email">Para confirmar, digite seu e-mail</label>
            <input className={designSystemStyles.input}
              id="confirm-account-email"
              autoComplete="off"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={me.email}
            />
          </div>

          {formState.error && <p className={designSystemStyles.errorText} role="alert">{formState.error}</p>}

          <button className={styles.deleteAccountSubmit} type="submit" disabled={confirmation.trim().toLowerCase() !== me.email.toLowerCase() || isPending}>
            {isPending ? 'Excluindo...' : 'Excluir conta'}
          </button>
        </form>
      </Modal>
    </section>
  );
};
