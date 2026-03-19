import {
  PASSWORD_MIN_LENGTH,
  getPasswordRuleStatus,
} from '../../../../schemas/password';
import { RequirementItem, RequirementsList } from './password-requirements.style';

interface IPasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements = ({ password }: IPasswordRequirementsProps) => {
  const status = getPasswordRuleStatus(password);

  return (
    <RequirementsList aria-live="polite">
      <RequirementItem $isValid={status.minLength}>Pelo menos {PASSWORD_MIN_LENGTH} caracteres</RequirementItem>
      <RequirementItem $isValid={status.hasUppercase}>Pelo menos uma letra maiuscula</RequirementItem>
      <RequirementItem $isValid={status.hasSymbol}>Pelo menos um simbolo</RequirementItem>
    </RequirementsList>
  );
};
