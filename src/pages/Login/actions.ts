import { DatalabAPI } from "../../services/datalab-api";
import type {
  ILoginUserResponse,
} from "../../services/datalab-api/authResource";
import type { ActionState } from "../../types/actions";

export const loginAction = async (
  _prevState: ActionState<ILoginUserResponse>,
  formData: FormData,
): Promise<ActionState<ILoginUserResponse>> => {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const response = await DatalabAPI.AuthResource.login({ email, password });
    return { success: true, data: response, timestamp: Date.now() };
  } catch (error: Error | unknown) {
    if (error instanceof Error) {
      return {
        success: false,
        error: `Falha no login: ${error.message}`,
        timestamp: Date.now(),
      };
    }
    return {
      success: false,
      error: `Falha no login: ${String(error)}`,
      timestamp: Date.now(),
    };
  }
};
