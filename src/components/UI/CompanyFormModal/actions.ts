import { DatalabAPI } from '../../../services/datalab-api';
import { createFormAction } from '../../../utils/create-form-action';
import type { UUID7 } from '../../../types/ids';
import { companyNameSchema } from './schemas';

// Both return void so create and edit share the same ActionState<void>
export const createCompanyAction = createFormAction(
  companyNameSchema,
  async ({ name }) => {
    await DatalabAPI.CompaniesResource.createCompany({ name });
  },
  { errorPrefix: 'Falha ao criar empresa: ' },
);

export const createUpdateCompanyAction = (companyId: UUID7) =>
  createFormAction(
    companyNameSchema,
    async ({ name }) => {
      await DatalabAPI.CompaniesResource.updateCompany(companyId, { name });
    },
    { errorPrefix: 'Falha ao atualizar empresa: ' },
  );
