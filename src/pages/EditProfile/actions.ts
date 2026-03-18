import { DatalabAPI } from '../../services/datalab-api';
import type { IUserResponse } from '../../services/datalab-api/usersResource';
import type { ActionState } from '../../types/actions';
import { editProfileFormSchema } from './schemas';

export const updateProfileAction = async (
  _prevState: ActionState<IUserResponse>,
  formData: FormData,
): Promise<ActionState<IUserResponse>> => {
  const parsedData = editProfileFormSchema.safeParse({
    name: formData.get('name') ?? undefined,
    phone_number: formData.get('phone_number') ?? undefined,
    avatar_url: formData.get('avatar_url') ?? undefined,
    theme: formData.get('theme') ?? undefined,
    password: formData.get('password') ?? undefined,
    confirmPassword: formData.get('confirmPassword') ?? undefined,
  });

  if (!parsedData.success) {
    const firstError = parsedData.error.issues[0]?.message || 'Dados invalidos no formulario.';
    return {
      success: false,
      error: firstError,
      timestamp: Date.now(),
    };
  }

  const {
    name,
    phone_number: phoneNumber,
    avatar_url: avatarUrl,
    password,
    theme,
  } = parsedData.data;

  try {
    const updatePayload = {
      name,
      phone_number: phoneNumber,
      avatar_url: avatarUrl || null,
      config: theme ? { theme } : null,
      ...(password ? { password } : {}),
    };

    const updatedUser = await DatalabAPI.UsersResource.updateMe(updatePayload);

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
