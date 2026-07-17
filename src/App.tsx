import { RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { routes } from "./routes";
import { AuthProvider } from "./contexts/auth";
import { ServerErrorComponent } from "./components/Feedback/ErrorBoundaries/server-error";
import { ToastContainer } from 'react-toastify';
import { CustomThemeProvider, useTheme } from "./contexts/theme";
import { useAuthContext } from "./contexts/auth";
import { ChatsProvider } from "./contexts/chats";
import { CompanyProvider } from "./contexts/company";
import type { ReactNode } from "react";

const ThemeBootstrap = () => {
    const { me } = useAuthContext();
    const { setThemeMode } = useTheme();

    useEffect(() => {
        const userTheme = String(me?.config?.theme || '').trim().toLowerCase();

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

// Wrapper interno que lê o me do AuthContext e injeta as companies no CompanyProvider
const CompanyBootstrap = ({ children }: { children: ReactNode }) => {
    const { me } = useAuthContext();
    const companies = me?.companies ?? [];
    return <CompanyProvider companies={companies}>{children}</CompanyProvider>;
};


export function App() {
    return (
        <CustomThemeProvider>
            <AuthProvider>
                <CompanyBootstrap>
                    <ChatsProvider>
                        <ThemeBootstrap />
                        <ToastContainer />
                        {/* Boundary global: erro de render fora dos AsyncResource não vira tela branca */}
                        <ErrorBoundary FallbackComponent={ServerErrorComponent}>
                            <RouterProvider router={routes} />
                        </ErrorBoundary>
                    </ChatsProvider>
                </CompanyBootstrap>
            </AuthProvider>
        </CustomThemeProvider>
    );
};