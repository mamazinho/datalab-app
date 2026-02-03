import { createBrowserRouter } from "react-router-dom";
import { ChatMessages } from "../pages/Chats/Messages";
import { ListChats } from "../pages/Chats";
import { Home } from "../pages/Home";
import { Login } from "../pages/Login";
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
                path: "/chats",
                children: [
                    {
                        index: true,
                        element: <ListChats />,
                    },
                    {
                        path: ":chatId/messages",
                        element: <ChatMessages />,
                    },
                ],
            }
        ]
    }
]);