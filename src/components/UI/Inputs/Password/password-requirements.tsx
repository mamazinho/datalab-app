import { getPasswordRuleStatus } from '../../../../schemas/password';
import { RequirementItem, RequirementsList } from './password-requirements.style';

interface IPasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements = ({ password }: IPasswordRequirementsProps) => {
  const status = getPasswordRuleStatus(password);

  return (
    <RequirementsList aria-live="polite">
      {Object.values(status).map((rule) => (
        <RequirementItem key={rule.message} $isValid={rule.valid}>{rule.message}</RequirementItem>
      ))}
    </RequirementsList>
  );
};
