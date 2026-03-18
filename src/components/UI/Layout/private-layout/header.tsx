import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { useAuthContext } from "../../../../contexts/auth";
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
    const location = useLocation();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement | null>(null);

    const menuPages = [
        { label: 'Home', href: '/' },
        { label: 'Chats', href: '/chats' }
    ];

    const firstName = useMemo(() => {
        const fullName = me?.name || '';
        if (!fullName.trim()) return 'Perfil';
        return fullName.trim().split(' ')[0];
    }, [me]);

    const profileAvatarUrl = useMemo(() => {
        if (me?.avatar_url) return me.avatar_url;

        const seedName = firstName || 'U';
        return `https://ui-avatars.com/api/?name=${encodeURIComponent(seedName)}&background=FFBE00&color=00001F&bold=true&format=png&size=128`;
    }, [me, firstName]);

    useEffect(() => {
        const handleOutsideClick = (event: MouseEvent) => {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(event.target as Node)) {
                setIsMenuOpen(false);
            }
        };

        document.addEventListener('mousedown', handleOutsideClick);
        return () => {
            document.removeEventListener('mousedown', handleOutsideClick);
        };
    }, []);

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
                    <ProfileButton
                        title="Abrir menu de perfil"
                        onClick={() => setIsMenuOpen((prev) => !prev)}
                    >
                        <ProfileAvatar src={profileAvatarUrl} alt={`Foto de perfil de ${firstName}`} />
                    </ProfileButton>

                    {isMenuOpen && (
                        <ProfileMenu>
                            <ProfileMenuHeader>
                                <ProfileName>{me?.name || 'Usuário'}</ProfileName>
                                <ProfileEmail>{me?.email || 'sem-email@datalab.app'}</ProfileEmail>
                            </ProfileMenuHeader>

                            <ProfileMenuLink to="/perfil/editar">Editar perfil</ProfileMenuLink>
                            <ProfileMenuItem onClick={logout}>Sair</ProfileMenuItem>
                        </ProfileMenu>
                    )}
                </RightActions>
            </HeaderContent>
        </HeaderNav>
    );
}