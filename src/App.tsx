import { RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { routes } from "./routes";
import { AuthProvider } from "./contexts/auth";
import { ToastContainer } from 'react-toastify';
import { CustomThemeProvider, useTheme } from "./contexts/theme";
import { useAuthContext } from "./contexts/auth";

const ThemeBootstrap = () => {
    const { me } = useAuthContext();
    const { setThemeMode } = useTheme();

    useEffect(() => {
        const userTheme = me?.config?.theme;

        if (userTheme === 'dark' || userTheme === 'light') {
            setThemeMode(userTheme);
            return;
        }

        if (userTheme === 'system') {
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            setThemeMode(prefersDark ? 'dark' : 'light');
        }
    }, [me, setThemeMode]);

    return null;
};


export function App() {
    return (
        <CustomThemeProvider>
            <AuthProvider>
                <ThemeBootstrap />
                <ToastContainer /> 
                <RouterProvider router={routes} />
            </AuthProvider>
        </CustomThemeProvider>
    );
};