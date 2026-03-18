import { DatalabAPI } from '../../services/datalab-api';
import type { IUserConfig, IUserResponse } from '../../services/datalab-api/usersResource';
import type { ActionState } from '../../types/actions';

export const updateProfileAction = async (
  _prevState: ActionState<IUserResponse>,
  formData: FormData,
): Promise<ActionState<IUserResponse>> => {
  const name = (formData.get('name') as string | null)?.trim() ?? '';
  const phoneNumber = (formData.get('phone_number') as string | null)?.trim() ?? '';
  const avatarUrl = (formData.get('avatar_url') as string | null)?.trim() ?? '';
  const theme = ((formData.get('theme') as string | null) ?? 'light') as IUserConfig['theme'];

  if (!phoneNumber || !/^\+\d+$/.test(phoneNumber)) {
    console.log("Phone number", phoneNumber);
    return {
      success: false,
      error: 'Telefone é obrigatório e deve estar no formato +<codigo><numero>.',
      timestamp: Date.now(),
    };
  }

  try {
    const updatedUser = await DatalabAPI.UsersResource.updateMe({
      name,
      phone_number: phoneNumber,
      avatar_url: avatarUrl || null,
      config: {
        theme,
      },
    });

    return {
      success: true,
      data: updatedUser,
      timestamp: Date.now(),
    };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);

    return {
      success: false,
      error: `Erro ao atualizar perfil: ${message}`,
      timestamp: Date.now(),
    };
  }
};
