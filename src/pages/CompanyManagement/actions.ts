import { z } from 'zod';
import { DatalabAPI } from '../../services/datalab-api';
import { createFormAction } from '../../utils/create-form-action';
import type { UUID } from '../../types/ids';

// Deleção não tem campos — a confirmação (digitar o nome) é feita na UI.
// Criar/editar vivem no CompanyFormModal compartilhado (components/UI).
export const createDeleteCompanyAction = (companyId: UUID) =>
  createFormAction(
    z.object({}),
    () => DatalabAPI.CompaniesResource.deleteCompany(companyId),
    { errorPrefix: 'Falha ao deletar empresa: ' },
  );
