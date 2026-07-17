import { useActionState } from 'react';
import { toast } from 'react-toastify';
import { DatalabAPI } from '../services/datalab-api';
import { INITIAL_ACTION_STATE, type ActionState } from '../types/actions';
import { useActionFeedback } from './use-action-feedback';

export async function acceptInviteAction(
  _prevState: ActionState<never>,
  formData: FormData,
): Promise<ActionState<never>> {
  const inviteId = Number(formData.get('inviteId'));

  try {
    await DatalabAPI.UsersResource.acceptInvite(inviteId);
    return { success: true, timestamp: Date.now() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message, timestamp: Date.now() };
  }
}

export async function declineInviteAction(
  _prevState: ActionState<never>,
  formData: FormData,
): Promise<ActionState<never>> {
  const inviteId = Number(formData.get('inviteId'));

  try {
    await DatalabAPI.UsersResource.declineInvite(inviteId);
    return { success: true, timestamp: Date.now() };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return { success: false, error: message, timestamp: Date.now() };
  }
}

/**
 * Par de form actions de aceitar/recusar convite com feedback e refresh,
 * compartilhado entre o menu de convites do header e o onboarding.
 */
export function useInviteActions(onRefresh: () => Promise<unknown>) {
  const [acceptState, acceptFormAction, isAccepting] = useActionState(acceptInviteAction, INITIAL_ACTION_STATE);
  const [declineState, declineFormAction, isDeclining] = useActionState(declineInviteAction, INITIAL_ACTION_STATE);

  useActionFeedback(acceptState, {
    successMessage: 'Convite aceito!',
    onSuccess: () => void onRefresh(),
  });

  useActionFeedback(declineState, {
    onSuccess: () => {
      toast.info('Convite recusado.');
      void onRefresh();
    },
  });

  return { acceptFormAction, declineFormAction, isAccepting, isDeclining };
}
