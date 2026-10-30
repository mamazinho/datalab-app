import modal from '../../../styles/modal-form.module.css';
import styles from '../company-members.module.css';
import { useActionState, useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { useQueryClient } from '@tanstack/react-query';
import { invitesQuery } from '../../../queries';
import { Modal } from '../../../components/UI/Modal/modal';
import { QueryBoundary } from '../../../components/Tools/query-boundary';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import { inviteMembersAction } from '../actions';
import { ProviderPermissionsField, RoutePermissionsField } from './permission-fields';
import type { UUID7 } from '../../../types/ids';

interface IInviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InviteMemberModal = ({ isOpen, onClose }: IInviteMemberModalProps) => {
  const queryClient = useQueryClient();
  const [emails, setEmails] = useState<string[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [selectedRoutePermissions, setSelectedRoutePermissions] = useState<Set<UUID7>>(new Set());
  const [selectedProviderPermissions, setSelectedProviderPermissions] = useState<Set<UUID7>>(new Set());
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
    // The error shows inline in the form
    onError: () => {},
  });

  useEffect(() => {
    if (!isOpen) {
      setEmails([]);
      setInputValue('');
      setSelectedRoutePermissions(new Set());
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
      <form className={modal.form} action={inviteFormAction}>
        <input type="hidden" name="emails" value={emails.join(',')} />

        <fieldset className={modal.fieldset} disabled={isPending}>
          <div className={modal.field}>
            <label className={modal.label}>E-mails</label>
            <div className={styles.emailTagList} onClick={() => inputRef.current?.focus()}>
              {emails.map((email) => (
                <span className={styles.emailTag} key={email}>
                  {email}
                  <button className={styles.emailTagRemove}
                    type="button"
                    onClick={(e) => { e.stopPropagation(); removeEmail(email); }}
                    aria-label={`Remover ${email}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              <input className={styles.emailTagInput}
                ref={inputRef}
                name="emailDraft"
                value={inputValue}
                onChange={(e) => { setInputValue(e.target.value); setTagError(null); }}
                onKeyDown={handleKeyDown}
                onBlur={handleBlur}
                placeholder={emails.length === 0 ? 'membro@empresa.com (espaço para adicionar)' : ''}
                autoFocus
              />
            </div>
          </div>

          <QueryBoundary>
            <RoutePermissionsField
              selected={selectedRoutePermissions}
              onChange={setSelectedRoutePermissions}
            />
          </QueryBoundary>

          <QueryBoundary>
            <ProviderPermissionsField
              selected={selectedProviderPermissions}
              onChange={setSelectedProviderPermissions}
            />
          </QueryBoundary>

          {formError && <p className={modal.error}>{formError}</p>}

          <button className={modal.submit} type="submit" disabled={isPending}>
            {isPending ? 'Enviando...' : 'Enviar convites'}
          </button>
        </fieldset>
      </form>
    </Modal>
  );
};
