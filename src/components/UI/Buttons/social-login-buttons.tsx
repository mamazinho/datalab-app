import styled from 'styled-components';
import type { Provider } from '../../../types/integrations';
import { GoogleButton } from './google-button';
import { MetaButton } from './meta-button';

interface ISocialLoginButtonsProps {
  onSelect: (provider: Provider) => void;
  disabled?: boolean;
}

const ButtonsStack = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
`;

// Os dois providers de login social, sempre juntos — login e cadastro usam o mesmo bloco.
export const SocialLoginButtons = ({ onSelect, disabled }: ISocialLoginButtonsProps) => (
  <ButtonsStack>
    <GoogleButton onClick={() => onSelect('google')} disabled={disabled} />
    <MetaButton onClick={() => onSelect('meta')} disabled={disabled} />
  </ButtonsStack>
);
