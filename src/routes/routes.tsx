import { createBrowserRouter } from "react-router-dom";
import { ChatMessages } from "../pages/Chat-Messages";
import { ListChats } from "../pages/List-Chats";
import { Home } from "../pages/Home";
import { authProtect } from "../services/auth";

export const routes = createBrowserRouter([
    // Public routes
    {
        path: "/login",
        element: <Home />,
    },
    // Protected routes
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
    },
    {
        path: "/blocked",
        element: <Home />,
        loader: () => {
            authProtect();
        }
    }
]);