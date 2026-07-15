import { useActionState, useEffect, useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '../../../../components/UI/Modal/modal';
import { ModelSelect } from '../../../../components/UI/ModelSelect';
import { INITIAL_ACTION_STATE } from '../../../../types/actions';
import type { IRetrieveAgentWithState } from '../../../../services/datalab-api/agentsResource';
import { saveAgentAction } from '../actions';
import {
  ModalError,
  ModalField,
  ModalFieldset,
  ModalForm,
  ModalInput,
  ModalLabel,
  ModalSubmit,
  ModalTextarea,
} from '../agents.style';

interface IAgentFormModalProps {
  isOpen: boolean;
  agent: IRetrieveAgentWithState | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const AgentFormModal = ({ isOpen, agent, onClose, onSuccess }: IAgentFormModalProps) => {
  const isEditing = agent !== null;
  const boundAction = useMemo(() => saveAgentAction.bind(null, agent?.id ?? null), [agent]);
  const [formState, formAction, isPending] = useActionState(boundAction, INITIAL_ACTION_STATE);
  const [modelName, setModelName] = useState('');
  const lastHandledTimestampRef = useRef(0);

  useEffect(() => {
    if (isOpen) {
      setModelName(agent?.model_name ?? '');
    }
  }, [isOpen, agent]);

  useEffect(() => {
    if (formState.timestamp === 0 || formState.timestamp === lastHandledTimestampRef.current) return;
    lastHandledTimestampRef.current = formState.timestamp;

    if (formState.success && formState.data) {
      toast.success(isEditing ? 'Agente atualizado.' : 'Agente criado.');
      onSuccess();
      onClose();
    }
  }, [formState, isEditing, onClose, onSuccess]);

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
            <ModalLabel>Modelo</ModalLabel>
            <ModelSelect
              value={modelName}
              onChange={setModelName}
              disabled={isPending}
              emptyOptionLabel="Padrão do sistema"
            />
            <input type="hidden" name="model_name" value={modelName} />
          </ModalField>

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
