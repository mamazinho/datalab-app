import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { Avatar } from '../../Avatar';

export const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
`;

export const MainContent = styled.main`
  flex: 1;
  width: min(100%, 80rem);
  margin: 1rem auto;
  padding: 0 1rem;
`;

export const HeaderNav = styled.nav`
  margin: 1rem auto 0;
  width: min(100%, 80rem);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 1rem;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 10px 20px ${({ theme }) => theme.colors.shadow};
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.85rem 1.1rem;
`;

export const BrandLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.text};
`;

export const BrandImage = styled.img`
  width: auto;
  height: 2rem;
`;

export const BrandText = styled.span`
  font-size: 1.2rem;
`;

export const Menu = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 2rem;
`;

export const RightActions = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
`;

const menuItemActiveStyles = css`
  border-bottom-color: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.text};
`;

export const MenuItem = styled(Link)<{ $active: boolean }>`
  padding: 0.2rem 0;
  border-bottom: 2px solid transparent;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-weight: 600;
  transition: color 0.18s ease, border-color 0.18s ease;

  ${({ $active }) => $active && menuItemActiveStyles}

  &:hover {
    color: ${({ theme }) => theme.colors.text};
    border-bottom-color: ${({ theme }) => theme.colors.primary};
  }
`;

export const LogoutButton = styled.button`
  border: 0;
  background: transparent;
  border-radius: 0.65rem;
  padding: 0.45rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  cursor: pointer;
  transition: background-color 0.18s ease, color 0.18s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.inputBackground};
    color: ${({ theme }) => theme.colors.text};
  }
`;

export const ProfileButton = styled.button`
  border: 0;
  background: transparent;
  border-radius: 999px;
  padding: 0;
  cursor: pointer;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const ProfileAvatar = styled(Avatar)`
  width: 2.35rem;
  height: 2.35rem;
  border-radius: 50%;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  object-fit: cover;
  box-shadow: 0 6px 12px ${({ theme }) => theme.colors.shadow};
`;

export const ProfileMenu = styled.div`
  position: absolute;
  top: calc(100% + 0.6rem);
  right: 0;
  width: 14rem;
  border-radius: 0.8rem;
  border: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 14px 24px ${({ theme }) => theme.colors.shadow};
  overflow: hidden;
  z-index: 120;
`;

export const ProfileMenuHeader = styled.div`
  padding: 0.75rem 0.85rem;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  background: ${({ theme }) => theme.colors.inputBackground};
`;

export const ProfileName = styled.p`
  margin: 0;
  font-size: 0.9rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
`;

export const ProfileEmail = styled.p`
  margin: 0.2rem 0 0;
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ProfileMenuItem = styled.button`
  width: 100%;
  border: 0;
  background: transparent;
  cursor: pointer;
  text-align: left;
  padding: 0.75rem 0.85rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.88rem;
  font-weight: 600;
  transition: background-color 0.16s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.inputBackground};
  }
`;

export const ProfileMenuLink = styled(Link)`
  display: block;
  width: 100%;
  padding: 0.75rem 0.85rem;
  color: ${({ theme }) => theme.colors.text};
  font-size: 0.88rem;
  font-weight: 600;
  transition: background-color 0.16s ease;

  &:hover {
    background: ${({ theme }) => theme.colors.inputBackground};
  }
`;

export const FooterContainer = styled.footer`
  width: min(100%, 80rem);
  margin: 0 auto;
  padding: 1rem;
`;

export const FooterContent = styled.div`
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  padding-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;

  @media (max-width: 720px) {
    flex-direction: column;
  }
`;

export const FooterCopy = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.86rem;
`;

export const FooterBrandImage = styled.img`
  width: auto;
  height: 1.8rem;
`;

export const SocialLinks = styled.div`
  display: inline-flex;
  gap: 0.75rem;
`;

export const SocialLink = styled.a`
  color: ${({ theme }) => theme.colors.textSecondary};
  transition: color 0.18s ease;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`;

export const SocialIcon = styled.svg`
  width: 1.2rem;
  height: 1.2rem;
  fill: currentColor;
`;

// Badge flutuante sobre o avatar indicando convites pendentes
export const ProfileAvatarBadge = styled.span`
    position: absolute;
    top: -0.15rem;
    right: -0.15rem;
    min-width: 1rem;
    height: 1rem;
    padding: 0 0.22rem;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.error};
    color: #fff;
    font-size: 0.62rem;
    font-weight: 800;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border: 2px solid ${({ theme }) => theme.colors.surface};
    pointer-events: none;
`;
