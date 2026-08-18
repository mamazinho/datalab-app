import { DatalabAPI } from '../../services/datalab-api';
import { createFormAction } from '../../utils/create-form-action';
import { inviteMembersSchema } from './schemas';

// data = quantidade de convites enviados (para o toast singular/plural)
export const inviteMembersAction = createFormAction(
  inviteMembersSchema,
  async (payload) => {
    await DatalabAPI.MembershipsResource.upsertInvite(payload);
    return payload.emails.length;
  },
  {
    // Junta os e-mails tokenizados com o draft ainda não tokenizado (comportamento do modal)
    mapFormData: (formData) => {
      const emails = String(formData.get('emails') ?? '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

      const emailDraft = String(formData.get('emailDraft') ?? '').trim().toLowerCase();
      if (emailDraft && !emails.includes(emailDraft)) {
        emails.push(emailDraft);
      }

      return {
        emails,
        permissions: formData.getAll('permissions'),
        provider_permissions: formData.getAll('provider_permissions'),
      };
    },
  },
);
