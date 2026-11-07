import { RouterProvider } from "react-router-dom";
import { useEffect } from "react";
import { ErrorBoundary } from "react-error-boundary";
import * as logfire from "@pydantic/logfire-browser";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { routes } from "./routes";
import { AuthProvider } from "./contexts/auth";
import { ServerErrorComponent } from "./components/Feedback/ErrorBoundaries/server-error";
import { ToastContainer } from 'react-toastify';
import { CustomThemeProvider, useTheme } from "./contexts/theme";
import { useMe } from "./hooks/use-me";
import { CompanyProvider } from "./contexts/company";
import { ConfirmProvider } from "./contexts/confirm";
import { shouldRetryQuery, QUERY_RETRY_DELAY_MS } from "./utils/query-retry";
import type { ReactNode } from "react";

const apiUrl = import.meta.env.VITE_DATALAB_API_URL;
const apiUrls = [new RegExp(`^${apiUrl}`)];

logfire.configure({
    traceUrl: `${apiUrl}/telemetry/v1/traces`,
    serviceName: "datalab-app",
    environment: import.meta.env.MODE,
    autoInstrumentations: {
        "@opentelemetry/instrumentation-xml-http-request": { propagateTraceHeaderCorsUrls: apiUrls },
        "@opentelemetry/instrumentation-fetch": { propagateTraceHeaderCorsUrls: apiUrls },
        "@opentelemetry/instrumentation-user-interaction": { enabled: false },
    },
    rum: { webVitals: true },
});

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
    const { setThemePreference } = useTheme();
    const userTheme = me?.config?.theme;

    useEffect(() => {
        if (userTheme) setThemePreference(userTheme);
    }, [userTheme, setThemePreference]);

    return null;
};

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
                        {/* Catches render errors outside any QueryBoundary, so they never blank the app */}
                        <ErrorBoundary
                            FallbackComponent={ServerErrorComponent}
                            onError={(error, info) => logfire.reportError("React error boundary caught", error, { component_stack: info.componentStack })}
                        >
                            <ConfirmProvider>
                                <RouterProvider router={routes} />
                            </ConfirmProvider>
                        </ErrorBoundary>
                    </CompanyBootstrap>
                </AuthProvider>
            </CustomThemeProvider>
        </QueryClientProvider>
    );
};