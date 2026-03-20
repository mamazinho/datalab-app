import { DatalabAPI } from "../../services/datalab-api";
import type {
  ILoginUserResponse,
} from "../../services/datalab-api/authResource";
import type { ActionState } from "../../types/actions";
import { loginSchema } from "./schemas";

export const loginAction = async (
  _prevState: ActionState<ILoginUserResponse>,
  formData: FormData,
): Promise<ActionState<ILoginUserResponse>> => {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return {
      success: false,
      error: result.error.issues[0]?.message || 'Parâmetros de login inválidos.',
      timestamp: Date.now(),
    };
  }

  const { email, password } = result.data;

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
