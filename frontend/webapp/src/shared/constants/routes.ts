// Authentication Routes
export const LOGIN_PATH = '/login';
export const REGISTER_PATH = '/register';
export const FORGOT_PASSWORD_PATH = '/forgot-password';
export const RESET_PASSWORD_PATH = '/reset-password';

// Dashboard Routes
export const HOME_PATH = '/';
export const DASHBOARD_PATH = '/dashboard';

// Repository Routes
export const REPOSITORIES_PATH = '/repositories';
export const REPOSITORY_DETAIL_PATH = '/repositories/:id';
export const REPOSITORY_CREATE_PATH = '/repositories/create';

// Organization Routes
export const ORGANIZATIONS_PATH = '/organizations';
export const ORGANIZATION_DETAIL_PATH = '/organizations/:id';
export const ORGANIZATION_CREATE_PATH = '/organizations/create';
export const ORGANIZATION_WORKSPACE_PATH = '/organizations/:id/workspace';
export const ORGANIZATION_MEMBERS_PATH = '/organizations/:id/members';
export const ACCEPT_INVITATION_PATH = '/invitations/accept';

// User Routes
export const PROFILE_PATH = '/profile';
export const SETTINGS_PATH = '/settings';
export const USERS_PATH = '/users';

// Error Routes
export const NOT_FOUND_PATH = '/404';
export const UNAUTHORIZED_PATH = '/unauthorized';

// Helper function to build paths with params
export const buildPath = (path: string, params: Record<string, string>) => {
  let result = path;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, value);
  });
  return result;
};
