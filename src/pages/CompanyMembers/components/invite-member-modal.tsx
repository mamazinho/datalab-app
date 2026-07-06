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
} from '../company-members.style';
import { PermissionsSelector } from './permissions-list';

interface IInviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
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
    const load = async () => {
      try {
        const data = await DatalabAPI.MembershipsResource.listRoutePermissions();
        setRoutePermissions(data);
      } catch {
        setRoutePermissions([]);
      }
    };
    void load();
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
        await DatalabAPI.MembershipsResource.upsertInvite({
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
              <PermissionsSelector
                permissions={routePermissions}
                selected={selectedPermissions}
                onChange={setSelectedPermissions}
              />
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
