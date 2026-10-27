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
import { McpServers } from "../pages/Ia/McpServers";
import { Usage } from "../pages/Ia/Usage";
import { PrivateRoutes, PublicRoutes, OnboardingRoute, PermissionRoute, IaRoute, AgentsRoute, RoutePermissionRoute, CompanyManagementRoute, IaIndexRedirect, RedirectLegacyChatMessages } from "./wrappers";
import { COMPANY_PATH, INTEGRATION_CALLBACK_PATH, INTEGRATIONS_PATH, MEMBERS_PATH } from "./paths";
import { CHAT_ROUTE_PERMISSIONS, MCP_SERVER_ROUTE_PERMISSIONS } from "../utils/route-permissions";

export const routes = createBrowserRouter([
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
                path: "/auth/:provider/callback",
                element: <SocialCallback />,
            },
        ],
    },
    {
        element: <OnboardingRoute />,
        children: [
            {
                path: "/onboarding",
                element: <Onboarding />,
            },
        ],
    },
    {
        element: <PrivateRoutes />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
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
                            {
                                element: <RoutePermissionRoute permission={MCP_SERVER_ROUTE_PERMISSIONS.list} />,
                                children: [
                                    {
                                        path: "mcp",
                                        element: <McpServers />,
                                    },
                                ],
                            },
                            {
                                element: <RoutePermissionRoute permission={CHAT_ROUTE_PERMISSIONS.usageReport} />,
                                children: [
                                    {
                                        path: "consumo",
                                        element: <Usage />,
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
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
            {
                element: <ManagementLayout />,
                children: [
                    // Connecting Google or Meta belongs to each person's account, so there is no permission gate
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
    // Runs inside the consent popup, so it stays out of the session wrappers. The backend dictates this path.
    {
        path: INTEGRATION_CALLBACK_PATH,
        element: <IntegrationCallback />,
    },
    {
        path: "*",
        element: <NotFound />,
    }
]);
