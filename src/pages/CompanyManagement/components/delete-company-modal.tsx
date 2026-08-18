import { useActionState, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../../../components/UI/Modal/modal';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import { currentMembershipQuery, meQuery } from '../../../queries';
import type { IUserCompany } from '../../../services/datalab-api/usersResource';
import { createDeleteCompanyAction } from '../actions';
import {
  ModalDeleteSubmit,
  ModalError,
  ModalField,
  ModalFieldset,
  ModalForm,
  ModalHint,
  ModalInput,
  ModalLabel,
} from '../company-management.style';

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
      <ModalForm key={company.id} action={formAction}>
        <ModalFieldset disabled={isPending}>
          <ModalHint>
            Esta ação é irreversível. Para confirmar, digite <strong>{company.name}</strong> abaixo.
          </ModalHint>

          <ModalField>
            <ModalLabel htmlFor="confirm-company-name">Nome da empresa</ModalLabel>
            <ModalInput
              id="confirm-company-name"
              type="text"
              autoComplete="off"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder={company.name}
              autoFocus
            />
          </ModalField>

          {formState.error && !formState.success && (
            <ModalError>{formState.error}</ModalError>
          )}

          <ModalDeleteSubmit type="submit" disabled={!canDelete || isPending}>
            {isPending ? 'Deletando...' : 'Deletar empresa'}
          </ModalDeleteSubmit>
        </ModalFieldset>
      </ModalForm>
    </Modal>
  );
};
