import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../../../contexts/auth';
import { useCompanyContext } from '../../../contexts/company';
import {
  CompanyPickerItem,
  CompanyPickerList,
  CompanyPickerName,
  CompanyPickerRole,
  OnboardingCard,
  OnboardingSubtitle,
  OnboardingTitle,
  OnboardingWrapper,
} from '../onboarding.style';
import type { IUserCompany } from '../../../services/datalab-api/usersResource';

export const OnboardingCompanyPicker = () => {
  const { me } = useAuthContext();
  const { setCurrentCompany } = useCompanyContext();
  const navigate = useNavigate();

  const companies: IUserCompany[] = me?.companies ?? [];

  const handleSelect = (company: IUserCompany) => {
    setCurrentCompany(company);
    navigate('/');
  };

  return (
    <OnboardingWrapper>
      <OnboardingCard>
        <OnboardingTitle>Selecione sua empresa</OnboardingTitle>
        <OnboardingSubtitle>
          Você faz parte de mais de uma empresa. Escolha com qual deseja continuar.
        </OnboardingSubtitle>
        <CompanyPickerList>
          {companies.map((uc) => (
            <li key={uc.company.id}>
              <CompanyPickerItem type="button" onClick={() => handleSelect(uc)}>
                <CompanyPickerName>{uc.company.name}</CompanyPickerName>
                <CompanyPickerRole>{uc.membership.membership_role}</CompanyPickerRole>
              </CompanyPickerItem>
            </li>
          ))}
        </CompanyPickerList>
      </OnboardingCard>
    </OnboardingWrapper>
  );
};
