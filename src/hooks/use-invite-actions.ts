import { useActionState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { DatalabAPI } from '../services/datalab-api';
import { INITIAL_ACTION_STATE } from '../types/actions';
import { uuidSchema } from '../schemas/uuid';
import { createFormAction } from '../utils/create-form-action';
import { useActionFeedback } from './use-action-feedback';
import { meQuery } from '../queries';

export const acceptInviteAction = createFormAction(
  uuidSchema,
  async (inviteId) => {
    await DatalabAPI.UsersResource.acceptInvite(inviteId);
  },
  {
    invalidMessage: 'Convite inválido.',
    mapFormData: (formData) => formData.get('inviteId'),
  },
);

export const declineInviteAction = createFormAction(
  uuidSchema,
  async (inviteId) => {
    await DatalabAPI.UsersResource.declineInvite(inviteId);
  },
  {
    invalidMessage: 'Convite inválido.',
    mapFormData: (formData) => formData.get('inviteId'),
  },
);

/**
 * Par de form actions de aceitar/recusar convite com feedback,
 * compartilhado entre o menu de convites do header e o onboarding.
 * O sucesso invalida ['me'] — todos os consumidores do usuário se atualizam.
 */
export function useInviteActions() {
  const queryClient = useQueryClient();
  const [acceptState, acceptFormAction, isAccepting] = useActionState(acceptInviteAction, INITIAL_ACTION_STATE);
  const [declineState, declineFormAction, isDeclining] = useActionState(declineInviteAction, INITIAL_ACTION_STATE);

  useActionFeedback(acceptState, {
    successMessage: 'Convite aceito!',
    onSuccess: () => void queryClient.invalidateQueries({ queryKey: meQuery.queryKey }),
  });

  useActionFeedback(declineState, {
    onSuccess: () => {
      toast.info('Convite recusado.');
      void queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
    },
  });

  return { acceptFormAction, declineFormAction, isAccepting, isDeclining };
}
