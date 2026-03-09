import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/auth";
import { PrivateLayout } from "../components/UI/Layout/private-layout/layout";
import { useEffect } from 'react';


export const PrivateRoutes = () => {
    const { accessToken, getMe } = useAuthContext();
    const location = useLocation();
    
    useEffect(() => {
        const fetchData = async () => await getMe();
        fetchData();
    }, [getMe]);

    console.log("PrivateRoutes accessToken:", accessToken);

    return accessToken 
        ? <PrivateLayout><Outlet /></PrivateLayout>
        : <Navigate to="/login" state={{ from: location }} replace />;
};

export const PublicRoutes = () => {
    const { accessToken } = useAuthContext();
    const location = useLocation();
    console.log("PublicRoutes accessToken:", accessToken, location);

    const from = location.state?.from?.pathname || "/";

    return accessToken 
        ? <Navigate to={from} replace />
        : <Outlet /> 
}