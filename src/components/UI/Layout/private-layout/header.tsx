import styles from './layout.module.css';
import { Avatar } from '../../Avatar';
import { Link } from 'react-router-dom';
import { useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "../../../../contexts/auth";
import { useMe } from "../../../../hooks/use-me";
import { useCompanyContext } from "../../../../contexts/company";
import { COMPANY_PATH, INTEGRATIONS_PATH, MANAGEMENT_BASE_PATH, MEMBERS_PATH } from "../../../../routes/paths";
import { COMPANY_ROUTE_PERMISSIONS } from "../../../../utils/route-permissions";
import { RouteTabs, type IRouteTabItem } from "../../Tabs";
import { CompanyDropdown } from "../../CompanyDropdown/company-dropdown";
import { InvitesMenu } from "../../InvitesMenu/invites-menu";
import { useClickOutside } from "../../../../hooks/use-click-outside";
import logo from '../../../../assets/datalab_main_logo.png';

export const Header = () => {

    const { logout } = useAuthContext();
    const { data: me } = useMe();
    const { hasPermissionByTag, hasPermissionByRoute } = useCompanyContext();
    const location = useLocation();
    // Opened on one route: navigating closes it
    const [menuOpenedAt, setMenuOpenedAt] = useState<string | null>(null);
    const isMenuOpen = menuOpenedAt === location.pathname;
    const menuRef = useRef<HTMLDivElement | null>(null);

    const canSeeIaSection = hasPermissionByTag(['chat', 'agents']);
    const canManageMembers = hasPermissionByTag('memberships');
    // Always reachable: every member needs the integrations tab to connect their own account
    const managementHref = canManageMembers
        ? MEMBERS_PATH
        : hasPermissionByRoute(Object.values(COMPANY_ROUTE_PERMISSIONS))
            ? COMPANY_PATH
            : INTEGRATIONS_PATH;

    // match keeps the item active on any management sub-tab, not only the landing one
    const menuPages: IRouteTabItem[] = [
        { label: 'Página inicial', to: '/' },
        ...(canSeeIaSection ? [{ label: 'IA', to: '/ia' }] : []),
        { label: 'Cursos', to: '/cursos' },
        { label: 'Gerenciamento', to: managementHref, match: MANAGEMENT_BASE_PATH },
    ];

    const pendingInviteCount = (me?.invites ?? []).filter((i) => i.status === 'pending').length;

    useClickOutside(menuRef, () => setMenuOpenedAt(null), isMenuOpen);

    return (
        <nav className={styles.headerNav}>
            <div className={styles.headerContent}>
                <Link className={styles.brandLink} to="/">
                    <img className={styles.brandImage} src={logo} alt="Logo da DataLab" />
                    <span className={styles.brandText}>DataLab</span>
                </Link>
                <RouteTabs items={menuPages} variant="nav" label="Menu principal" />
                <div className={styles.rightActions}>
                    <CompanyDropdown />
                    <div className={styles.profileWrapper} ref={menuRef}>
                        <button className={styles.profileButton}
                            title="Abrir menu de perfil"
                            onClick={() => setMenuOpenedAt(isMenuOpen ? null : location.pathname)}
                            aria-haspopup="menu"
                            aria-expanded={isMenuOpen}
                        >
                            <Avatar className={styles.profileAvatar}
                                src={me?.avatar_url}
                                name={me?.name ?? ''}
                                seed="initial"
                                alt={`Foto de perfil de ${me?.name}`}
                            />
                            {pendingInviteCount > 0 && (
                                <span className={styles.profileAvatarBadge}>{pendingInviteCount > 9 ? '9+' : pendingInviteCount}</span>
                            )}
                        </button>

                        {isMenuOpen && (
                            <div className={styles.profileMenu}>
                                <div className={styles.profileMenuHeader}>
                                    <p className={styles.profileName}>{me?.name || 'Usuário'}</p>
                                    <p className={styles.profileEmail}>{me?.email || 'sem-email@datalab.app'}</p>
                                </div>

                                <Link className={styles.profileMenuLink} to="/perfil/editar">Editar perfil</Link>
                                <InvitesMenu />
                                <button className={styles.profileMenuItem} onClick={logout}>Sair</button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}