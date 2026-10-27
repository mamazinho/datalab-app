import styles from './buttons.module.css';
import type { Provider } from '../../../types/integrations';
import { GoogleButton } from './google-button';
import { MetaButton } from './meta-button';

interface ISocialLoginButtonsProps {
  onSelect: (provider: Provider) => void;
  disabled?: boolean;
}

export const SocialLoginButtons = ({ onSelect, disabled }: ISocialLoginButtonsProps) => (
  <div className={styles.socialStack}>
    <GoogleButton onClick={() => onSelect('google')} disabled={disabled} />
    <MetaButton onClick={() => onSelect('meta')} disabled={disabled} />
  </div>
);
