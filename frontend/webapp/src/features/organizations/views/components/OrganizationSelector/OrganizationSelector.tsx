import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { useMyOrganizations } from '@features/organizations';
import { ORGANIZATIONS_PATH, ORGANIZATION_WORKSPACE_PATH } from '@constants';
import { Organization } from '@features/organizations/models/types/organization.types';

interface OrganizationSelectorProps {
  currentOrganizationId?: string;
  onOrganizationChange?: (orgId: string) => void;
}

export const OrganizationSelector = ({
  currentOrganizationId,
  onOrganizationChange,
}: OrganizationSelectorProps) => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data } = useMyOrganizations({
    page: 0,
    size: 50,
  });

  const currentOrg = data?.content.find((org: Organization) => org.id === currentOrganizationId);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectOrganization = (orgId: string) => {
    setIsOpen(false);
    if (onOrganizationChange) {
      onOrganizationChange(orgId);
    }
    navigate(ORGANIZATION_WORKSPACE_PATH.replace(':id', orgId));
  };

  const handleCreateNew = () => {
    setIsOpen(false);
    navigate(ORGANIZATIONS_PATH);
  };

  const getRoleIcon = (role?: string) => {
    switch (role?.toUpperCase()) {
      case 'OWNER':
        return <CommonIcon name="crown" className="w-3 h-3" style={{ color: '#9333ea' }} />;
      case 'MANAGER':
        return <CommonIcon name="user-cog" style={{ color: '#2563eb' }} />;
      case 'MEMBER':
        return <CommonIcon name="shield" style={{ color: '#16a34a' }} />;
      default:
        return null;
    }
  };

  const getRoleColor = (role?: string) => {
    switch (role?.toUpperCase()) {
      case 'OWNER':
        return 'text-purple-700';
      case 'MANAGER':
        return 'text-blue-700';
      case 'MEMBER':
        return 'text-green-700';
      default:
        return 'text-gray-700';
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Selector Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 border-2 rounded-lg hover: transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-w-[220px]" style={{ borderColor: '#d1d5db', backgroundColor: '#ffffff' }} >
        {currentOrg ? (
          <>
            <div className="h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
              <span className="text-sm font-bold" style={{ color: '#ffffff' }} >
                {currentOrg.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div className="flex-1 text-left overflow-hidden">
              <p className="text-sm font-semibold truncate" style={{ color: '#111827' }} >
                {currentOrg.name}
              </p>
              <div className="flex items-center gap-1">
                {getRoleIcon(currentOrg.userRole)}
                <span className={`text-xs font-medium ${getRoleColor(currentOrg.userRole)}`}>
                  {currentOrg.userRole || 'Member'}
                </span>
              </div>
            </div>
          </>
        ) : (
          <>
            <CommonIcon name="building" style={{ color: '#6b7280' }} />
            <span className="flex-1 text-sm" style={{ color: '#374151' }} >Select Organization</span>
          </>
        )}
        <CommonIcon name="chevron-down" 
          className={`w-4 h-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu */}
              {isOpen && (
          <div className="absolute top-full left-0 mt-2 w-full min-w-[280px] rounded-lg border-2 overflow-hidden z-50" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff' }} >
            {/* Organizations List */}
            <div className="max-h-80 overflow-y-auto">
              {data?.content && data.content.length > 0 ? (
                data.content.map((org: Organization) => (
                  <button
                    key={org.id}
                    onClick={() => handleSelectOrganization(org.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors ${
                      org.id === currentOrganizationId ? 'bg-blue-50' : ''
                    }`}
                  >
                    <div className="h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
                      <span className="font-bold" style={{ color: '#ffffff' }} >
                        {org.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <p className="text-sm font-semibold truncate" style={{ color: '#111827' }} >
                        {org.name}
                      </p>
                      <div className="flex items-center gap-1">
                        {getRoleIcon(org.userRole)}
                        <span className={`text-xs font-medium ${getRoleColor(org.userRole)}`}>
                          {org.userRole || 'Member'}
                        </span>
                      </div>
                    </div>
                    {org.id === currentOrganizationId && (
                      <CommonIcon name="check" className="flex-shrink-0" style={{ color: '#2563eb' }} />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-4 py-6 text-sm" style={{ color: '#6b7280' }} >
                  No organizations found
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="border-t" style={{ borderColor: '#e5e7eb' }} ></div>

            {/* Create New */}
            <button
              onClick={handleCreateNew}
              className="w-full flex items-center gap-2 px-4 py-3 hover:bg-gray-50 transition-colors font-medium" style={{ color: '#2563eb' }} >
              <CommonIcon name="plus" className="w-4 h-4" />
              Create New Organization
            </button>
          </div>
        )}
          </div>
  );
};
