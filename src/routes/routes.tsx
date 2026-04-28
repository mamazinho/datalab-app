import { createBrowserRouter } from "react-router-dom";
import { ChatMessages } from "../pages/Chats/Messages";
import { ListChats } from "../pages/Chats";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
import { Register } from "../pages/Register";
import { ForgotPassword } from "../pages/ForgotPassword";
import { ChangePassword } from "../pages/ChangePassword";
import { GoogleCallback } from "../pages/AuthCallback/google-callback";
import { EditProfile } from "../pages/EditProfile";
import { Onboarding } from "../pages/Onboarding";
import { CompanyMembers } from "../pages/CompanyMembers";
import { PrivateRoutes, PublicRoutes, CompanyRoutes, OnboardingRoute, PermissionRoute } from "./wrappers";


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
                    // Rotas de chat — exigem permissão na tag "chat"
                    {
                        element: <PermissionRoute tag="chat" />,
                        children: [
                            {
                                path: "/conversas",
                                children: [
                                    {
                                        index: true,
                                        element: <ListChats />,
                                    },
                                    {
                                        path: ":chatId/mensagens",
                                        element: <ChatMessages />,
                                    },
                                ],
                            },
                        ],
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