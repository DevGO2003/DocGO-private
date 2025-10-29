/**
 * ============================================
 * ROUTE CONSTANTS - Tập trung quản lý tất cả routes
 * ============================================
 * Chuẩn: SCREAMING_SNAKE_CASE
 * Nhóm: Theo module/feature
 * Mục đích: Dễ tìm kiếm, không trùng lặp, type-safe
 */

// ============================================
// 🔐 AUTHENTICATION ROUTES
// ============================================
export const AUTH_ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  OAUTH2_CALLBACK: '/auth/oauth2/callback',
} as const;

// ============================================
// 🏠 DASHBOARD ROUTES
// ============================================
export const DASHBOARD_ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
} as const;

// ============================================
// 🌐 LANDING ROUTES
// ============================================
export const LANDING_ROUTES = {
  HOME: '/home',
} as const;

// ============================================
// 📁 REPOSITORY ROUTES
// ============================================
export const REPOSITORY_ROUTES = {
  LIST: '/repositories',
  DETAIL: '/repositories/:id',
  FILES_LIST: '/repositories/:id/files',
  CREATE: '/repositories/create',
  EDIT: '/repositories/:id/edit',
  FILE_DETAIL: '/repositories/:id/files/:fileId',
  UPLOAD: '/upload',
} as const;

// ============================================
// 🏢 ORGANIZATION ROUTES
// ============================================
export const ORGANIZATION_ROUTES = {
  LIST: '/organizations',
  DETAIL: '/organizations/:id',
  CREATE: '/organizations/create',
  EDIT: '/organizations/:id/edit',
  WORKSPACE: '/organizations/:id/workspace',
  MEMBERS: '/organizations/:id/members',
  INVITE: '/organizations/:id/invite',
  ACCEPT_INVITATION: '/invitations/accept',
} as const;

// ============================================
// 👤 USER ROUTES
// ============================================
export const USER_ROUTES = {
  PROFILE: '/profile',
  SETTINGS: '/settings',
  EDIT_PROFILE: '/profile/edit',
} as const;

// ============================================
// ⚠️ ERROR ROUTES
// ============================================
export const ERROR_ROUTES = {
  NOT_FOUND: '/404',
  UNAUTHORIZED: '/unauthorized',
  FORBIDDEN: '/forbidden',
  SERVER_ERROR: '/500',
} as const;

// ============================================
// 🔗 ROUTE HELPERS
// ============================================

/**
 * Build dynamic path with parameters
 * @example buildPath(REPOSITORY_ROUTES.DETAIL, { id: '123' }) => '/repositories/123'
 */
export const buildPath = (
  path: string,
  params?: Record<string, string | number>
): string => {
  if (!params) return path;
  
  let result = path;
  Object.entries(params).forEach(([key, value]) => {
    result = result.replace(`:${key}`, String(value));
  });
  return result;
};

/**
 * Check if path has dynamic parameters
 * @example hasDynamicParams(REPOSITORY_ROUTES.DETAIL) => true
 */
export const hasDynamicParams = (path: string): boolean => {
  return /:\w+/.test(path);
};

/**
 * Extract parameter names from path
 * @example getPathParams(REPOSITORY_ROUTES.DETAIL) => ['id']
 */
export const getPathParams = (path: string): string[] => {
  const matches = path.match(/:([\w]+)/g);
  return matches ? matches.map(m => m.slice(1)) : [];
};

/**
 * Validate if path has all required parameters
 * @example validatePath(REPOSITORY_ROUTES.DETAIL, { id: '123' }) => true
 */
export const validatePath = (
  path: string,
  params?: Record<string, string | number>
): boolean => {
  const requiredParams = getPathParams(path);
  if (requiredParams.length === 0) return true;
  if (!params) return false;
  return requiredParams.every(param => param in params);
};

// ============================================
// 📋 ROUTE COLLECTIONS
// ============================================

/**
 * All public routes (không cần authentication)
 */
export const PUBLIC_ROUTES = {
  ...AUTH_ROUTES,
  ...LANDING_ROUTES,
  ACCEPT_INVITATION: ORGANIZATION_ROUTES.ACCEPT_INVITATION,
} as const;

/**
 * All protected routes (cần authentication)
 */
export const PROTECTED_ROUTES = {
  ...DASHBOARD_ROUTES,
  ...REPOSITORY_ROUTES,
  ...ORGANIZATION_ROUTES,
  ...USER_ROUTES,
} as const;

/**
 * All error routes
 */
export const ALL_ERROR_ROUTES = { ...ERROR_ROUTES };

/**
 * All available routes
 */
export const ALL_ROUTES = {
  ...PUBLIC_ROUTES,
  ...PROTECTED_ROUTES,
  ...ALL_ERROR_ROUTES,
} as const;

// ============================================
// 📊 TYPE DEFINITIONS
// ============================================

/**
 * Type-safe route keys
 */
export type RouteKey = keyof typeof ALL_ROUTES;

/**
 * Type-safe route values
 */
export type RoutePath = typeof ALL_ROUTES[RouteKey];

// ============================================
// 🔄 BACKWARD COMPATIBILITY (deprecated)
// ============================================
// @deprecated Use AUTH_ROUTES, REPOSITORY_ROUTES, etc. instead
export const LOGIN_PATH = AUTH_ROUTES.LOGIN;
export const REGISTER_PATH = AUTH_ROUTES.REGISTER;
export const FORGOT_PASSWORD_PATH = AUTH_ROUTES.FORGOT_PASSWORD;
export const RESET_PASSWORD_PATH = AUTH_ROUTES.RESET_PASSWORD;
export const HOME_PATH = DASHBOARD_ROUTES.HOME;
export const DASHBOARD_PATH = DASHBOARD_ROUTES.DASHBOARD;
export const LANDING_HOME_PATH = LANDING_ROUTES.HOME;
export const REPOSITORIES_PATH = REPOSITORY_ROUTES.LIST;
export const REPOSITORY_DETAIL_PATH = REPOSITORY_ROUTES.DETAIL;
export const REPOSITORY_FILES_LIST_PATH = REPOSITORY_ROUTES.FILES_LIST;
export const REPOSITORY_CREATE_PATH = REPOSITORY_ROUTES.CREATE;
export const REPOSITORY_FILE_DETAIL_PATH = REPOSITORY_ROUTES.FILE_DETAIL;
export const ORGANIZATIONS_PATH = ORGANIZATION_ROUTES.LIST;
export const ORGANIZATION_DETAIL_PATH = ORGANIZATION_ROUTES.DETAIL;
export const ORGANIZATION_CREATE_PATH = ORGANIZATION_ROUTES.CREATE;
export const ORGANIZATION_WORKSPACE_PATH = ORGANIZATION_ROUTES.WORKSPACE;
export const ORGANIZATION_MEMBERS_PATH = ORGANIZATION_ROUTES.MEMBERS;
export const ACCEPT_INVITATION_PATH = ORGANIZATION_ROUTES.ACCEPT_INVITATION;
export const PROFILE_PATH = USER_ROUTES.PROFILE;
export const SETTINGS_PATH = USER_ROUTES.SETTINGS;
export const NOT_FOUND_PATH = ERROR_ROUTES.NOT_FOUND;
export const UNAUTHORIZED_PATH = ERROR_ROUTES.UNAUTHORIZED;
