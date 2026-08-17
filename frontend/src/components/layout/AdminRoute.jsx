import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const AdminRoute = ({ children }) => {
    const { isAuthenticated, isAdmin } = useAuth();
    const location = useLocation();

    if (!isAuthenticated) {
        return (
            <Navigate
                to='/admin/login'
                state={{ from: location }}
                replace
            />
        );
    }

    if (!isAdmin) {
        return <Navigate to='/' replace />;
    }

    return children;
};

export default AdminRoute;
