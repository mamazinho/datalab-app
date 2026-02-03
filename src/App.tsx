import { RouterProvider } from "react-router-dom";
import { routes } from "./routes";
import { GlobalStyle } from './styles/global-style';
import { AuthProvider } from "./contexts/auth";
import { ToastContainer } from 'react-toastify';


export function App() {
    return (
        <AuthProvider>
            <GlobalStyle />
            <ToastContainer /> 
            <RouterProvider router={routes} />
        </AuthProvider>
    );
};