import { DatalabAPI } from "../../services/datalab-api";
import { createFormAction } from "../../utils/create-form-action";
import { forgotPasswordSchema } from "./schemas";

export const forgotPasswordAction = createFormAction(
  forgotPasswordSchema,
  async ({ email }) => {
    await DatalabAPI.UsersResource.forgotPassword({ user_email: email });
  },
  {
    invalidMessage: 'E-mail inválido.',
    errorPrefix: 'Falha ao enviar o link de recuperação: ',
  },
);
