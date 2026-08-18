import { RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routes } from "./routes";
import { AuthProvider } from "./contexts/auth";
import { ServerErrorComponent } from "./components/Feedback/ErrorBoundaries/server-error";
import { ToastContainer } from 'react-toastify';
import { CustomThemeProvider, useTheme } from "./contexts/theme";
import { useMe } from "./hooks/use-me";
import { CompanyProvider } from "./contexts/company";
import { shouldRetryQuery, QUERY_RETRY_DELAY_MS } from "./utils/query-retry";
import type { ReactNode } from "react";

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            retry: shouldRetryQuery,
            retryDelay: QUERY_RETRY_DELAY_MS,
            staleTime: 30_000,
        },
    },
});

const ThemeBootstrap = () => {
    const { data: me } = useMe();
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
    const { data: me } = useMe();
    const companies = me?.companies ?? [];
    return <CompanyProvider companies={companies}>{children}</CompanyProvider>;
};


export function App() {
    return (
        <QueryClientProvider client={queryClient}>
            <CustomThemeProvider>
                <AuthProvider>
                    <CompanyBootstrap>
                        <ThemeBootstrap />
                        <ToastContainer />
                        {/* Boundary global: erro de render fora dos QueryBoundary não vira tela branca */}
                        <ErrorBoundary FallbackComponent={ServerErrorComponent}>
                            <RouterProvider router={routes} />
                        </ErrorBoundary>
                    </CompanyBootstrap>
                </AuthProvider>
            </CustomThemeProvider>
        </QueryClientProvider>
    );
};