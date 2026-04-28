import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/auth";
import { useCompanyContext } from "../contexts/company";
import { PrivateLayout } from "../components/UI/Layout/private-layout/layout";


export const PrivateRoutes = () => {
    const { accessToken } = useAuthContext();
    const location = useLocation();

    return accessToken
        ? <PrivateLayout><Outlet /></PrivateLayout>
        : <Navigate to="/login" state={{ from: location }} replace />;
};

export const PublicRoutes = () => {
    const { accessToken } = useAuthContext();
    const location = useLocation();

    const from = location.state?.from?.pathname || "/";

    return accessToken
        ? <Navigate to={from} replace />
        : <Outlet />;
};

// Rota de onboarding: só acessível enquanto o usuário não tiver nenhuma empresa.
// Uma vez com empresa, redireciona para "/" e nunca mais aparece.
export const OnboardingRoute = () => {
    const { isAuthLoading } = useAuthContext();
    const { currentCompany } = useCompanyContext();

    if (isAuthLoading) return null;

    return currentCompany === null
        ? <Outlet />
        : <Navigate to="/" replace />;
};

// Rotas que exigem empresa selecionada. Aguarda o carregamento do auth
// antes de decidir redirecionar, eliminando o flash para /onboarding.
export const CompanyRoutes = () => {
    const { isAuthLoading } = useAuthContext();
    const { currentCompany } = useCompanyContext();

    if (isAuthLoading) return null;

    return currentCompany !== null
        ? <Outlet />
        : <Navigate to="/onboarding" replace />;
};

// Guard por tag de permissão. Owners sempre passam.
// Membros sem a permissão correspondente são redirecionados para "/".
interface IPermissionRouteProps {
    tag: string;
}

export const PermissionRoute = ({ tag }: IPermissionRouteProps) => {
    const { isAuthLoading } = useAuthContext();
    const { hasPermissionByTag } = useCompanyContext();

    if (isAuthLoading) return null;

    return hasPermissionByTag(tag)
        ? <Outlet />
        : <Navigate to="/" replace />;
};
