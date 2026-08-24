import { Navigate, Outlet, useLocation, useParams } from "react-router-dom";
import { useAuthContext } from "../contexts/auth";
import { useCompanyContext } from "../contexts/company";
import { PrivateLayout } from "../components/UI/Layout/private-layout/layout";
import { LoadingPiece } from "../components/Feedback/Loadings/loading";
import { AuthGate } from "./auth-gate";

/**
 * Negar acesso só depois que /memberships/current respondeu: as permissões
 * chegam vazias no primeiro render e um membro que abre a rota direto seria
 * redirecionado para "/" antes de o backend dizer o que ele pode. Quem já está
 * liberado (owner, pela role embutida) entra na hora, sem passar pelo spinner.
 */
const guard = (allowed: boolean, isLoading: boolean) => {
    if (allowed) return <Outlet />;
    if (isLoading) return <LoadingPiece />;
    return <Navigate to="/" replace />;
};


// Com o /me já resolvido pelo AuthGate, decide empresa ANTES de montar o layout:
// sem empresa vai direto pro onboarding, sem piscar o header das rotas privadas.
const PrivateContent = () => {
    const { currentCompany } = useCompanyContext();

    if (currentCompany === null) return <Navigate to="/onboarding" replace />;

    return <PrivateLayout><Outlet /></PrivateLayout>;
};

export const PrivateRoutes = () => {
    const { accessToken } = useAuthContext();
    const location = useLocation();

    if (!accessToken) return <Navigate to="/login" state={{ from: location }} replace />;

    // AuthGate resolve o /me antes de renderizar o layout: enquanto carrega mostra
    // spinner, em erro de servidor mostra tela de erro (nunca cai em /onboarding).
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

// Decide o destino do onboarding com o /me já resolvido pelo AuthGate.
const OnboardingContent = () => {
    const { currentCompany } = useCompanyContext();

    return currentCompany === null
        ? <Outlet />
        : <Navigate to="/" replace />;
};

// Onboarding: exige token mas NÃO usa PrivateLayout (sem header/footer).
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

// Guard por tag de permissão. Owners sempre passam.
// Membros sem a permissão correspondente são redirecionados para "/".
interface IPermissionRouteProps {
    tag: string;
}

export const PermissionRoute = ({ tag }: IPermissionRouteProps) => {
    const { hasPermissionByTag, isMembershipLoading } = useCompanyContext();

    return guard(hasPermissionByTag(tag), isMembershipLoading);
};

// Seção IA: acessível com permissão de chat OU alguma permissão de agents
export const IaRoute = () => {
    const { hasPermissionByTag, hasAnyAgentsPermission, isMembershipLoading } = useCompanyContext();

    return guard(hasPermissionByTag('chat') || hasAnyAgentsPermission, isMembershipLoading);
};

// Aba de agentes: exige alguma permissão de rota de agents (owners sempre passam)
export const AgentsRoute = () => {
    const { hasAnyAgentsPermission, isMembershipLoading } = useCompanyContext();

    return guard(hasAnyAgentsPermission, isMembershipLoading);
};

// Aba de empresa: exige permissão de editar OU deletar company (owners sempre passam)
export const CompanyManagementRoute = () => {
    const { hasAnyCompanyPermission, isMembershipLoading } = useCompanyContext();

    return guard(hasAnyCompanyPermission, isMembershipLoading);
};

// Index de /ia: cai na primeira aba que o usuário pode ver
export const IaIndexRedirect = () => {
    const { hasPermissionByTag, isMembershipLoading } = useCompanyContext();

    // Escolher a aba antes das permissões chegarem manda todo membro para agentes.
    if (isMembershipLoading) return <LoadingPiece />;

    return <Navigate to={hasPermissionByTag('chat') ? '/ia/conversas' : '/ia/agentes'} replace />;
};

// <Navigate> não interpola params — redirect do deep-link legado de mensagens
export const RedirectLegacyChatMessages = () => {
    const { chatId } = useParams<{ chatId: string }>();

    return <Navigate to={`/ia/conversas/${chatId}/mensagens`} replace />;
};
