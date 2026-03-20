import { DatalabAPI } from "../../services/datalab-api";
import type { ActionState } from "../../types/actions";
import { forgotPasswordSchema } from "./schemas";

export const forgotPasswordAction = async (
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const result = forgotPasswordSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || 'E-mail inválido.',
      timestamp: Date.now(),
    };
  }

  const { email } = result.data;

  try {
    await DatalabAPI.UsersResource.forgotPassword({ user_email: email });
    return { success: true, timestamp: Date.now() };
  } catch (error: Error | unknown) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Falha ao enviar o link de recuperação: ${error.message}`,
        timestamp: Date.now(),
      };
    }
    return {
      success: false,
      error: `Falha ao enviar o link de recuperação: ${String(error)}`,
      timestamp: Date.now(),
    };
  }
};
