import { useActionState, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '../../../components/UI/Modal/modal';
import { AsyncResource } from '../../../components/Tools/async-resource';
import { DatalabAPI } from '../../../services/datalab-api';
import type { IRoutePermission } from '../../../services/datalab-api/usersResource';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import { inviteMembersAction } from '../actions';
import {
  EmailTag,
  EmailTagInput,
  EmailTagList,
  EmailTagRemove,
  ModalError,
  ModalField,
  ModalFieldset,
  ModalForm,
  ModalLabel,
  ModalSubmit,
} from '../company-members.style';
import { PermissionsSelector } from './permissions-list';

interface IInviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

// Sem acesso à listagem de permissões, o convite ainda pode ser enviado — degrada para lista vazia
const fetchRoutePermissions = async (): Promise<IRoutePermission[]> => {
  try {
    return await DatalabAPI.MembershipsResource.listRoutePermissions();
  } catch {
    return [];
  }
};

export const InviteMemberModal = ({ isOpen, onClose, onSuccess }: IInviteMemberModalProps) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [tagError, setTagError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const [inviteState, inviteFormAction, isPending] = useActionState(inviteMembersAction, INITIAL_ACTION_STATE);

  useActionFeedback(inviteState, {
    onSuccess: (sentCount) => {
      toast.success(
        sentCount === 1
          ? 'Convite enviado com sucesso!'
          : `${sentCount} convites enviados com sucesso!`,
      );
      onSuccess();
      onClose();
    },
    // Erro já aparece inline no formulário — sem toast duplicado
    onError: () => {},
  });

  useEffect(() => {
    if (!isOpen) {
      setEmails([]);
      setInputValue('');
      setSelectedPermissions(new Set());
      setTagError(null);
    }
  }, [isOpen]);

  const addEmail = useCallback((raw: string) => {
    const email = raw.trim().toLowerCase();
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setTagError(`"${email}" não é um e-mail válido.`);
      return;
    }
    setEmails((prev) => prev.includes(email) ? prev : [...prev, email]);
    setInputValue('');
    setTagError(null);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === ' ' || e.key === 'Enter' || e.key === ',') {
        e.preventDefault();
        addEmail(inputValue);
      } else if (e.key === 'Backspace' && !inputValue && emails.length > 0) {
        setEmails((prev) => prev.slice(0, -1));
      }
    },
    [addEmail, inputValue, emails],
  );

  const handleBlur = useCallback(() => {
    if (inputValue.trim()) addEmail(inputValue);
  }, [addEmail, inputValue]);

  const removeEmail = useCallback((email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  }, []);

  const formError = tagError ?? (!inviteState.success ? inviteState.error : null);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Convidar membros">
      <ModalForm action={inviteFormAction}>
        <input type="hidden" name="emails" value={emails.join(',')} />
        {Array.from(selectedPermissions).map((permissionId) => (
          <input key={permissionId} type="hidden" name="permissions" value={permissionId} />
        ))}

        <ModalFieldset disabled={isPending}>
          <ModalField>
            <ModalLabel>E-mails</ModalLabel>
            <EmailTagList onClick={() => inputRef.current?.focus()}>
              {emails.map((email) => (
                <EmailTag key={email}>
                  {email}
                  <EmailTagRemove
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeEmail(email); }}
                    aria-label={`Remover ${email}`}
                  >
                    ×
                  </EmailTagRemove>
                </EmailTag>
              ))}
              <EmailTagInput
                ref={inputRef}
                name="emailDraft"
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); setTagError(null); }}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={emails.length === 0 ? 'membro@empresa.com (espaço para adicionar)' : ''}
                autoFocus
              />
            </EmailTagList>
          </ModalField>

          <AsyncResource fetcher={fetchRoutePermissions}>
            {(routePermissions) => routePermissions.length > 0 && (
              <ModalField>
                <ModalLabel>Permissões</ModalLabel>
                <PermissionsSelector
                  permissions={routePermissions}
                  selected={selectedPermissions}
                  onChange={setSelectedPermissions}
                />
              </ModalField>
            )}
          </AsyncResource>

          {formError && <ModalError>{formError}</ModalError>}

          <ModalSubmit type="submit" disabled={isPending}>
            {isPending ? 'Enviando...' : 'Enviar convites'}
          </ModalSubmit>
        </ModalFieldset>
      </ModalForm>
    </Modal>
  );
};
