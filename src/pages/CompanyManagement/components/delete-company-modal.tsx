import modal from '../../../styles/modal-form.module.css';
import { useActionState, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../components/UI/Modal/modal';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import { currentMembershipQuery, meQuery } from '../../../queries';
import type { IUserCompany } from '../../../services/datalab-api/usersResource';
import { createDeleteCompanyAction } from '../actions';

interface IDeleteCompanyModalProps {
  isOpen: boolean;
  company: IUserCompany | null;
  onClose: () => void;
  onDeleted: () => void;
}

export const DeleteCompanyModal = ({ isOpen, company, onClose, onDeleted }: IDeleteCompanyModalProps) => {
  const queryClient = useQueryClient();
  const boundAction = useMemo(
    () => createDeleteCompanyAction(company?.id ?? ('' as never)),
    [company],
  );
  const [formState, formAction, isPending] = useActionState(boundAction, INITIAL_ACTION_STATE);
  const [confirmText, setConfirmText] = useState('');

  useActionFeedback(formState, {
    onSuccess: () => {
      toast.success('Empresa deletada.');
      onDeleted();
      void queryClient.invalidateQueries({ queryKey: meQuery.queryKey });
      if (company) void queryClient.invalidateQueries({ queryKey: currentMembershipQuery(company.id).queryKey });
      onClose();
    },
    onError: () => {},
  });

  if (!company) return null;

  const canDelete = confirmText.trim() === company.name;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Deletar empresa: ${company.name}`}>
      <form className={modal.form} key={company.id} action={formAction}>
        <fieldset className={modal.fieldset} disabled={isPending}>
          <p className={modal.hint}>
            Esta ação é irreversível. Para confirmar, digite <strong>{company.name}</strong> abaixo.
          </p>

          <div className={modal.field}>
            <label className={modal.label} htmlFor="confirm-company-name">Nome da empresa</label>
            <input className={modal.input}
              id="confirm-company-name"
              type="text"
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={company.name}
              autoFocus
            />
          </div>

          {formState.error && !formState.success && (
            <p className={modal.error}>{formState.error}</p>
          )}

          <button className={modal.deleteSubmit} type="submit" disabled={!canDelete || isPending}>
            {isPending ? 'Deletando...' : 'Deletar empresa'}
          </button>
        </fieldset>
      </form>
    </Modal>
  );
};
