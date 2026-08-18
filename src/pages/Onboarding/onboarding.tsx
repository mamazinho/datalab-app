import { useMe } from '../../hooks/use-me';
import { OnboardingCompanyPicker, OnboardingWelcome } from './components';

export const Onboarding = () => {
  const { data: me } = useMe();

  const companies = me?.companies ?? [];

  return companies.length >= 2 ? <OnboardingCompanyPicker /> : <OnboardingWelcome />;
};
