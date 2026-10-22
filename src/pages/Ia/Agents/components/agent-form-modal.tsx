import { useActionState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { Collapsible } from '../../../../components/UI/Collapsible';
import { Modal } from '../../../../components/UI/Modal/modal';
import { ModelSelect } from '../../../../components/UI/ModelSelect';
import { INITIAL_ACTION_STATE } from '../../../../types/actions';
import { useActionFeedback } from '../../../../hooks/use-action-feedback';
import { agentsQuery } from '../../../../queries';
import type { IRetrieveAgentWithState } from '../../../../services/datalab-api/agentsResource';
import { createSaveAgentAction } from '../actions';
import {
  ModalError,
  ModalField,
  ModalFieldset,
  ModalForm,
  ModalInput,
  ModalLabel,
  ModalSubmit,
  ModalTextarea,
} from '../../ia.style';

interface IAgentFormModalProps {
  isOpen: boolean;
  agent: IRetrieveAgentWithState | null;
  onClose: () => void;
}

export const AgentFormModal = ({ isOpen, agent, onClose }: IAgentFormModalProps) => {
  const isEditing = agent !== null;
  const queryClient = useQueryClient();
  const boundAction = useMemo(() => createSaveAgentAction(agent?.id ?? null), [agent]);
  const [formState, formAction, isPending] = useActionState(boundAction, INITIAL_ACTION_STATE);

  useActionFeedback(formState, {
    onSuccess: () => {
      toast.success(isEditing ? 'Agente atualizado.' : 'Agente criado.');
      void queryClient.invalidateQueries({ queryKey: agentsQuery.queryKey });
      onClose();
    },
    // Erro já aparece inline no formulário — sem toast duplicado
    onError: () => {},
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Editar agente: ${agent.name}` : 'Criar agente'}
    >
      <ModalForm key={agent?.id ?? 'new'} action={formAction}>
        <ModalFieldset disabled={isPending}>
          <ModalField>
            <ModalLabel htmlFor="agent-name">Nome *</ModalLabel>
            <ModalInput
              id="agent-name"
              name="name"
              type="text"
              autoComplete="off"
              placeholder="Ex: Especialista em Google Analytics"
              defaultValue={agent?.name ?? ''}
              required
              autoFocus
            />
          </ModalField>

          <ModalField>
            <ModalLabel htmlFor="agent-description">Descrição</ModalLabel>
            <ModalInput
              id="agent-description"
              name="description"
              type="text"
              autoComplete="off"
              placeholder="Resumo do que esse agente faz"
              defaultValue={agent?.description ?? ''}
            />
          </ModalField>

          <ModalField>
            <ModalLabel htmlFor="agent-instructions">
              {isEditing ? 'Instruções' : 'Instruções *'}
            </ModalLabel>
            <ModalTextarea
              id="agent-instructions"
              name="instructions"
              placeholder={isEditing
                ? 'Deixe em branco para manter as instruções atuais'
                : 'Instruções que orientam o comportamento do agente'}
              rows={5}
              required={!isEditing}
            />
          </ModalField>

          <Collapsible
            label="Configurações avançadas"
            defaultOpen={Boolean(agent?.avatar_url || agent?.model_name)}
          >
            <ModalField>
              <ModalLabel htmlFor="agent-avatar-url">URL do avatar</ModalLabel>
              <ModalInput
                id="agent-avatar-url"
                name="avatar_url"
                type="url"
                autoComplete="off"
                placeholder="https://..."
                defaultValue={agent?.avatar_url ?? ''}
              />
            </ModalField>

            <ModalField>
              <ModalLabel id="agent-model-label">Modelo</ModalLabel>
              <ModelSelect
                name="model_name"
                defaultValue={agent?.model_name ?? ''}
                emptyOptionLabel="Padrão do sistema"
                labelId="agent-model-label"
              />
            </ModalField>
          </Collapsible>

          {formState.error && !formState.success && (
            <ModalError>{formState.error}</ModalError>
          )}

          <ModalSubmit type="submit">
            {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar agente'}
          </ModalSubmit>
        </ModalFieldset>
      </ModalForm>
    </Modal>
  );
};
