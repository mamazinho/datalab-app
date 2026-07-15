import styled from 'styled-components';
import { NavLink } from 'react-router-dom';

export const IaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const IaTabs = styled.nav`
  display: flex;
  gap: 0.5rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const IaTabLink = styled(NavLink)`
  padding: 0.75rem 1.5rem;
  text-decoration: none;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  font-weight: 600;
  font-family: ${({ theme }) => theme.fonts.main};
  border-bottom: 2px solid transparent;
  transition: color 0.18s ease, border-color 0.18s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }

  &.active {
    color: ${({ theme }) => theme.colors.primary};
    border-bottom-color: ${({ theme }) => theme.colors.primary};
  }
`;
