import { useActionState, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { useRoutePermissions } from '../../../hooks/use-route-permissions';
import { useProviderPermissions } from '../../../hooks/use-provider-permissions';
import { invitesQuery } from '../../../queries';
import { Modal } from '../../../components/UI/Modal/modal';
import { QueryBoundary } from '../../../components/Tools/query-boundary';
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
import { providerPermissionGroups, routePermissionGroups } from './permission-options';
import type { UUID } from '../../../types/ids';

interface IInviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface IPermissionsFieldProps {
  selected: Set<UUID>;
  onChange: (selected: Set<UUID>) => void;
}

const InvitePermissionsField = ({ selected, onChange }: IPermissionsFieldProps) => {
  const { data: routePermissions } = useRoutePermissions();

  if (routePermissions.length === 0) return null;

  return (
    <ModalField>
      <ModalLabel>Permissões do app</ModalLabel>
      <PermissionsSelector
        groups={routePermissionGroups(routePermissions)}
        selected={selected}
        onChange={onChange}
      />
    </ModalField>
  );
};

// Mesmo componente, outra chave de payload e outro catálogo: as duas listas são
// independentes e o convite carrega as duas.
const InviteProviderPermissionsField = ({ selected, onChange }: IPermissionsFieldProps) => {
  const { data: providerPermissions } = useProviderPermissions();

  if (providerPermissions.length === 0) return null;

  return (
    <ModalField>
      <ModalLabel>Permissões nos agentes</ModalLabel>
      <PermissionsSelector
        groups={providerPermissionGroups(providerPermissions)}
        selected={selected}
        onChange={onChange}
      />
    </ModalField>
  );
};

export const InviteMemberModal = ({ isOpen, onClose }: IInviteMemberModalProps) => {
  const queryClient = useQueryClient();
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<UUID>>(new Set());
  const [selectedProviderPermissions, setSelectedProviderPermissions] = useState<Set<UUID>>(new Set());
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
      void queryClient.invalidateQueries({ queryKey: invitesQuery.queryKey });
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
      setSelectedProviderPermissions(new Set());
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
        {Array.from(selectedProviderPermissions).map((permissionId) => (
          <input key={permissionId} type="hidden" name="provider_permissions" value={permissionId} />
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

          <QueryBoundary>
            <InvitePermissionsField
              selected={selectedPermissions}
              onChange={setSelectedPermissions}
            />
          </QueryBoundary>

          <QueryBoundary>
            <InviteProviderPermissionsField
              selected={selectedProviderPermissions}
              onChange={setSelectedProviderPermissions}
            />
          </QueryBoundary>

          {formError && <ModalError>{formError}</ModalError>}

          <ModalSubmit type="submit" disabled={isPending}>
            {isPending ? 'Enviando...' : 'Enviar convites'}
          </ModalSubmit>
        </ModalFieldset>
      </ModalForm>
    </Modal>
  );
};
