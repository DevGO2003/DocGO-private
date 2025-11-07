/**
 * Organization Context Utilities
 * Helper functions to manage organization role and permissions in localStorage
 */

import { Organization } from '../models/types/organization.types';

/**
 * Save organization context to localStorage
 * Called when user selects an organization
 */
export const saveOrganizationContext = (organization: Organization) => {
  if (!organization) return;
  
  localStorage.setItem('currentOrganizationId', organization.id);
  localStorage.setItem('organizationRole', organization.userRole || 'MEMBER');
  localStorage.setItem('organizationPermissions', (organization.userPermissions || []).join(','));
  
  console.log('[OrganizationContext] Saved:', {
    orgId: organization.id,
    orgName: organization.name,
    role: organization.userRole,
    permissions: organization.userPermissions
  });
};

/**
 * Get current organization context from localStorage
 */
export const getOrganizationContext = () => {
  return {
    organizationId: localStorage.getItem('currentOrganizationId'),
    role: localStorage.getItem('organizationRole'),
    permissions: (localStorage.getItem('organizationPermissions') || '').split(',').filter(Boolean)
  };
};

/**
 * Clear organization context from localStorage
 */
export const clearOrganizationContext = () => {
  localStorage.removeItem('currentOrganizationId');
  localStorage.removeItem('organizationRole');
  localStorage.removeItem('organizationPermissions');
  
  console.log('[OrganizationContext] Cleared');
};

/**
 * Check if user has specific permission
 */
export const hasPermission = (permission: string): boolean => {
  const context = getOrganizationContext();
  
  // OWNER has all permissions
  if (context.role === 'OWNER') {
    return true;
  }
  
  // Check specific permission
  return context.permissions.includes(permission);
};

/**
 * Check if user can approve at specific level
 */
export const canApproveLevel = (level: 'LEGAL' | 'FINANCE' | 'EXECUTIVE'): boolean => {
  const permission = `approve:${level.toLowerCase()}`;
  return hasPermission(permission);
};
