import { DatalabAPI } from '../../../services/datalab-api';
import type { IUpdateSpecialistRequest } from '../../../services/datalab-api/agentsResource';
import { createFormAction } from '../../../utils/create-form-action';
import { createAgentSchema, updateAgentSchema } from './schemas';
import type { UUID } from '../../../types/ids';

// Factory: a action nasce já sabendo se é criação (agentId null) ou edição
export const createSaveAgentAction = (agentId: UUID | null) =>
  createFormAction(
    agentId !== null ? updateAgentSchema : createAgentSchema,
    ({ name, avatar_url, description, instructions, model_name }) => {
      const payload: IUpdateSpecialistRequest = {
        name,
        ...(instructions ? { instructions } : {}),
        ...(avatar_url ? { avatar_url } : {}),
        ...(description ? { description } : {}),
        ...(model_name ? { model_name } : {}),
      };

      return agentId !== null
        ? DatalabAPI.AgentsResource.updateSpecialist(agentId, payload)
        : DatalabAPI.AgentsResource.createSpecialist({ ...payload, name, instructions });
    },
    { errorPrefix: 'Falha ao salvar o agente: ' },
  );
