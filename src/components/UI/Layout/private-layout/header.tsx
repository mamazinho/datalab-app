import { Link, useLocation } from "react-router-dom";
import { useAuthContext } from "../../../../contexts/auth";

export const Header = () => {

    const { logout } = useAuthContext();
    const location = useLocation();

    const menuPages = [
        { label: 'Home', href: '/' },
        { label: 'Chats', href: '/chats' }
    ];

    return (
        <nav className="bg-white shadow dark:bg-gray-800 rounded-2xl">
            <div className="container flex items-center justify-between mx-auto">
                <Link to="/">
                    <span className="text-xl font-bold dark:text-white px-4">DataLab</span>
                </Link>
                <div className="container flex items-center justify-center p-6 mx-auto text-gray-600 capitalize dark:text-gray-300">
                    {menuPages.map(({ label, href }) => {
                        const isActive = location.pathname === href;
                        return (
                            <Link 
                                key={href}
                                to={href} 
                                className={`border-b-2 transition-colors duration-300 transform mx-1.5 sm:mx-6 ${
                                    isActive 
                                    ? "border-blue-500 text-gray-800 dark:text-gray-200" 
                                    : "border-transparent hover:text-gray-800 dark:hover:text-gray-200 hover:border-blue-500"
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