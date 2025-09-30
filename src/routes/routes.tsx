import type { RouteObject } from "react-router-dom";
import { ChatMessages } from "../pages/Chat-Messages";
import { ListChats } from "../pages/List-Chats";
import { Home } from "../pages/Home";

export const routes: RouteObject[] = [
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
];