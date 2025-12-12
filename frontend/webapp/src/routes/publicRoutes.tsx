import { Route, Navigate } from 'react-router-dom';
import { Login, Register, ForgotPassword, ResetPassword, OAuth2Callback, Home } from './routeComponents';
import { PUBLIC_ROUTES, OAUTH_ROUTES } from './routeConfig';
import { useAppSelector } from '@store/hooks';
import { DASHBOARD_PATH } from '@constants';

// Root path '/' redirect based on auth
const RootRedirect = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  const target = isAuthenticated ? DASHBOARD_PATH : PUBLIC_ROUTES.HOME;
  return <Navigate to={target} replace />;
};

// Home page: if authed, send to dashboard; else show landing Home
const HomeEntry = () => {
  const { isAuthenticated } = useAppSelector((state) => state.auth);
  if (isAuthenticated) return <Navigate to={DASHBOARD_PATH} replace />;
  return <Home />;
};

export const publicRoutes = (
  <>
    {/* Redirect root based on auth */}
    <Route path="/" element={<RootRedirect />} />

    {/* OAuth2 Callback - No Layout Required */}
    <Route path={OAUTH_ROUTES.CALLBACK} element={<OAuth2Callback />} />
    <Route path={OAUTH_ROUTES.CALLBACK_ALT} element={<OAuth2Callback />} />

    {/* Public Routes */}
    <Route path={PUBLIC_ROUTES.LOGIN} element={<Login />} />
    <Route path={PUBLIC_ROUTES.REGISTER} element={<Register />} />
    <Route path={PUBLIC_ROUTES.FORGOT_PASSWORD} element={<ForgotPassword />} />
    <Route path={PUBLIC_ROUTES.RESET_PASSWORD} element={<ResetPassword />} />
    <Route path={PUBLIC_ROUTES.HOME} element={<HomeEntry />} />
  </>
);
