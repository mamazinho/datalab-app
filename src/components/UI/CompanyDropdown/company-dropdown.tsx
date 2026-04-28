import { useEffect, useRef, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthContext } from '../../../contexts/auth';
import { useCompanyContext } from '../../../contexts/company';
import {
  ActiveDot,
  DropdownChevron,
  DropdownItem,
  DropdownMenu,
  DropdownMenuLabel,
  DropdownTrigger,
  DropdownTriggerName,
  DropdownWrapper,
} from './company-dropdown.style';
import type { IUserCompany } from '../../../services/datalab-api/usersResource';

export const CompanyDropdown = () => {
  const { me } = useAuthContext();
  const { currentCompany, setCurrentCompany } = useCompanyContext();
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const companies: IUserCompany[] = me?.companies ?? [];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  console.log("CompanyDropdown render", { currentCompany, companies });
  if (!currentCompany) return <Navigate to="/onboarding" replace />;

  const handleSelect = (userCompany: IUserCompany) => {
    setCurrentCompany(userCompany);
    setIsOpen(false);
  };

  return (
    <DropdownWrapper ref={wrapperRef}>
      <DropdownTrigger
        onClick={() => setIsOpen((prev) => !prev)}
        title="Trocar empresa"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <DropdownTriggerName>{currentCompany.company.name}</DropdownTriggerName>
        <DropdownChevron
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          style={{ transform: isOpen ? 'rotate(180deg)' : undefined }}
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
        </DropdownChevron>
      </DropdownTrigger>

      {isOpen && (
        <DropdownMenu role="listbox">
          <DropdownMenuLabel>Empresa ativa</DropdownMenuLabel>
          {companies.map((uc) => {
            const isActive = uc.company.id === currentCompany.company.id;
            const isOwner = uc.membership.membership_role === 'owner';
            return (
              <DropdownItem
                key={uc.company.id}
                role="option"
                aria-selected={isActive}
                $active={isActive}
                onClick={() => handleSelect(uc)}
              >
                {isActive && <ActiveDot />}
                {uc.company.name}
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
              </DropdownItem>
            );
          })}
        </DropdownMenu>
      )}
    </DropdownWrapper>
  );
};
