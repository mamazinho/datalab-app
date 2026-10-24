import styles from './edit-profile.module.css';
import { useActionState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { useMe } from '../../hooks/use-me';
import { meQuery } from '../../queries';
import { INITIAL_ACTION_STATE } from '../../types/actions';
import { useActionFeedback } from '../../hooks/use-action-feedback';
import { DeleteAccount, EditProfileForm } from './components';
import { updateProfileAction } from './actions';

export const EditProfile = () => {
  const { data: me } = useMe();
  const queryClient = useQueryClient();
  const [formState, formAction, isPending] = useActionState(
    updateProfileAction,
    INITIAL_ACTION_STATE,
  );

  useActionFeedback(formState, {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
      toast.success('Perfil atualizado com sucesso!');
    },
  });

  if (!me?.id) {
    return null;
  }

  return (
    <div className={styles.editProfileShell}>
      <section className={styles.editProfileContainer}>
        <h1 className={styles.editProfileTitle}>Editar perfil</h1>
        <p className={styles.editProfileSubtitle}>
          Atualize suas informações pessoais, foto e preferências de tema.
        </p>

        <EditProfileForm
          user={me}
          action={formAction}
          isPending={isPending}
          error={formState.error}
        />

        <DeleteAccount me={me} />
      </section>
    </div>
  );
};
