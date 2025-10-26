import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { store } from '@store';
import { ErrorBoundary, ProtectedRoute } from '@shared/components';
import { AuthLayout, DashboardLayout } from '@shared/layouts';
import { NotFound, Unauthorized, Settings } from '@pages';
import { Login, Register, OAuth2Callback } from '@features/auth/views/pages';
import { Dashboard } from '@features/dashboard/views/pages';
import { RepositoryList, RepositoryDetail } from '@features/repository/views/pages';
import { OrganizationList, OrganizationDetail, OrganizationWorkspace, OrganizationMembers, AcceptInvitation } from '@features/organization/views/pages';
import { Profile } from '@features/profile/views/pages';
import UploadPage from '@features/upload/views/UploadPage';
import {
  LOGIN_PATH,
  REGISTER_PATH,
  DASHBOARD_PATH,
  REPOSITORIES_PATH,
  REPOSITORY_DETAIL_PATH,
  ORGANIZATIONS_PATH,
  ORGANIZATION_DETAIL_PATH,
  ORGANIZATION_WORKSPACE_PATH,
  ORGANIZATION_MEMBERS_PATH,
  ACCEPT_INVITATION_PATH,
  PROFILE_PATH,
  SETTINGS_PATH,
  NOT_FOUND_PATH,
  UNAUTHORIZED_PATH,
} from '@constants';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

function App() {
  return (
    <ErrorBoundary>
      <Provider store={store}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <Routes>
              {/* OAuth2 Callback - No Layout Required */}
              <Route path="/auth/oauth2/callback" element={<OAuth2Callback />} />
              
              {/* Public Routes */}
              <Route element={<AuthLayout />}>
                <Route path={LOGIN_PATH} element={<Login />} />
                <Route path={REGISTER_PATH} element={<Register />} />
              </Route>

              {/* Public Invitation Route (no layout) */}
              <Route path={ACCEPT_INVITATION_PATH} element={<AcceptInvitation />} />

              {/* Protected Routes */}
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path={DASHBOARD_PATH} element={<Dashboard />} />
                
                {/* Repository Routes */}
                <Route path={REPOSITORIES_PATH} element={<RepositoryList />} />
                <Route path={REPOSITORY_DETAIL_PATH} element={<RepositoryDetail />} />
                
                {/* Upload Routes */}
                <Route path="/upload" element={<UploadPage />} />
                
                {/* Organization Routes */}
                <Route path={ORGANIZATIONS_PATH} element={<OrganizationList />} />
                <Route path={ORGANIZATION_DETAIL_PATH} element={<OrganizationDetail />} />
                <Route path={ORGANIZATION_WORKSPACE_PATH} element={<OrganizationWorkspace />} />
                <Route path={ORGANIZATION_MEMBERS_PATH} element={<OrganizationMembers />} />
                
                {/* User Routes */}
                <Route path={PROFILE_PATH} element={<Profile />} />
                <Route path={SETTINGS_PATH} element={<Settings />} />
              </Route>

              {/* Error Routes */}
              <Route path={UNAUTHORIZED_PATH} element={<Unauthorized />} />
              <Route path={NOT_FOUND_PATH} element={<NotFound />} />
              
              {/* Redirect root to dashboard */}
              <Route path="/" element={<Navigate to={DASHBOARD_PATH} replace />} />
              
              {/* 404 catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </QueryClientProvider>
      </Provider>
    </ErrorBoundary>
  );
}

export default App;
