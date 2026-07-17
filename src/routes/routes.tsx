import { createBrowserRouter, Navigate } from "react-router-dom";
import { ChatMessages } from "../pages/Chats/Messages";
import { Chats } from "../pages/Chats";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { ForgotPassword } from "../pages/ForgotPassword";
import { ChangePassword } from "../pages/ChangePassword";
import { GoogleCallback } from "../pages/AuthCallback";
import { EditProfile } from "../pages/EditProfile";
import { Onboarding } from "../pages/Onboarding";
import { CompanyMembers } from "../pages/CompanyMembers";
import { IaLayout } from "../pages/Ia";
import { Agents } from "../pages/Ia/Agents";
import { PrivateRoutes, PublicRoutes, CompanyRoutes, OnboardingRoute, PermissionRoute, IaRoute, AgentsRoute, IaIndexRedirect, RedirectLegacyChatMessages } from "./wrappers";

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
            {
                path: "/auth/google/callback",
                element: <GoogleCallback />,
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
    // Protected routes
    {
        element: <PrivateRoutes />,
        children: [
            // Rotas que exigem empresa selecionada
            {
                element: <CompanyRoutes />,
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
                    // Gerenciamento — exige permissão na tag "company" (owners sempre passam)
                    {
                        element: <PermissionRoute tag="company" />,
                        children: [
                            {
                                path: "/gerenciamento/membros",
                                element: <CompanyMembers />,
                            },
                        ],
                    },
                ],
            },
        ],
    }
]);
