import modal from '../../../styles/modal-form.module.css';
import styles from '../company-members.module.css';
import { useActionState, useState } from 'react';
import { useQueryClient, useSuspenseQueries } from '@tanstack/react-query';
import { memberProviderPermissionsQuery, memberRoutePermissionsQuery } from '../../../queries';
import { Modal } from '../../../components/UI/Modal/modal';
import { QueryBoundary } from '../../../components/Tools/query-boundary';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import type { ICompanyMembership } from '../../../services/datalab-api/membershipsResource';
import type { UUID7 } from '../../../types/ids';
import { updateMemberPermissionsAction } from '../actions';
import { ProviderPermissionsField, RoutePermissionsField } from './permission-fields';

interface IMemberPermissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: ICompanyMembership | null;
}

interface IMemberPermissionsFormProps {
  memberId: UUID7;
  onSaved: () => void;
}

const MemberPermissionsForm = ({ memberId, onSaved }: IMemberPermissionsFormProps) => {
  const queryClient = useQueryClient();
  const [{ data: memberRoutePermissions }, { data: memberProviderPermissions }] = useSuspenseQueries({
    queries: [memberRoutePermissionsQuery(memberId), memberProviderPermissionsQuery(memberId)],
  });
  const [selectedRoutePermissions, setSelectedRoutePermissions] = useState(
    () => new Set(memberRoutePermissions.map((granted) => granted.route_permission_id)),
  );
  const [selectedProviderPermissions, setSelectedProviderPermissions] = useState(
    () => new Set(memberProviderPermissions.map((granted) => granted.provider_permission_id)),
  );

  const [saveState, saveFormAction, isPending] = useActionState(updateMemberPermissionsAction, INITIAL_ACTION_STATE);

  useActionFeedback(saveState, {
    successMessage: 'Permissões salvas com sucesso!',
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: memberRoutePermissionsQuery(memberId).queryKey });
      void queryClient.invalidateQueries({ queryKey: memberProviderPermissionsQuery(memberId).queryKey });
      onSaved();
    },
    // The error shows inline in the form
    onError: () => {},
  });

  return (
    <form className={modal.form} action={saveFormAction}>
      <input type="hidden" name="membershipId" value={memberId} />

      <fieldset className={modal.fieldset} disabled={isPending}>
        <QueryBoundary>
          <RoutePermissionsField selected={selectedRoutePermissions} onChange={setSelectedRoutePermissions} />
        </QueryBoundary>

        <QueryBoundary>
          <ProviderPermissionsField selected={selectedProviderPermissions} onChange={setSelectedProviderPermissions} />
        </QueryBoundary>

        {!saveState.success && saveState.error && <p className={modal.error}>{saveState.error}</p>}

        <button className={modal.submit} type="submit" disabled={isPending}>
          {isPending ? 'Salvando...' : 'Salvar permissões'}
        </button>
      </fieldset>
    </form>
  );
};

export const MemberPermissionsModal = ({ isOpen, onClose, member }: IMemberPermissionsModalProps) => (
  <Modal
    isOpen={isOpen}
    onClose={onClose}
    title={`Permissões — ${member?.user?.name ?? 'Membro'}`}
  >
    {member && (
      // Owners have everything implicitly; the API refuses to change them
      member.membership_role === 'owner' ? (
        <p className={styles.ownerNotice}>
          Este membro é owner da empresa e tem todas as permissões implicitamente — não há o
          que conceder ou revogar.
        </p>
      ) : (
        <QueryBoundary>
          <MemberPermissionsForm key={member.id} memberId={member.id} onSaved={onClose} />
        </QueryBoundary>
      )
    )}
  </Modal>
);
