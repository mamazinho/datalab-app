import modal from '../../../styles/modal-form.module.css';
import styles from '../company-members.module.css';
import { useActionState, useRef, useState } from 'react';
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
import { FormFieldset, SubmitButton } from '../../../components/UI/Forms';

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

  const [inviteState, inviteFormAction] = useActionState(inviteMembersAction, INITIAL_ACTION_STATE);

  useActionFeedback(inviteState, {
    onSuccess: (sent) => {
      const sentCount = sent?.sentCount ?? 0;
      const alreadyMembers = sent?.alreadyMembers ?? [];
      const alreadyInvited = sent?.alreadyInvited ?? [];
      toast.success(
        sentCount === 1
          ? 'Convite enviado com sucesso!'
          : `${sentCount} convites enviados com sucesso!`,
      );
      if (alreadyMembers.length === 1) {
        toast.warning(`${alreadyMembers[0]} já é membro da empresa e não recebeu um novo convite.`);
      } else if (alreadyMembers.length > 1) {
        toast.warning(`${alreadyMembers.join(', ')} já são membros da empresa e não receberam um novo convite.`);
      }
      if (alreadyInvited.length === 1) {
        toast.warning(`${alreadyInvited[0]} já tem um convite pendente e não recebeu um novo e-mail.`);
      } else if (alreadyInvited.length > 1) {
        toast.warning(`${alreadyInvited.join(', ')} já têm um convite pendente e não receberam um novo e-mail.`);
      }
      void queryClient.invalidateQueries({ queryKey: invitesQuery.queryKey });
      onClose();
    },
  });

  const addEmail = (raw: string) => {
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
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ' ' || e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addEmail(inputValue);
    } else if (e.key === 'Backspace' && !inputValue && emails.length > 0) {
      setEmails((prev) => prev.slice(0, -1));
    }
  };

  const handleBlur = () => {
    if (inputValue.trim()) addEmail(inputValue);
  };

  const removeEmail = (email: string) => {
    setEmails((prev) => prev.filter((e) => e !== email));
  };


  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Convidar membros">
      <form className={modal.form} action={inviteFormAction}>
        <input type="hidden" name="emails" value={emails.join(',')} />

        <FormFieldset className={modal.fieldset}>
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

          {/* React 19 resets the form after the action and unchecks the boxes; remounting redraws them from state */}
          <QueryBoundary key={`routes-${inviteState.timestamp}`}>
            <RoutePermissionsField
              selected={selectedRoutePermissions}
              onChange={setSelectedRoutePermissions}
            />
          </QueryBoundary>

          <QueryBoundary key={`providers-${inviteState.timestamp}`}>
            <ProviderPermissionsField
              selected={selectedProviderPermissions}
              onChange={setSelectedProviderPermissions}
            />
          </QueryBoundary>

          {tagError && <p className={modal.error}>{tagError}</p>}

          <SubmitButton className={modal.submit} pendingLabel="Enviando...">
            Enviar convites
          </SubmitButton>
        </FormFieldset>
      </form>
    </Modal>
  );
};
