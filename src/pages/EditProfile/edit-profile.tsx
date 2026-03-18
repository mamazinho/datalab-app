import { useActionState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useAuthContext } from '../../contexts/auth';
import { INITIAL_ACTION_STATE, type ActionState } from '../../types/actions';
import type { IUserResponse } from '../../services/datalab-api/usersResource';
import { EditProfileForm } from './components';
import { updateProfileAction } from './actions';
import { EditProfileContainer, EditProfileShell, EditProfileSubtitle, EditProfileTitle } from './edit-profile.style';

export const EditProfile = () => {
  const { me, getMe } = useAuthContext();
  const [formState, formAction, isPending] = useActionState(
    updateProfileAction,
    INITIAL_ACTION_STATE,
  );

  const handleActionResult = useCallback(async (state: ActionState<IUserResponse>) => {
    if (state.timestamp === 0) return;

    if (state.success && state.data) {
      localStorage.setItem('myData', JSON.stringify(state.data));
      await getMe();
      toast.success('Perfil atualizado com sucesso!');
      return;
    }

    if (state.error) {
      toast.error(state.error);
    }
  }, [getMe]);

  useEffect(() => {
    void handleActionResult(formState);
  }, [formState, handleActionResult]);

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
