import modal from '../../../../styles/modal-form.module.css';
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
    // The error shows inline in the form
    onError: () => {},
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Editar agente: ${agent.name}` : 'Criar agente'}
    >
      <form className={modal.form} key={agent?.id ?? 'new'} action={formAction}>
        <fieldset className={modal.fieldset} disabled={isPending}>
          <div className={modal.field}>
            <label className={modal.label} htmlFor="agent-name">Nome *</label>
            <input className={modal.input}
              id="agent-name"
              name="name"
              type="text"
              autoComplete="off"
              placeholder="Ex: Especialista em Google Analytics"
              defaultValue={agent?.name ?? ''}
              required
              autoFocus
            />
          </div>

          <div className={modal.field}>
            <label className={modal.label} htmlFor="agent-description">Descrição</label>
            <input className={modal.input}
              id="agent-description"
              name="description"
              type="text"
              autoComplete="off"
              placeholder="Resumo do que esse agente faz"
              defaultValue={agent?.description ?? ''}
            />
          </div>

          <div className={modal.field}>
            <label className={modal.label} htmlFor="agent-instructions">
              {isEditing ? 'Instruções' : 'Instruções *'}
            </label>
            <textarea className={modal.textarea}
              id="agent-instructions"
              name="instructions"
              placeholder={isEditing
                ? 'Deixe em branco para manter as instruções atuais'
                : 'Instruções que orientam o comportamento do agente'}
              rows={5}
              required={!isEditing}
            />
          </div>

          <Collapsible
            label="Configurações avançadas"
            defaultOpen={Boolean(agent?.avatar_url || agent?.model_name)}
          >
            <div className={modal.field}>
              <label className={modal.label} htmlFor="agent-avatar-url">URL do avatar</label>
              <input className={modal.input}
                id="agent-avatar-url"
                name="avatar_url"
                type="url"
                autoComplete="off"
                placeholder="https://..."
                defaultValue={agent?.avatar_url ?? ''}
              />
            </div>

            <div className={modal.field}>
              <label className={modal.label} id="agent-model-label">Modelo</label>
              <ModelSelect
                name="model_name"
                defaultValue={agent?.model_name ?? ''}
                emptyOptionLabel="Padrão do sistema"
                labelId="agent-model-label"
              />
            </div>
          </Collapsible>

          {formState.error && !formState.success && (
            <p className={modal.error}>{formState.error}</p>
          )}

          <button className={modal.submit} type="submit">
            {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar agente'}
          </button>
        </fieldset>
      </form>
    </Modal>
  );
};
