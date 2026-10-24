import styles from './company-dropdown.module.css';
import { useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useMe, useIsAuthLoading } from '../../../hooks/use-me';
import { useCompanyContext } from '../../../contexts/company';
import { useClickOutside } from '../../../hooks/use-click-outside';
import { CompanyFormModal } from '../CompanyFormModal';
import type { IUserCompany } from '../../../services/datalab-api/usersResource';

export const CompanyDropdown = () => {
  const { data: me } = useMe();
  const isAuthLoading = useIsAuthLoading();
  const { currentCompany, setCurrentCompany } = useCompanyContext();
  const [isOpen, setIsOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const userCompanies: IUserCompany[] = me?.companies ?? [];

  useClickOutside(wrapperRef, () => setIsOpen(false));

  if (isAuthLoading) return null;
  if (!currentCompany) return <Navigate to="/onboarding" replace />;

  const handleSelect = (userCompany: IUserCompany) => {
    setCurrentCompany(userCompany);
    setIsOpen(false);
  };

  return (
    <div className={styles.dropdownWrapper} ref={wrapperRef}>
      <button className={styles.dropdownTrigger}
        onClick={() => setIsOpen((prev) => !prev)}
        title="Trocar empresa"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={styles.dropdownTriggerName}>{currentCompany.name}</span>
        <svg className={styles.dropdownChevron}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className={styles.dropdownMenu} role="listbox">
          <p className={styles.dropdownMenuLabel}>Empresa ativa</p>
          {userCompanies.map((userCompany) => {
            const isActive = userCompany.id === currentCompany.id;
            const isOwner = userCompany.membership.membership_role === 'owner';
            return (
              <button className={styles.dropdownItem}
                key={userCompany.id}
                role="option"
                aria-selected={isActive}
                onClick={() => handleSelect(userCompany)}
              >
                {isActive && <span className={styles.activeDot} />}
                {userCompany.name}
                {isOwner && (
                  <svg
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    style={{ width: '0.85rem', height: '0.85rem', marginLeft: 'auto', opacity: 0.6, flexShrink: 0 }}
                    aria-label="Owner"
                  >
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm0 2h14v2H5v-2z" />
                  </svg>
                )}
              </button>
            );
          })}

          <button className={styles.createCompanyItem}
            onClick={() => {
              setIsOpen(false);
              setIsCreateOpen(true);
            }}
          >
            + Criar empresa
          </button>
        </div>
      )}

      <CompanyFormModal
        isOpen={isCreateOpen}
        company={null}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
