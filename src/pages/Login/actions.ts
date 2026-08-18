import { DatalabAPI } from "../../services/datalab-api";
import { createFormAction } from "../../utils/create-form-action";
import { loginSchema } from "./schemas";

export const loginAction = createFormAction(
  loginSchema,
  (credentials) => DatalabAPI.AuthResource.login(credentials),
  {
    invalidMessage: 'Parâmetros de login inválidos.',
    errorPrefix: 'Falha no login: ',
  },
);
