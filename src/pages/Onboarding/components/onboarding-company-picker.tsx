import styles from '../onboarding.module.css';
import { useNavigate } from 'react-router-dom';
import { useMe } from '../../../hooks/use-me';
import { useCompanyContext } from '../../../contexts/company';
import type { IUserCompany } from '../../../services/datalab-api/usersResource';

export const OnboardingCompanyPicker = () => {
  const { data: me } = useMe();
  const { setCurrentCompany } = useCompanyContext();
  const navigate = useNavigate();

  const userCompanies: IUserCompany[] = me?.companies ?? [];

  const handleSelect = (company: IUserCompany) => {
    setCurrentCompany(company);
    navigate('/');
  };

  return (
    <div className={styles.onboardingWrapper}>
      <div className={styles.onboardingCard}>
        <h1 className={styles.onboardingTitle}>Selecione sua empresa</h1>
        <p className={styles.onboardingSubtitle}>
          Você faz parte de mais de uma empresa. Escolha com qual deseja continuar.
        </p>
        <ul className={styles.companyPickerList}>
          {userCompanies.map((userCompany) => (
            <li key={userCompany.id}>
              <button className={styles.companyPickerItem} type="button" onClick={() => handleSelect(userCompany)}>
                <span className={styles.companyPickerName}>{userCompany.name}</span>
                <span className={styles.companyPickerRole}>{userCompany.membership.membership_role}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
