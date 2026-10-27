import { z } from 'zod';
import { DatalabAPI } from '../../services/datalab-api';
import { createFormAction } from '../../utils/create-form-action';
import type { UUID7 } from '../../types/ids';

export const createDeleteCompanyAction = (companyId: UUID7) =>
  createFormAction(
    z.object({}),
    () => DatalabAPI.CompaniesResource.deleteCompany(companyId),
    { errorPrefix: 'Falha ao deletar empresa: ' },
  );
