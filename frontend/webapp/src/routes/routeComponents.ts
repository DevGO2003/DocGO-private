// Lazy load all route components
import { lazy } from 'react';

// Auth pages
export const Login = lazy(() => import('@features/auth/views/pages/Login').then(m => ({ default: m.Login })));
export const Register = lazy(() => import('@features/auth/views/pages/Register').then(m => ({ default: m.Register })));
export const OAuth2Callback = lazy(() => import('@features/auth/views/pages').then(m => ({ default: m.OAuth2Callback })));

// Dashboard
export const Dashboard = lazy(() => import('@features/dashboard').then(m => ({ default: m.Dashboard })));

// Landing
export const Home = lazy(() => import('@features/landing/views/pages/Home').then(m => ({ default: m.Home })));

// Repository
export const RepositoryList = lazy(() => import('@features/repositories/views/pages/RepositoryList').then(m => ({ default: m.RepositoryList })));
export const RepositoryDetail = lazy(() => import('@features/repositories/views/pages/RepositoryDetail').then(m => ({ default: m.RepositoryDetail })));
export const RepositoryFileDetail = lazy(() => import('@features/repositories/views/pages/RepositoryFileDetail').then(m => ({ default: m.RepositoryFileDetail })));
export const RepositoryFilesList = lazy(() => import('@features/repositories/views/pages/RepositoryFilesList').then(m => ({ default: m.RepositoryFilesList })));

// Organization
export const OrganizationList = lazy(() => import('@features/organizations/views/pages/OrganizationList').then(m => ({ default: m.OrganizationList })));
export const OrganizationDetail = lazy(() => import('@features/organizations/views/pages/OrganizationDetail').then(m => ({ default: m.OrganizationDetail })));
export const OrganizationWorkspace = lazy(() => import('@features/organizations/views/pages/OrganizationWorkspace').then(m => ({ default: m.OrganizationWorkspace })));
export const OrganizationMembers = lazy(() => import('@features/organizations/views/pages/OrganizationMembers').then(m => ({ default: m.OrganizationMembers })));
export const AcceptInvitation = lazy(() => import('@features/organizations/views/pages/AcceptInvitation').then(m => ({ default: m.AcceptInvitation })));

// Profile & Settings
export const Profile = lazy(() => import('@features/profile/views/pages').then(m => ({ default: m.Profile })));
export const Settings = lazy(() => import('@features/settings/views/pages/Settings').then(m => ({ default: m.Settings })));

// Upload
export const UploadPage = lazy(() =>
  import('@features/upload/views/pages/UploadPage').then(m => ({ default: (m as any).UploadPage ?? m.default }))
);

// Error pages
export const NotFound = lazy(() => import('@pages/NotFound').then(m => ({ default: m.NotFound })));
export const Unauthorized = lazy(() => import('@pages/Unauthorized').then(m => ({ default: m.Unauthorized })));
