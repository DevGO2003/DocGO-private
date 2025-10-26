import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@store/hooks';
import { LOGIN_PATH } from '@constants';

export const PrivateRoute = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to={LOGIN_PATH} replace />;
  }

  return <Outlet />;
};
