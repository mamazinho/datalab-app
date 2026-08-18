import { DatalabAPI } from '../../../services/datalab-api';
import { createFormAction } from '../../../utils/create-form-action';
import type { UUID } from '../../../types/ids';
import { companyNameSchema } from './schemas';

// Retornam void para que criar e editar compartilhem o mesmo ActionState<void>
// (o modal só invalida ['me'] no sucesso, não usa o payload de resposta).
export const createCompanyAction = createFormAction(
  companyNameSchema,
  async ({ name }) => {
    await DatalabAPI.CompaniesResource.createCompany({ name });
  },
  { errorPrefix: 'Falha ao criar empresa: ' },
);

// Factory: a action de edição nasce já sabendo o id da empresa alvo (a ativa).
export const createUpdateCompanyAction = (companyId: UUID) =>
  createFormAction(
    companyNameSchema,
    async ({ name }) => {
      await DatalabAPI.CompaniesResource.updateCompany(companyId, { name });
    },
    { errorPrefix: 'Falha ao atualizar empresa: ' },
  );
