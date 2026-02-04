import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../../../contexts/auth";
import favicon from '../../../../assets/favicon.png';

export const Header = () => {

    const { logout } = useAuthContext();
    const location = useLocation();

    const menuPages = [
        { label: 'Home', href: '/' },
        { label: 'Chats', href: '/chats' }
    ];

    return (
        <nav className="bg-white shadow dark:bg-gray-800 rounded-2xl">
            <div className="container flex items-center justify-between mx-auto px-6 py-3">
                <a href="/" className="flex items-center gap-2">
                    <img className="w-auto h-8" src={favicon} alt="Logo da DataLab" />
                    <span className="text-xl font-bold text-gray-800 dark:text-white">DataLab</span>
                </a>
                <div className="flex items-center justify-center space-x-6 text-gray-600 capitalize dark:text-gray-300">
                    {menuPages.map(({ label, href }) => {
                        const isActive = location.pathname === href;
                        return (
                            <Link 
                                key={href}
                                to={href} 
                                className={`border-b-2 transition-colors duration-300 transform mx-1.5 sm:mx-6 hover:no-underline! ${
                                    isActive 
                                    ? "border-orange-600 text-gray-800 dark:text-gray-200" 
                                    : "border-transparent hover:text-gray-800 dark:hover:text-gray-200 hover:border-orange-600"
                                }`}
                            >
                                {label}
                            </Link>
                        );
                    })}
                </div>
                <button 
                    className="cursor-pointer p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700"
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
                </button>
            </div>
        </nav>
    );
}