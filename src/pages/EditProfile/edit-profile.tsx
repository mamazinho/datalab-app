import { useActionState } from 'react';
import { toast } from 'react-toastify';
import { useAuthContext } from '../../contexts/auth';
import { INITIAL_ACTION_STATE } from '../../types/actions';
import { useActionFeedback } from '../../hooks/use-action-feedback';
import { EditProfileForm } from './components';
import { updateProfileAction } from './actions';
import { EditProfileContainer, EditProfileShell, EditProfileSubtitle, EditProfileTitle } from './edit-profile.style';

export const EditProfile = () => {
  const { me, getMe } = useAuthContext();
  const [formState, formAction, isPending] = useActionState(
    updateProfileAction,
    INITIAL_ACTION_STATE,
  );

  useActionFeedback(formState, {
    onSuccess: async () => {
      await getMe();
      toast.success('Perfil atualizado com sucesso!');
    },
  });

  if (!me?.id) {
    return null;
  }

  return (
    <EditProfileShell>
      <EditProfileContainer>
        <EditProfileTitle>Editar perfil</EditProfileTitle>
        <EditProfileSubtitle>
          Atualize suas informações pessoais, foto e preferências de tema.
        </EditProfileSubtitle>

        <EditProfileForm
          user={me}
          action={formAction}
          isPending={isPending}
          error={formState.error}
        />
      </EditProfileContainer>
    </EditProfileShell>
  );
};
