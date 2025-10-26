import { Navigate, Outlet } from 'react-router-dom';
import { useAppSelector } from '@store/hooks';
import { HOME_PATH } from '@constants';

export const PublicRoute = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  if (isAuthenticated) {
    return <Navigate to={HOME_PATH} replace />;
  }

  return <Outlet />;
};
