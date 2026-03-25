import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import LoadingState from './feedback/LoadingState.jsx';

const ProtectedRoute = () => {
  const { token, initializing } = useAuth();
  const location = useLocation();

  if (initializing) {
    return <LoadingState message="Loading workspace" />;
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
