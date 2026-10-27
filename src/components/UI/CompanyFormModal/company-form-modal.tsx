import modal from '../../../styles/modal-form.module.css';
import { useActionState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../Modal/modal';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import { currentMembershipQuery, meQuery } from '../../../queries';
import type { IUserCompany } from '../../../services/datalab-api/usersResource';
import { createCompanyAction, createUpdateCompanyAction } from './actions';

interface ICompanyFormModalProps {
  isOpen: boolean;
  // null creates a company; a company edits the active one's name
  company: IUserCompany | null;
  onClose: () => void;
}

export const CompanyFormModal = ({ isOpen, company, onClose }: ICompanyFormModalProps) => {
  const isEditing = company !== null;
  const queryClient = useQueryClient();
  const boundAction = useMemo(
    () => (company ? createUpdateCompanyAction(company.id) : createCompanyAction),
    [company],
  );
  const [formState, formAction, isPending] = useActionState(boundAction, INITIAL_ACTION_STATE);

  useActionFeedback(formState, {
    onSuccess: () => {
      toast.success(isEditing ? 'Empresa atualizada.' : 'Empresa criada.');
      void queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
      // The name also lives in currentMembership.company
      if (company) void queryClient.invalidateQueries({ queryKey: currentMembershipQuery(company.id).queryKey });
      onClose();
    },
    onError: () => {},
  });

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `Editar empresa: ${company.name}` : 'Criar empresa'}
    >
      <form className={modal.form} key={company?.id ?? 'new'} action={formAction}>
        <fieldset className={modal.fieldset} disabled={isPending}>
          <div className={modal.field}>
            <label className={modal.label} htmlFor="company-name">Nome *</label>
            <input className={modal.input}
              id="company-name"
              name="name"
              type="text"
              autoComplete="off"
              placeholder="Ex: Minha Empresa"
              defaultValue={company?.name ?? ''}
              required
              autoFocus
            />
          </div>

          {formState.error && !formState.success && (
            <p className={modal.error}>{formState.error}</p>
          )}

          <button className={modal.submit} type="submit">
            {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar empresa'}
          </button>
        </fieldset>
      </form>
    </Modal>
  );
};
