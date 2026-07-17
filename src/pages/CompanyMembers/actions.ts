import { DatalabAPI } from '../../services/datalab-api';
import type { ActionState } from '../../types/actions';
import { inviteMembersSchema } from './schemas';

// data = quantidade de convites enviados (para o toast singular/plural)
export async function inviteMembersAction(
  _prevState: ActionState<number>,
  formData: FormData,
): Promise<ActionState<number>> {
  const submittedEmails = String(formData.get('emails') ?? '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);

  // E-mail digitado mas ainda não tokenizado também conta (comportamento atual do modal)
  const emailDraft = String(formData.get('emailDraft') ?? '').trim().toLowerCase();
  if (emailDraft && !submittedEmails.includes(emailDraft)) {
    submittedEmails.push(emailDraft);
  }

  const parsed = inviteMembersSchema.safeParse({
    emails: submittedEmails,
    permissions: formData.getAll('permissions'),
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
      timestamp: Date.now(),
    };
  }

  try {
    await DatalabAPI.MembershipsResource.upsertInvite(parsed.data);
    return {
      success: true,
      data: parsed.data.emails.length,
      timestamp: Date.now(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      error: message,
      timestamp: Date.now(),
    };
  }
}
