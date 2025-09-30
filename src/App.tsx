import React from 'react';
import { useRoutes, BrowserRouter } from "react-router-dom";
import { routes } from "./routes";
import { GlobalStyle } from './styles/global-style';


function AppRoutes() {
    return useRoutes(routes);
}

const App: React.FC = () => {
    return (
        <BrowserRouter>
            <GlobalStyle />
            <AppRoutes />
        </BrowserRouter>
    );
};

export default App;