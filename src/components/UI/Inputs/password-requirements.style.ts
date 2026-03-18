import styled from 'styled-components';

export const RequirementsList = styled.ul`
  list-style: none;
  margin: 0.45rem 0 0;
  padding: 0;
  display: grid;
  gap: 0.25rem;
`;

export const RequirementItem = styled.li<{ $isValid: boolean }>`
  font-size: 0.8rem;
  color: ${({ theme, $isValid }) => ($isValid ? theme.colors.success : theme.colors.textSecondary)};
`;
