import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Input, Label } from '../../../styles/design-system.style';

export const UsageMonthField = styled(Label)`
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

export const UsageMonthInput = styled(Input)`
  width: auto;
`;

export const UsageTotals = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr));
  gap: 1rem;
  margin: 0;
`;

export const UsageTotal = styled.div`
  padding: 1rem 1.2rem;
  border-radius: 1rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
`;

export const UsageTotalLabel = styled.dt`
  font-size: 0.78rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const UsageTotalValue = styled.dd`
  margin: 0.3rem 0 0;
  font-size: 1.6rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
`;

export const UsageSectionTitle = styled.h2`
  margin: 0 0 0.75rem;
  font-size: 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

export const UsageChatTitle = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
`;

export const UsageChatLink = styled(Link)`
  font-weight: 600;
  text-decoration: underline;
  text-underline-offset: 0.15em;
`;
