import { useAuthContext } from '../../contexts/auth';
import { OnboardingCompanyPicker, OnboardingWelcome } from './components';

export const Onboarding = () => {
  const { me } = useAuthContext();

  const companies = me?.companies ?? [];

  return companies.length >= 2 ? <OnboardingCompanyPicker /> : <OnboardingWelcome />;
};
