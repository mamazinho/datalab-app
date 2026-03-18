import { DatalabAPI } from "../../services/datalab-api";
import { type ActionState } from "../../types/actions";
import { type IUserResponse } from "../../services/datalab-api/usersResource";

export async function registerUserAction(
  _prevState: ActionState<IUserResponse>,
  formData: FormData,
): Promise<ActionState<IUserResponse>> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const phoneNumber = (formData.get("phone_number") as string | null)?.trim() ?? '';
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!phoneNumber || !/^\+\d+$/.test(phoneNumber)) {
    return {
      success: false,
      error: "Telefone é obrigatório e deve estar no formato +<codigo><numero>.",
      timestamp: Date.now(),
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: "As senhas não coincidem.",
      timestamp: Date.now(),
    };
  }

  try {
    const response: IUserResponse = await DatalabAPI.UsersResource.create({
      name,
      email,
      phone_number: phoneNumber,
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
  const code = formData.get("code") as string;
  const userIdData = formData.get("userId");

  if (!userIdData) {
    return {
      success: false,
      error: "Usuário não identificado.",
      timestamp: Date.now(),
    };
  }
  const userId = parseInt(userIdData as string);

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
