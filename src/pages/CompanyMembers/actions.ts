import { DatalabAPI } from '../../services/datalab-api';
import { createFormAction } from '../../utils/create-form-action';
import { inviteMembersSchema, updateMemberPermissionsSchema } from './schemas';

const selectedPermissions = (formData: FormData) => ({
  route_permissions: formData.getAll('route_permissions'),
  provider_permissions: formData.getAll('provider_permissions'),
});

// data is the number of invites sent, for the singular or plural toast
export const inviteMembersAction = createFormAction(
  inviteMembersSchema,
  async (payload) => {
    await DatalabAPI.MembershipsResource.upsertInvite(payload);
    return payload.emails.length;
  },
  {
    // Joins the tokenized e-mails with the draft that was not tokenized yet
    mapFormData: (formData) => {
      const emails = String(formData.get('emails') ?? '')
        .split(',')
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean);

      const emailDraft = String(formData.get('emailDraft') ?? '').trim().toLowerCase();
      if (emailDraft && !emails.includes(emailDraft)) {
        emails.push(emailDraft);
      }

      return { emails, ...selectedPermissions(formData) };
    },
  },
);

export const updateMemberPermissionsAction = createFormAction(
  updateMemberPermissionsSchema,
  ({ membershipId, ...selection }) =>
    DatalabAPI.MembershipsResource.updateMemberPermissions(membershipId, selection),
  {
    errorPrefix: 'Erro ao salvar permissões: ',
    mapFormData: (formData) => ({ membershipId: formData.get('membershipId'), ...selectedPermissions(formData) }),
  },
);
