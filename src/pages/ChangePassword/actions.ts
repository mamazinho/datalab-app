import { DatalabAPI } from "../../services/datalab-api";
import { createFormAction } from "../../utils/create-form-action";
import { changePasswordSchema } from "./schemas";

export const changePasswordAction = createFormAction(
  changePasswordSchema,
  async ({ email, code, password }) => {
    await DatalabAPI.UsersResource.changePassword({
      user_email: email,
      code,
      new_password: password,
    });
  },
  {
    invalidMessage: 'Parâmetros inválidos.',
    errorMessage: 'Erro ao alterar senha. O link pode ter expirado.',
  },
);
