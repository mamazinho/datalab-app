import { DatalabAPI } from '../../../services/datalab-api';
import type { IRetrieveAgent, IUpdateSpecialistRequest } from '../../../services/datalab-api/agentsResource';
import type { ActionState } from '../../../types/actions';
import { createAgentSchema, updateAgentSchema } from './schemas';

export async function saveAgentAction(
  agentId: number | null,
  _prevState: ActionState<IRetrieveAgent>,
  formData: FormData,
): Promise<ActionState<IRetrieveAgent>> {
  const isEditing = agentId !== null;
  const schema = isEditing ? updateAgentSchema : createAgentSchema;

  const parsed = schema.safeParse({
    name: formData.get('name') ?? '',
    avatar_url: formData.get('avatar_url') ?? '',
    description: formData.get('description') ?? '',
    instructions: formData.get('instructions') ?? '',
    model_name: formData.get('model_name') ?? '',
  });

  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message ?? 'Dados inválidos.',
      timestamp: Date.now(),
    };
  }

  const { name, avatar_url, description, instructions, model_name } = parsed.data;
  const payload: IUpdateSpecialistRequest = {
    name,
    ...(instructions ? { instructions } : {}),
    ...(avatar_url ? { avatar_url } : {}),
    ...(description ? { description } : {}),
    ...(model_name ? { model_name } : {}),
  };

  try {
    const data = isEditing
      ? await DatalabAPI.AgentsResource.updateSpecialist(agentId, payload)
      : await DatalabAPI.AgentsResource.createSpecialist({ ...payload, name, instructions });

    return {
      success: true,
      data,
      timestamp: Date.now(),
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: error instanceof Error
        ? `Falha ao salvar o agente: ${error.message}`
        : 'Falha ao salvar o agente.',
      timestamp: Date.now(),
    };
  }
}
