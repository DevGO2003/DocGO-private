import { Route } from 'react-router-dom';
import { Login, Register, OAuth2Callback } from './routeComponents';
import { PUBLIC_ROUTES, OAUTH_ROUTES } from './routeConfig';

export const publicRoutes = (
  <>
    {/* OAuth2 Callback - No Layout Required */}
    <Route path={OAUTH_ROUTES.CALLBACK} element={<OAuth2Callback />} />
    <Route path={OAUTH_ROUTES.CALLBACK_ALT} element={<OAuth2Callback />} />

    {/* Public Routes */}
    <Route path={PUBLIC_ROUTES.LOGIN} element={<Login />} />
    <Route path={PUBLIC_ROUTES.REGISTER} element={<Register />} />
  </>
);
