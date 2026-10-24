import styles from './password-requirements.module.css';
import { getPasswordRuleStatus } from '../../../../schemas/password';

interface IPasswordRequirementsProps {
  password: string;
}

export const PasswordRequirements = ({ password }: IPasswordRequirementsProps) => {
  const status = getPasswordRuleStatus(password);

  return (
    <ul className={styles.requirementsList} aria-live="polite">
      {Object.values(status).map((rule) => (
        <li className={styles.requirementItem} key={rule.message} data-valid={rule.valid}>{rule.message}</li>
      ))}
    </ul>
  );
};
