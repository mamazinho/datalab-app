import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useAuthContext } from "../contexts/auth";
import { useCompanyContext } from "../contexts/company";
import { PrivateLayout } from "../components/UI/Layout/private-layout/layout";
import { LoadingPiece } from "../components/Feedback/Loadings/loading";
import type { IRoutePermissionRef } from "../utils/route-permissions";
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

interface IPermissionRouteProps {
    tag: string;
}

export const PermissionRoute = ({ tag }: IPermissionRouteProps) => {
    const { hasPermissionByTag, isMembershipLoading } = useCompanyContext();

    return guard(hasPermissionByTag(tag), isMembershipLoading);
};

export const IaRoute = () => {
    const { hasPermissionByTag, hasAnyAgentsPermission, isMembershipLoading } = useCompanyContext();

    return guard(hasPermissionByTag('chat') || hasAnyAgentsPermission, isMembershipLoading);
};

export const AgentsRoute = () => {
    const { hasAnyAgentsPermission, isMembershipLoading } = useCompanyContext();

    return guard(hasAnyAgentsPermission, isMembershipLoading);
};

export const RoutePermissionRoute = ({ permission }: { permission: IRoutePermissionRef }) => {
    const { hasPermissionByRoute, isMembershipLoading } = useCompanyContext();

    return guard(hasPermissionByRoute(permission), isMembershipLoading);
};

export const CompanyManagementRoute = () => {
    const { hasAnyCompanyPermission, isMembershipLoading } = useCompanyContext();

    return guard(hasAnyCompanyPermission, isMembershipLoading);
};

export const IaIndexRedirect = () => {
    const { hasPermissionByTag, isMembershipLoading } = useCompanyContext();

    // Picking a tab before permissions arrive would send every member to agents
    if (isMembershipLoading) return <LoadingPiece />;

    return <Navigate to={hasPermissionByTag('chat') ? '/ia/conversas' : '/ia/agentes'} replace />;
};

// <Navigate> does not interpolate params, so the legacy messages link needs its own component
export const RedirectLegacyChatMessages = () => {
    const { chatId } = useParams<{ chatId: string }>();

    return <Navigate to={`/ia/conversas/${chatId}/mensagens`} replace />;
};
