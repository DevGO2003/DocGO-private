import { Route } from 'react-router-dom';
import { Suspense } from 'react';
import { Outlet } from 'react-router-dom';
import { ProtectedRoute } from '@shared/components';
import { MainLayout, ControlMainLayout } from '@shared/layouts';
import { 
  Dashboard,
  RepositoryList,
  RepositoryDetail,
  RepositoryFileDetail,
  RepositoryFilesList,
  OrganizationList,
  OrganizationDetail,
  OrganizationWorkspace,
  OrganizationMembers,
  Profile,
  Settings,
  Users,
  UploadPage,
} from './routeComponents';
import { PROTECTED_ROUTES } from './routeConfig';

export const protectedRoutes = (
  <Route
    element={
      <ProtectedRoute>
        <MainLayout>
          <Suspense fallback={<ControlMainLayout loading loadingText="Đang tải trang..." />}> 
            <Outlet />
          </Suspense>
        </MainLayout>
      </ProtectedRoute>
    }
  >
    {/* Dashboard */}
    <Route path={PROTECTED_ROUTES.DASHBOARD} element={<Dashboard />} />

    {/* Repository Routes */}
    <Route path={PROTECTED_ROUTES.REPOSITORIES} element={<RepositoryList />} />
    <Route path={PROTECTED_ROUTES.REPOSITORY_FILES_LIST} element={<RepositoryFilesList />} />
    <Route path={PROTECTED_ROUTES.REPOSITORY_DETAIL} element={<RepositoryDetail />} />
    <Route path={PROTECTED_ROUTES.REPOSITORY_FILE_DETAIL} element={<RepositoryFileDetail />} />

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
    <Route path={PROTECTED_ROUTES.USERS} element={<Users />} />
  </Route>
);
