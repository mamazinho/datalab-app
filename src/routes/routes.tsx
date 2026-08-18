import { createBrowserRouter, Navigate } from "react-router-dom";
import { ChatMessages } from "../pages/Chats/Messages";
import { Chats } from "../pages/Chats";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { ForgotPassword } from "../pages/ForgotPassword";
import { ChangePassword } from "../pages/ChangePassword";
import { IntegrationCallback, SocialCallback } from "../pages/AuthCallback";
import { EditProfile } from "../pages/EditProfile";
import { Onboarding } from "../pages/Onboarding";
import { CompanyMembers } from "../pages/CompanyMembers";
import { CompanyManagement } from "../pages/CompanyManagement";
import { ManagementLayout } from "../pages/Management";
import { Integrations } from "../pages/Integrations";
import { NotFound } from "../pages/NotFound";
import { IaLayout } from "../pages/Ia";
import { Agents } from "../pages/Ia/Agents";
import { PrivateRoutes, PublicRoutes, OnboardingRoute, PermissionRoute, IaRoute, AgentsRoute, CompanyManagementRoute, IaIndexRedirect, RedirectLegacyChatMessages } from "./wrappers";
import { COMPANY_PATH, INTEGRATION_CALLBACK_PATH, INTEGRATIONS_PATH, MEMBERS_PATH } from "./paths";

export const routes = createBrowserRouter([
    // Public routes
    {
        element: <PublicRoutes />,
        children: [
            {
                path: "/login",
                element: <Login />,
            },
            {
                path: "/cadastro",
                element: <Register />,
            },
            {
                path: "/esqueci-senha",
                element: <ForgotPassword />,
            },
            {
                path: "/alterar-senha",
                element: <ChangePassword />,
            },
            // Retorno do login social — Google e Meta usam o mesmo formato
            {
                path: "/auth/:provider/callback",
                element: <SocialCallback />,
            },
        ],
    },
    // Onboarding: autenticado, mas sem layout (sem header/footer)
    {
        element: <OnboardingRoute />,
        children: [
            {
                path: "/onboarding",
                element: <Onboarding />,
            },
        ],
    },
    // Protected routes — PrivateRoutes já garante /me resolvido e empresa selecionada
    // (sem empresa vai pro onboarding antes de montar o layout).
    {
        element: <PrivateRoutes />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
            // Seção IA — abas de conversas (tag "chat") e agentes (permissões de agents)
            {
                element: <IaRoute />,
                children: [
                    {
                        path: "/ia",
                        element: <IaLayout />,
                        children: [
                            {
                                index: true,
                                element: <IaIndexRedirect />,
                            },
                            {
                                element: <PermissionRoute tag="chat" />,
                                children: [
                                    {
                                        path: "conversas",
                                        element: <Chats />,
                                    },
                                    {
                                        path: "conversas/:chatId/mensagens",
                                        element: <ChatMessages />,
                                    },
                                ],
                            },
                            {
                                element: <AgentsRoute />,
                                children: [
                                    {
                                        path: "agentes",
                                        element: <Agents />,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
            // Redirects dos paths antigos de chat
            {
                path: "/conversas",
                element: <Navigate to="/ia/conversas" replace />,
            },
            {
                path: "/conversas/:chatId/mensagens",
                element: <RedirectLegacyChatMessages />,
            },
            {
                path: "/perfil/editar",
                element: <EditProfile />,
            },
            // Gerenciamento — abas Membros | Empresa | Integrações sob um layout
            // comum. Cada aba tem seu próprio gate de permissão.
            {
                element: <ManagementLayout />,
                children: [
                    // Conectar Google/Meta é da conta de cada um: sem gate de permissão.
                    {
                        path: INTEGRATIONS_PATH,
                        element: <Integrations />,
                    },
                    {
                        element: <PermissionRoute tag="company" />,
                        children: [
                            {
                                path: MEMBERS_PATH,
                                element: <CompanyMembers />,
                            },
                        ],
                    },
                    {
                        element: <CompanyManagementRoute />,
                        children: [
                            {
                                path: COMPANY_PATH,
                                element: <CompanyManagement />,
                            },
                        ],
                    },
                ],
            },
        ],
    },
    // Retorno do consentimento de uma integração: roda dentro do popup, então
    // fica fora dos wrappers de sessão (o PublicRoutes mandaria o usuário
    // logado para "/" e o PrivateRoutes montaria o app inteiro à toa).
    // Path ditado pelo backend (CLIENT_URL/integrations/callback).
    {
        path: INTEGRATION_CALLBACK_PATH,
        element: <IntegrationCallback />,
    },
    {
        path: "*",
        element: <NotFound />,
    }
]);
