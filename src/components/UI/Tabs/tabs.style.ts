import styled, { css } from 'styled-components';
import { Link } from 'react-router-dom';

/**
 * `tabs` = abas de conteúdo (IA, Gerenciamento, Membros): sublinhado contínuo
 * embaixo da faixa. `nav` = menu do header: itens soltos, sem faixa.
 */
export type TabsVariant = 'tabs' | 'nav';

const listVariants = {
  tabs: css`
    gap: 0.5rem;
    border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  `,
  nav: css`
    gap: 2rem;
    align-items: center;
  `,
} as const;

export const TabsList = styled.nav<{ $variant: TabsVariant }>`
  display: flex;
  ${({ $variant }) => listVariants[$variant]}
`;

const itemBase = css`
  border: 0;
  background: transparent;
  text-decoration: none;
  font-family: ${({ theme }) => theme.fonts.main};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textSecondary};
  border-bottom: 2px solid transparent;
  cursor: pointer;
  transition: color 0.18s ease, border-color 0.18s ease;
`;

const itemVariants = {
  tabs: css`
    padding: 0.75rem 1.5rem;
    font-size: 0.9rem;

    &:hover {
      color: ${({ theme }) => theme.colors.primary};
    }
  `,
  nav: css`
    padding: 0.2rem 0;

    &:hover {
      color: ${({ theme }) => theme.colors.text};
      border-bottom-color: ${({ theme }) => theme.colors.primary};
    }
  `,
} as const;

const itemActiveVariants = {
  tabs: css`
    color: ${({ theme }) => theme.colors.primary};
    border-bottom-color: ${({ theme }) => theme.colors.primary};
  `,
  nav: css`
    color: ${({ theme }) => theme.colors.text};
    border-bottom-color: ${({ theme }) => theme.colors.primary};
  `,
} as const;

const item = css<{ $variant: TabsVariant; $active: boolean }>`
  ${itemBase}
  ${({ $variant }) => itemVariants[$variant]}
  ${({ $variant, $active }) => $active && itemActiveVariants[$variant]}
`;

export const TabLink = styled(Link)<{ $variant: TabsVariant; $active: boolean }>`
  ${item}
`;

export const TabButton = styled.button<{ $variant: TabsVariant; $active: boolean }>`
  ${item}
`;
