import { DatalabAPI } from '../../services/datalab-api';
import { createFormAction } from '../../utils/create-form-action';
import { editProfileFormSchema } from './schemas';

export const updateProfileAction = createFormAction(
  editProfileFormSchema,
  ({ name, phone_number, avatar_url, theme, password }) =>
    DatalabAPI.UsersResource.updateMe({
      name,
      phone_number,
      avatar_url: avatar_url || null,
      config: theme ? { theme } : null,
      ...(password ? { password } : {}),
    }),
  {
    invalidMessage: 'Dados invalidos no formulario.',
    errorPrefix: 'Erro ao atualizar perfil: ',
  },
);
