import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useAuthContext } from "../contexts/auth";
import { useCompanyContext } from "../contexts/company";
import { PrivateLayout } from "../components/UI/Layout/private-layout/layout";
import { LoadingPiece } from "../components/Feedback/Loadings/loading";
import { CHAT_ROUTE_PERMISSIONS, type IRoutePermissionRef } from "../utils/route-permissions";
import { AuthGate } from "./auth-gate";

// Denies only after /memberships/current answers: permissions are empty on the first render
const guard = (allowed: boolean, isLoading: boolean) => {
    if (allowed) return <Outlet />;
    if (isLoading) return <LoadingPiece />;
    return <Navigate to="/" replace />;
};

// Picks the company before mounting the layout, so the header never flashes for users without one
const PrivateContent = () => {
    const { currentCompany } = useCompanyContext();

    if (currentCompany === null) return <Navigate to="/onboarding" replace />;

    return <PrivateLayout><Outlet /></PrivateLayout>;
};

export const PrivateRoutes = () => {
    const { accessToken } = useAuthContext();
    const location = useLocation();

    if (!accessToken) return <Navigate to="/login" state={{ from: location }} replace />;

    return (
        <AuthGate>
            <PrivateContent />
        </AuthGate>
    );
};

export const PublicRoutes = () => {
    const { accessToken } = useAuthContext();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    return accessToken
        ? <Navigate to={from} replace />
        : <Outlet />;
};

const OnboardingContent = () => {
    const { currentCompany } = useCompanyContext();

    return currentCompany === null
        ? <Outlet />
        : <Navigate to="/" replace />;
};

export const OnboardingRoute = () => {
    const { accessToken } = useAuthContext();
    const location = useLocation();

    if (!accessToken) return <Navigate to="/login" state={{ from: location }} replace />;

    return (
        <AuthGate>
            <OnboardingContent />
        </AuthGate>
    );
};

export const PermissionRoute = ({ tag }: { tag: string | string[] }) => {
    const { hasPermissionByTag, isMembershipLoading } = useCompanyContext();

    return guard(hasPermissionByTag(tag), isMembershipLoading);
};

export const RoutePermissionRoute = ({ permission }: { permission: IRoutePermissionRef | IRoutePermissionRef[] }) => {
    const { hasPermissionByRoute, isMembershipLoading } = useCompanyContext();

    return guard(hasPermissionByRoute(permission), isMembershipLoading);
};

export const IaIndexRedirect = () => {
    const { hasPermissionByRoute, hasPermissionByTag, isMembershipLoading } = useCompanyContext();

    // Picking a tab before permissions arrive would send every member to agents
    if (isMembershipLoading) return <LoadingPiece />;
    if (hasPermissionByRoute(CHAT_ROUTE_PERMISSIONS.list)) return <Navigate to="/ia/conversas" replace />;
    if (hasPermissionByTag('agents')) return <Navigate to="/ia/agentes" replace />;

    return <Navigate to="/ia/consumo" replace />;
};

// <Navigate> does not interpolate params, so the legacy messages link needs its own component
export const RedirectLegacyChatMessages = () => {
    const { chatId } = useParams<{ chatId: string }>();

    return <Navigate to={`/ia/conversas/${chatId}/mensagens`} replace />;
};
