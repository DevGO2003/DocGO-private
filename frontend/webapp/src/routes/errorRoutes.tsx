import { Route, Navigate } from 'react-router-dom';
import { NotFound, Unauthorized } from './routeComponents';
import { ERROR_ROUTES, PROTECTED_ROUTES } from './routeConfig';

export const errorRoutes = (
  <>
    {/* Error Routes */}
    <Route path={ERROR_ROUTES.UNAUTHORIZED} element={<Unauthorized />} />
    <Route path={ERROR_ROUTES.NOT_FOUND} element={<NotFound />} />
    
    {/* Redirect root to dashboard */}
    <Route path="/" element={<Navigate to={PROTECTED_ROUTES.DASHBOARD} replace />} />
    
    {/* 404 catch-all */}
    <Route path="*" element={<NotFound />} />
  </>
);
