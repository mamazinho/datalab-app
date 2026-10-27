import styles from './layout.module.css';
import { Avatar } from '../../Avatar';
import { Link } from 'react-router-dom';
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "../../../../contexts/auth";
import { useMe } from "../../../../hooks/use-me";
import { useCompanyContext } from "../../../../contexts/company";
import { COMPANY_PATH, INTEGRATIONS_PATH, MANAGEMENT_BASE_PATH, MEMBERS_PATH } from "../../../../routes/paths";
import { RouteTabs, type IRouteTabItem } from "../../Tabs";
import { CompanyDropdown } from "../../CompanyDropdown/company-dropdown";
import { InvitesMenu } from "../../InvitesMenu/invites-menu";
import logo from '../../../../assets/logo.png';

export const Header = () => {

    const { logout } = useAuthContext();
    const { data: me } = useMe();
    const { hasPermissionByTag, hasAnyAgentsPermission, hasAnyCompanyPermission } = useCompanyContext();
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const canSeeIaSection = hasPermissionByTag('chat') || hasAnyAgentsPermission;
    const canManageMembers = hasPermissionByTag('company');
    // Always reachable: every member needs the integrations tab to connect their own account
    const managementHref = canManageMembers
        ? MEMBERS_PATH
        : hasAnyCompanyPermission
            ? COMPANY_PATH
            : INTEGRATIONS_PATH;

    // match keeps the item active on any management sub-tab, not only the landing one
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
        <nav className={styles.headerNav}>
            <div className={styles.headerContent}>
                <Link className={styles.brandLink} to="/">
                    <img className={styles.brandImage} src={logo} alt="Logo da DataLab" />
                    <span className={styles.brandText}>DataLab</span>
                </Link>
                <RouteTabs items={menuPages} variant="nav" label="Menu principal" />
                <div className={styles.rightActions} ref={menuRef}>
                    <CompanyDropdown />
                    <button className={styles.profileButton}
                        title="Abrir menu de perfil"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                        style={{ marginLeft: '0.75rem' }}
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
        </nav>
    );
}