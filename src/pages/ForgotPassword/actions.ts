import { DatalabAPI } from "../../services/datalab-api";
import type { ActionState } from "../../types/actions";

export const forgotPasswordAction = async (
  _prevState: ActionState,
  formData: FormData,
): Promise<ActionState> => {
  const email = formData.get("email") as string;
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
