import { Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '@/auth/AuthContext';

export default function ProtectedRoute() {
    const { isAuthorized } = useAuth();
    const location = useLocation();

    if (!isAuthorized) {
        return <Navigate to="/login" replace state={{ from: location }} />;
    }

    return <Outlet />;
}