import { useActionState, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { Modal } from '../Modal/modal';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import { currentMembershipQuery, meQuery } from '../../../queries';
import type { IUserCompany } from '../../../services/datalab-api/usersResource';
import { createCompanyAction, createUpdateCompanyAction } from './actions';
import {
  ModalError,
  ModalField,
  ModalFieldset,
  ModalForm,
  ModalInput,
  ModalLabel,
  ModalSubmit,
} from './company-form-modal.style';

interface ICompanyFormModalProps {
  isOpen: boolean;
  /** null = criar (qualquer usuário); definido = editar o nome (empresa ativa). */
  company: IUserCompany | null;
  onClose: () => void;
}

// Reutilizado pelo dropdown (criar, todos) e pela página de empresa (editar a ativa).
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
      // O nome também vive em currentMembership.company (a edição é sempre na ativa).
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
      <ModalForm key={company?.id ?? 'new'} action={formAction}>
        <ModalFieldset disabled={isPending}>
          <ModalField>
            <ModalLabel htmlFor="company-name">Nome *</ModalLabel>
            <ModalInput
              id="company-name"
              name="name"
              type="text"
              autoComplete="off"
              placeholder="Ex: Minha Empresa"
              defaultValue={company?.name ?? ''}
              required
              autoFocus
            />
          </ModalField>

          {formState.error && !formState.success && (
            <ModalError>{formState.error}</ModalError>
          )}

          <ModalSubmit type="submit">
            {isPending ? 'Salvando...' : isEditing ? 'Salvar alterações' : 'Criar empresa'}
          </ModalSubmit>
        </ModalFieldset>
      </ModalForm>
    </Modal>
  );
};
