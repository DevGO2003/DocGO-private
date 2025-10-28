import { Route } from 'react-router-dom';
import { Outlet } from 'react-router-dom';
import { ProtectedRoute } from '@shared/components';
import { MainLayout } from '@shared/layouts';
import {
  Dashboard,
  RepositoryList,
  RepositoryDetail,
  OrganizationList,
  OrganizationDetail,
  OrganizationWorkspace,
  OrganizationMembers,
  Profile,
  Settings,
  UploadPage,
} from './routeComponents';
import { PROTECTED_ROUTES } from './routeConfig';

export const protectedRoutes = (
  <Route
    element={
      <ProtectedRoute>
        <MainLayout>
          <Outlet />
        </MainLayout>
      </ProtectedRoute>
    }
  >
    {/* Dashboard */}
    <Route path={PROTECTED_ROUTES.DASHBOARD} element={<Dashboard />} />

    {/* Repository Routes */}
    <Route path={PROTECTED_ROUTES.REPOSITORIES} element={<RepositoryList />} />
    <Route path={PROTECTED_ROUTES.REPOSITORY_DETAIL} element={<RepositoryDetail />} />

    {/* Upload Routes */}
    <Route path={PROTECTED_ROUTES.UPLOAD} element={<UploadPage />} />

    {/* Organization Routes */}
    <Route path={PROTECTED_ROUTES.ORGANIZATIONS} element={<OrganizationList />} />
    <Route path={PROTECTED_ROUTES.ORGANIZATION_DETAIL} element={<OrganizationDetail />} />
    <Route path={PROTECTED_ROUTES.ORGANIZATION_WORKSPACE} element={<OrganizationWorkspace />} />
    <Route path={PROTECTED_ROUTES.ORGANIZATION_MEMBERS} element={<OrganizationMembers />} />

    {/* User Routes */}
    <Route path={PROTECTED_ROUTES.PROFILE} element={<Profile />} />
    <Route path={PROTECTED_ROUTES.SETTINGS} element={<Settings />} />
  </Route>
);
