import { DatalabAPI } from "../../services/datalab-api";
import { type ActionState } from "../../types/actions";
import { type IUserResponse } from "../../services/datalab-api/usersResource";
import { registerSchema, confirmAccountSchema } from "./schemas";

export async function registerUserAction(
  _prevState: ActionState<IUserResponse>,
  formData: FormData,
): Promise<ActionState<IUserResponse>> {
  const result = registerSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || 'Parâmetros de cadastro inválidos.',
      timestamp: Date.now(),
    };
  }

  const { name, email, phone_number, password } = result.data;

  try {
    const response: IUserResponse = await DatalabAPI.UsersResource.create({
      name,
      email,
      phone_number: phone_number || '', // Manda vazio ou a formatada
      password,
    });

    return {
      success: true,
      data: response,
      timestamp: Date.now(),
    };
  } catch (error: Error | unknown) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Erro ao realizar cadastro: ${error.message}`,
        timestamp: Date.now(),
      };
    }
    return {
      success: false,
      error: `Erro ao realizar cadastro: ${String(error)}`,
      timestamp: Date.now(),
    };
  }
}

export async function confirmUserAction(
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const result = confirmAccountSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || 'Código de confirmação inválido.',
      timestamp: Date.now(),
    };
  }

  const { code, userId } = result.data;

  try {
    await DatalabAPI.UsersResource.confirmAccount(userId, { code });
    return {
      success: true,
      timestamp: Date.now(),
    };
  } catch (error: Error | unknown) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Código inválido ou erro na confirmação: ${error.message}`,
        timestamp: Date.now(),
      };
    }
    return {
      success: false,
      error: `Código inválido ou erro na confirmação: ${String(error)}`,
      timestamp: Date.now(),
    };
  }
}
