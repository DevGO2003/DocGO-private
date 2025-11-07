/**
 * Hook to automatically load and save organization context
 * Used in OrganizationWorkspace to ensure context is always set
 */

import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useOrganization } from '../models/api/organizationApi';
import { saveOrganizationContext, getOrganizationContext } from '../utils/organizationContext';

export const useOrganizationContext = () => {
  const { id } = useParams<{ id: string }>();
  const { data: organization, isLoading, error } = useOrganization(id!);

  useEffect(() => {
    if (organization && id) {
      const currentContext = getOrganizationContext();
      
      // Only update if organizationId changed or context is missing
      if (currentContext.organizationId !== id || !currentContext.role) {
        console.log('[useOrganizationContext] Auto-loading context for org:', id);
        console.log('[useOrganizationContext] Organization data:', {
          name: organization.name,
          userRole: organization.userRole,
          userPermissions: organization.userPermissions
        });
        
        saveOrganizationContext(organization);
      } else {
        console.log('[useOrganizationContext] Context already set:', currentContext);
      }
    }
  }, [organization, id]);

  return {
    organization,
    isLoading,
    error,
    context: getOrganizationContext()
  };
};
