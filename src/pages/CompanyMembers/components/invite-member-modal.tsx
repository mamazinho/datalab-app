import { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '../../../components/UI/Modal/modal';
import { DatalabAPI } from '../../../services/datalab-api';
import type { IRoutePermission } from '../../../services/datalab-api/usersResource';
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
  PermissionGroup,
  PermissionGroupLabel,
  PermissionsList,
  PermissionToggleInfo,
  PermissionToggleName,
  PermissionToggleDesc,
  PermissionToggleRow,
} from '../company-members.style';

interface IInviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

function groupByTag(permissions: IRoutePermission[]): Record<string, IRoutePermission[]> {
  return permissions.reduce<Record<string, IRoutePermission[]>>((acc, p) => {
    const key = p.tag ?? 'Geral';
    (acc[key] ??= []).push(p);
    return acc;
  }, {});
}

export const InviteMemberModal = ({ isOpen, onClose, onSuccess }: IInviteMemberModalProps) => {
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedPermissions, setSelectedPermissions] = useState<Set<number>>(new Set());
  const [routePermissions, setRoutePermissions] = useState<IRoutePermission[]>([]);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    DatalabAPI.MembershipsResource.listRoutePermissions()
      .then(setRoutePermissions)
      .catch(() => setRoutePermissions([]));
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      setEmails([]);
      setInputValue('');
      setSelectedPermissions(new Set());
      setError(null);
    }
  }, [isOpen]);

  const addEmail = useCallback((raw: string) => {
    const email = raw.trim().toLowerCase();
    if (!email) return;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(`"${email}" não é um e-mail válido.`);
      return;
    }
    setEmails((prev) => prev.includes(email) ? prev : [...prev, email]);
    setInputValue('');
    setError(null);
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

  const togglePermission = useCallback((id: number) => {
    setSelectedPermissions((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const finalEmails = inputValue.trim()
        ? [...emails, inputValue.trim()]
        : emails;

      if (finalEmails.length === 0) {
        setError('Adicione ao menos um e-mail.');
        return;
      }

      setIsPending(true);
      setError(null);
      try {
        await DatalabAPI.MembershipsResource.createInvite({
          emails: finalEmails,
          permissions: Array.from(selectedPermissions),
        });
        toast.success(
          finalEmails.length === 1
            ? 'Convite enviado com sucesso!'
            : `${finalEmails.length} convites enviados com sucesso!`,
        );
        onSuccess();
        onClose();
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : String(e));
      } finally {
        setIsPending(false);
      }
    },
    [emails, inputValue, selectedPermissions, onSuccess, onClose],
  );

  const grouped = groupByTag(routePermissions);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Convidar membros">
      <ModalForm onSubmit={handleSubmit}>
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
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); setError(null); }}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={emails.length === 0 ? 'membro@empresa.com (espaço para adicionar)' : ''}
                autoFocus
              />
            </EmailTagList>
          </ModalField>

          {routePermissions.length > 0 && (
            <ModalField>
              <ModalLabel>Permissões</ModalLabel>
              <PermissionsList>
                {Object.entries(grouped).map(([tag, perms]) => (
                  <PermissionGroup key={tag}>
                    <PermissionGroupLabel>{tag}</PermissionGroupLabel>
                    {perms.map((p) => (
                      <PermissionToggleRow key={p.id} htmlFor={`perm-${p.id}`}>
                        <PermissionToggleInfo>
                          <PermissionToggleName>{p.name}</PermissionToggleName>
                          {p.description && (
                            <PermissionToggleDesc>{p.description}</PermissionToggleDesc>
                          )}
                        </PermissionToggleInfo>
                        <input
                          id={`perm-${p.id}`}
                          type="checkbox"
                          checked={selectedPermissions.has(p.id)}
                          onChange={() => togglePermission(p.id)}
                        />
                      </PermissionToggleRow>
                    ))}
                  </PermissionGroup>
                ))}
              </PermissionsList>
            </ModalField>
          )}

          {error && <ModalError>{error}</ModalError>}

          <ModalSubmit type="submit" disabled={isPending}>
            {isPending ? 'Enviando...' : 'Enviar convites'}
          </ModalSubmit>
        </ModalFieldset>
      </ModalForm>
    </Modal>
  );
};
