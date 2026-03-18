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
import { PrivateRoutes, PublicRoutes } from "./wrappers";


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
    // Protected routes
    {
        element: <PrivateRoutes />,
        children: [
            {
                path: "/",
                element: <Home />,
            },
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
            {
                path: "/perfil/editar",
                element: <EditProfile />,
            }
        ]
    }
]);