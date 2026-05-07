import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "../../../../contexts/auth";
import { useCompanyPermissions } from "../../../../contexts/company/contexts";
import { CompanyDropdown } from "../../CompanyDropdown/company-dropdown";
import { InvitesMenu } from "../../InvitesMenu/invites-menu";
import favicon from '../../../../assets/favicon.png';
import {
    BrandImage,
    BrandLink,
    BrandText,
    HeaderContent,
    HeaderNav,
    Menu,
    MenuItem,
    ProfileAvatar,
    ProfileButton,
    ProfileEmail,
    ProfileMenu,
    ProfileMenuHeader,
    ProfileMenuItem,
    ProfileMenuLink,
    ProfileName,
    RightActions,
} from "./layout.style";

export const Header = () => {

    const { logout, me } = useAuthContext();
    const { canManageUsers } = useCompanyPermissions();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const menuPages = [
        { label: 'Página inicial', href: '/' },
        { label: 'Conversas', href: '/conversas' },
        { label: 'Cursos', href: '/cursos' },
        ...(canManageUsers ? [{ label: 'Gerenciamento', href: '/gerenciamento/membros' }] : []),
    ];

    const profileAvatarUrl = useMemo(() => {
        if (me?.avatar_url) return me.avatar_url;

        const seedName = me?.name ? me.name.trim()[0] : 'U';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(seedName)}&background=FFBE00&color=00001F&bold=true&format=png&size=128`;
    }, [me]);

    const pendingInviteCount = useMemo(
        () => (me?.invites ?? []).filter((i) => i.status === 'pending').length,
        [me],
    );

    useEffect(() => {
        setIsMenuOpen(false);
    }, [location.pathname]);

    return (
        <HeaderNav>
            <HeaderContent>
                <BrandLink to="/">
                    <BrandImage src={favicon} alt="Logo da DataLab" />
                    <BrandText>DataLab</BrandText>
                </BrandLink>
                <Menu>
                    {menuPages.map(({ label, href }) => {
                        const isActive = location.pathname === href;
                        return (
                            <MenuItem 
                                key={href}
                                to={href} 
                                $active={isActive}
                            >
                                {label}
                            </MenuItem>
                        );
                    })}
                </Menu>
                <RightActions ref={menuRef}>
                    <CompanyDropdown />
                    <ProfileButton
                        title="Abrir menu de perfil"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        style={{ marginLeft: '0.75rem' }}
                    >
                        <ProfileAvatar src={profileAvatarUrl} alt={`Foto de perfil de ${me?.name}`} />
                        {pendingInviteCount > 0 && (
                            <ProfileAvatarBadge>{pendingInviteCount > 9 ? '9+' : pendingInviteCount}</ProfileAvatarBadge>
                        )}
                    </ProfileButton>

                    {isMenuOpen && (
                        <ProfileMenu>
                            <ProfileMenuHeader>
                                <ProfileName>{me?.name || 'Usuário'}</ProfileName>
                                <ProfileEmail>{me?.email || 'sem-email@datalab.app'}</ProfileEmail>
                            </ProfileMenuHeader>

                            <ProfileMenuLink to="/perfil/editar">Editar perfil</ProfileMenuLink>
                            <InvitesMenu />
                            <ProfileMenuItem onClick={logout}>Sair</ProfileMenuItem>
                        </ProfileMenu>
                    )}
                </RightActions>
            </HeaderContent>
        </HeaderNav>
    );
}

// Badge flutuante sobre o avatar indicando convites pendentes
import styled from "styled-components";
const ProfileAvatarBadge = styled.span`
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