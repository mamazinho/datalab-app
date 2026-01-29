import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { GlobalStyle } from './styles/global-style';
import { AuthProvider } from "./contexts/auth";


export function App() {
    return (
        <AuthProvider>
            <GlobalStyle />
            <RouterProvider router={routes} />
        </AuthProvider>
    );
};