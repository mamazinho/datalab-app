import { DatalabAPI } from "../../services/datalab-api";
import { createFormAction } from "../../utils/create-form-action";
import { registerSchema, confirmAccountSchema } from "./schemas";

export const registerUserAction = createFormAction(
  registerSchema,
  ({ name, email, phone_number, password }) =>
    DatalabAPI.UsersResource.create({
      name,
      email,
      phone_number: phone_number || '',
      password,
    }),
  {
    invalidMessage: 'Parâmetros de cadastro inválidos.',
    errorPrefix: 'Erro ao realizar cadastro: ',
  },
);

export const confirmUserAction = createFormAction(
  confirmAccountSchema,
  async ({ userId, code }) => {
    await DatalabAPI.UsersResource.confirmAccount(userId, { code });
  },
  {
    invalidMessage: 'Código de confirmação inválido.',
    errorPrefix: 'Código inválido ou erro na confirmação: ',
  },
);
