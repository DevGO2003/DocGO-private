import { Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@store/hooks';
import { LOGIN_PATH } from '@constants';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  requiredRoles?: string[];
}

export const ProtectedRoute = ({ 
  children, 
  requireAuth = true,
  requiredRoles = []
}: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, user } = useAppSelector((state) => state.auth);

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    // Redirect to login and save the attempted location
    return <Navigate to={LOGIN_PATH} state={{ from: location }} replace />;
  }

  // Check role authorization
  if (requiredRoles.length > 0 && user) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    if (!hasRequiredRole) {
      // Redirect to unauthorized page or dashboard
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return <>{children}</>;
};
