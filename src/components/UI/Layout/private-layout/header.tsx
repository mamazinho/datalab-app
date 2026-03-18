import { useLocation } from "react-router-dom";
import { useAuthContext } from "../../../../contexts/auth";
import favicon from '../../../../assets/favicon.png';
import { BrandImage, BrandLink, BrandText, HeaderContent, HeaderNav, LogoutButton, Menu, MenuItem } from "./layout.style";

export const Header = () => {

    const { logout } = useAuthContext();
    const location = useLocation();

    const menuPages = [
        { label: 'Home', href: '/' },
        { label: 'Chats', href: '/chats' }
    ];

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
                <LogoutButton 
                    title="Logout"
                    onClick={logout}
                >
                    <svg 
                        width="24" 
                        height="24" 
                        viewBox="0 0 24 24" 
                        fill="none" 
                        stroke="currentColor" 
                        strokeWidth="2" 
                        strokeLinecap="round" 
                        strokeLinejoin="round"
                    >
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                        <polyline points="16 17 21 12 16 7"></polyline>
                        <line x1="21" y1="12" x2="9" y2="12"></line>
                    </svg>
                </LogoutButton>
            </HeaderContent>
        </HeaderNav>
    );
}