import { DatalabAPI } from "../../services/datalab-api";
import { createFormAction } from "../../utils/create-form-action";
import { createCompanySchema } from "./schemas";

export const createCompanyAction = createFormAction(
  createCompanySchema,
  (payload) => DatalabAPI.CompaniesResource.createCompany(payload),
  { errorPrefix: 'Falha ao criar empresa: ' },
);
