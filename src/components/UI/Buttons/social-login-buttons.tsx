import styles from './buttons.module.css';
import type { Provider } from '../../../types/integrations';
import { GoogleButton } from './google-button';
import { MetaButton } from './meta-button';

interface ISocialLoginButtonsProps {
  onSelect: (provider: Provider) => void;
  disabled?: boolean;
}

// Os dois providers de login social, sempre juntos — login e cadastro usam o mesmo bloco.
export const SocialLoginButtons = ({ onSelect, disabled }: ISocialLoginButtonsProps) => (
  <div className={styles.socialStack}>
    <GoogleButton onClick={() => onSelect('google')} disabled={disabled} />
    <MetaButton onClick={() => onSelect('meta')} disabled={disabled} />
  </div>
);
