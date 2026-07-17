import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "../../../../contexts/auth";
import { useCompanyContext } from "../../../../contexts/company";
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
    ProfileAvatarBadge,
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
    const { hasPermissionByTag, hasAnyAgentsPermission } = useCompanyContext();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const canSeeIaSection = hasPermissionByTag('chat') || hasAnyAgentsPermission;

    const menuPages = [
        { label: 'Página inicial', href: '/' },
        ...(canSeeIaSection ? [{ label: 'IA', href: '/ia' }] : []),
        { label: 'Cursos', href: '/cursos' },
        ...(canManageUsers ? [{ label: 'Gerenciamento', href: '/gerenciamento/membros' }] : []),
    ];

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
                        // Raiz só ativa por igualdade; demais itens também ativam nas subrotas
                        const isActive = href === '/'
                            ? location.pathname === '/'
                            : location.pathname === href || location.pathname.startsWith(`${href}/`);
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
                        <ProfileAvatar
                            src={me?.avatar_url}
                            name={me?.name ?? ''}
                            size={128}
                            seed="initial"
                            alt={`Foto de perfil de ${me?.name}`}
                        />
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