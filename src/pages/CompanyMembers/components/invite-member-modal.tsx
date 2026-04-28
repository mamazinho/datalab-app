import { useActionState, useCallback, useEffect } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '../../../components/UI/Modal/modal';
import { DatalabAPI } from '../../../services/datalab-api';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import type { ActionState } from '../../../types/actions';
import type { IUserInvite } from '../../../services/datalab-api/usersResource';
import {
  ModalError,
  ModalField,
  ModalFieldset,
  ModalForm,
  ModalInput,
  ModalLabel,
  ModalSelect,
  ModalSubmit,
} from '../company-members.style';

async function inviteMemberAction(
  _prev: ActionState<IUserInvite>,
  formData: FormData,
): Promise<ActionState<IUserInvite>> {
  const email = (formData.get('email') as string).trim();
  const role = formData.get('role') as 'owner' | 'member';

  if (!email) {
    return { success: false, error: 'E-mail é obrigatório.', timestamp: Date.now() };
  }

  try {
    const data = await DatalabAPI.CompanyInvitesResource.createInvite({ email, membership_role: role });
    return { success: true, data, timestamp: Date.now() };
  } catch (e: unknown) {
    return { success: false, error: e instanceof Error ? e.message : String(e), timestamp: Date.now() };
  }
}

interface IInviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InviteMemberModal = ({ isOpen, onClose, onSuccess }: IInviteMemberModalProps) => {
  const [state, formAction, isPending] = useActionState(inviteMemberAction, INITIAL_ACTION_STATE);

  const handleResult = useCallback(
    (s: ActionState<IUserInvite>) => {
      if (s.timestamp === 0) return;
      if (s.success) {
        toast.success('Convite enviado com sucesso!');
        onSuccess();
        onClose();
      } else if (s.error) {
        toast.error(s.error);
      }
    },
    [onSuccess, onClose],
  );

  useEffect(() => { handleResult(state); }, [state, handleResult]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Convidar membro">
      <ModalForm action={formAction}>
        <ModalFieldset disabled={isPending}>
          <ModalField>
            <ModalLabel htmlFor="inviteEmail">E-mail</ModalLabel>
            <ModalInput
              id="inviteEmail"
              type="email"
              name="email"
              placeholder="membro@empresa.com"
              required
              autoFocus
            />
          </ModalField>
          <ModalField>
            <ModalLabel htmlFor="inviteRole">Papel</ModalLabel>
            <ModalSelect id="inviteRole" name="role" defaultValue="member">
              <option value="member">Membro</option>
              <option value="owner">Owner</option>
            </ModalSelect>
          </ModalField>
          {state.error && state.timestamp > 0 && <ModalError>{state.error}</ModalError>}
          <ModalSubmit type="submit" disabled={isPending}>
            {isPending ? 'Enviando...' : 'Enviar convite'}
          </ModalSubmit>
        </ModalFieldset>
      </ModalForm>
    </Modal>
  );
};
