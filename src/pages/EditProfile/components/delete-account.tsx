import { useActionState, useState } from 'react';
import { toast } from 'react-toastify';
import { Modal } from '../../../components/UI/Modal/modal';
import { useAuthContext } from '../../../contexts/auth';
import { useActionFeedback } from '../../../hooks/use-action-feedback';
import type { IUserResponse } from '../../../services/datalab-api/usersResource';
import { Badge, ErrorText, Field, Input, Label } from '../../../styles/design-system.style';
import { INITIAL_ACTION_STATE } from '../../../types/actions';
import { deleteAccountAction } from '../actions';
import {
  CompanyList,
  DangerButton,
  DangerText,
  DangerTitle,
  DangerZone,
  DeleteAccountForm,
  DeleteAccountSubmit,
} from '../edit-profile.style';

export const DeleteAccount = ({ me }: { me: IUserResponse }) => {
  const { logout } = useAuthContext();
  const [isOpen, setIsOpen] = useState(false);
  const [confirmation, setConfirmation] = useState('');
  const [formState, formAction, isPending] = useActionState(deleteAccountAction, INITIAL_ACTION_STATE);
  const ownsACompany = me.companies.some((company) => company.membership.membership_role === 'owner');

  useActionFeedback(formState, {
    onSuccess: () => {
      toast.success('Sua conta foi excluída.');
      logout();
    },
    onError: () => {},
  });

  const close = () => {
    setIsOpen(false);
    setConfirmation('');
  };

  return (
    <DangerZone aria-labelledby="delete-account-title">
      <DangerTitle id="delete-account-title">Excluir conta</DangerTitle>
      <DangerText>Seus dados pessoais são apagados e você sai de todas as empresas. Não dá para desfazer.</DangerText>
      <DangerButton type="button" onClick={() => setIsOpen(true)}>
        Excluir minha conta
      </DangerButton>

      <Modal isOpen={isOpen} onClose={close} title="Excluir sua conta?">
        <DeleteAccountForm action={formAction}>
          {me.companies.length > 0 && (
            <div>
              <DangerText>Você vai sair de todas as empresas em que participa:</DangerText>
              <CompanyList>
                {me.companies.map((company) => (
                  <li key={company.id}>
                    {company.name}
                    {company.membership.membership_role === 'owner' && <Badge>Owner</Badge>}
                  </li>
                ))}
              </CompanyList>
            </div>
          )}

          {ownsACompany && (
            <DangerText>
              Nas empresas em que você é owner, transfira a posse para outro membro antes. Se você for o único
              membro, a empresa é excluída junto.
            </DangerText>
          )}

          <Field>
            <Label htmlFor="confirm-account-email">Para confirmar, digite seu e-mail</Label>
            <Input
              id="confirm-account-email"
              autoComplete="off"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              placeholder={me.email}
            />
          </Field>

          {formState.error && !formState.success && <ErrorText role="alert">{formState.error}</ErrorText>}

          <DeleteAccountSubmit type="submit" disabled={confirmation.trim().toLowerCase() !== me.email || isPending}>
            {isPending ? 'Excluindo...' : 'Excluir conta'}
          </DeleteAccountSubmit>
        </DeleteAccountForm>
      </Modal>
    </DangerZone>
  );
};
