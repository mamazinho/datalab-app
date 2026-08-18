import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "../../../../contexts/auth";
import { useMe } from "../../../../hooks/use-me";
import { useCompanyContext } from "../../../../contexts/company";
import { COMPANY_PATH, INTEGRATIONS_PATH, MANAGEMENT_BASE_PATH, MEMBERS_PATH } from "../../../../routes/paths";
import { RouteTabs, type IRouteTabItem } from "../../Tabs";
import { CompanyDropdown } from "../../CompanyDropdown/company-dropdown";
import { InvitesMenu } from "../../InvitesMenu/invites-menu";
import favicon from '../../../../assets/favicon.png';
import {
    BrandImage,
    BrandLink,
    BrandText,
    HeaderContent,
    HeaderNav,
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

    const { logout } = useAuthContext();
    const { data: me } = useMe();
    const { hasPermissionByTag, hasAnyAgentsPermission, hasAnyCompanyPermission } = useCompanyContext();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const canSeeIaSection = hasPermissionByTag('chat') || hasAnyAgentsPermission;
    const canManageMembers = hasPermissionByTag('company');
    // Gerenciamento está sempre disponível: mesmo sem permissão de empresa, todo
    // membro precisa da aba de integrações para conectar a conta dele.
    // Cai na primeira aba que o usuário pode ver.
    const managementHref = canManageMembers
        ? MEMBERS_PATH
        : hasAnyCompanyPermission
            ? COMPANY_PATH
            : INTEGRATIONS_PATH;

    // `match` existe para itens cujo destino é uma sub-aba: o menu continua
    // ativo em qualquer aba de gerenciamento, não só na de entrada.
    const menuPages: IRouteTabItem[] = [
        { label: 'Página inicial', to: '/' },
        ...(canSeeIaSection ? [{ label: 'IA', to: '/ia' }] : []),
        { label: 'Cursos', to: '/cursos' },
        { label: 'Gerenciamento', to: managementHref, match: MANAGEMENT_BASE_PATH },
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
                <RouteTabs items={menuPages} variant="nav" label="Menu principal" />
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