import { useState, useRef, useEffect, useMemo } from 'react';
import { useMyPendingInvitations, useAcceptInvitation, useDeclineInvitation } from '@features/organizations';
import { useMyPendingRepositoryInvites, useAcceptInvite } from '@features/repositories/models/api/repositoryApi';
import { Button } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Invitation } from '@features/organizations/models/types/organization.types';
import { RepositoryInvite } from '@features/repositories/models/types/repository.types';

type CombinedInvitation = {
  id: string;
  type: 'organization' | 'repository';
  data: Invitation | RepositoryInvite;
  createdAt: string;
};

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: orgInvitations, isLoading: orgLoading, refetch: refetchOrg, isFetching: orgFetching } = useMyPendingInvitations();
  const { data: repoInvitations, isLoading: repoLoading, refetch: refetchRepo, isFetching: repoFetching, error: repoError } = useMyPendingRepositoryInvites();

  // Debug logging
  useEffect(() => {
    console.log('[NotificationBell] Org invitations:', orgInvitations);
    console.log('[NotificationBell] Repo invitations:', repoInvitations);
    if (repoError) {
      console.error('[NotificationBell] Error loading repo invitations:', repoError);
    }
  }, [orgInvitations, repoInvitations, repoError]);
  
  const { mutate: acceptOrgInvitation, isPending: isAcceptingOrg } = useAcceptInvitation();
  const { mutate: declineInvitation, isPending: isDeclining } = useDeclineInvitation();
  const { mutate: acceptRepoInvite, isPending: isAcceptingRepo } = useAcceptInvite();

  // Combine both types of invitations
  const combinedInvitations = useMemo<CombinedInvitation[]>(() => {
    const orgs: CombinedInvitation[] = (orgInvitations || []).map(inv => ({
      id: inv.id,
      type: 'organization' as const,
      data: inv,
      createdAt: inv.createdAt,
    }));
    
    const repos: CombinedInvitation[] = (repoInvitations || []).map(inv => ({
      id: inv.id,
      type: 'repository' as const,
      data: inv,
      createdAt: inv.createdAt,
    }));
    
    return [...orgs, ...repos].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [orgInvitations, repoInvitations]);

  const pendingCount = combinedInvitations.length;
  const isLoading = orgLoading || repoLoading;
  const isFetching = orgFetching || repoFetching;
  const isAccepting = isAcceptingOrg || isAcceptingRepo;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleRefresh = () => {
    refetchOrg();
    refetchRepo();
  };

  const handleAccept = (invitation: CombinedInvitation) => {
    if (invitation.type === 'organization') {
      const orgData = invitation.data as Invitation;
      console.log('🔄 Accepting organization invitation:', orgData.token || orgData.id);
      acceptOrgInvitation(
        { token: orgData.token || orgData.id },
        {
          onSuccess: () => {
            console.log('✅ Organization invitation accepted');
            handleRefresh();
          },
          onError: (error: any) => {
            console.error('❌ Failed to accept organization invitation:', error);
            alert('Failed to accept organization invitation. Please try again.');
          },
        }
      );
    } else {
      const repoData = invitation.data as RepositoryInvite;
      console.log('🔄 Accepting repository invitation:', repoData.token);
      acceptRepoInvite(repoData.token, {
        onSuccess: () => {
          console.log('✅ Repository invitation accepted');
          handleRefresh();
          alert('Đã tham gia repository thành công!');
        },
        onError: (error: any) => {
          console.error('❌ Failed to accept repository invitation:', error);
          alert('Failed to accept repository invitation. Please try again.');
        },
      });
    }
  };

  const handleDecline = (invitation: CombinedInvitation) => {
    if (invitation.type === 'organization') {
      const orgData = invitation.data as Invitation;
      console.log('🔄 Declining organization invitation:', orgData.token || orgData.id);
      declineInvitation(
        { token: orgData.token || orgData.id },
        {
          onSuccess: () => {
            console.log('✅ Organization invitation declined');
            handleRefresh();
          },
          onError: (error: any) => {
            console.error('❌ Failed to decline organization invitation:', error);
            alert('Failed to decline invitation. Please try again.');
          },
        }
      );
    } else {
      // Repository invitations don't have decline functionality in current API
      console.log('Repository invitations cannot be declined - just ignore them');
      alert('Lời mời repository sẽ tự động hết hạn. Bạn không cần từ chối.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-gray-100 rounded-lg transition-colors"
        style={{ color: '#4b5563' }}
        aria-label="Notifications"
      >
        <CommonIcon name="bell" size={24} />
        {pendingCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold rounded-full" style={{ color: '#ffffff', backgroundColor: '#dc2626' }}>
            {pendingCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 rounded-lg border z-50" style={{ borderColor: '#e5e7eb', backgroundColor: '#ffffff', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
          {/* Header */}
          <div className="px-4 py-3 border-b flex items-center justify-between" style={{ borderColor: '#e5e7eb' }}>
            <h3 className="text-lg font-semibold" style={{ color: '#111827' }}>
              Notifications
              {pendingCount > 0 && (
                <span className="ml-2 text-sm font-normal" style={{ color: '#6b7280' }}>
                  ({pendingCount} pending)
                </span>
              )}
            </h3>
            <button
              onClick={handleRefresh}
              disabled={isFetching}
              className="p-1 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              style={{ color: '#6b7280' }}
              title="Refresh notifications"
            >
              <CommonIcon name="rotate-cw" size={16} className={isFetching ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8" style={{ color: '#6b7280' }}>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto" style={{ borderColor: '#2563eb' }}></div>
                <p className="mt-2">Loading...</p>
              </div>
            ) : pendingCount === 0 ? (
              <div className="px-4 py-8" style={{ color: '#6b7280' }}>
                <CommonIcon name="bell" size={48} className="mx-auto mb-2 opacity-50" />
                <p>No pending invitations</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {combinedInvitations.map((invitation) => {
                  const isOrg = invitation.type === 'organization';
                  const orgData = isOrg ? (invitation.data as Invitation) : null;
                  const repoData = !isOrg ? (invitation.data as RepositoryInvite) : null;

                  return (
                    <div
                      key={invitation.id}
                      className="px-4 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: isOrg ? '#dbeafe' : '#fef3c7' }}>
                          <CommonIcon name={isOrg ? 'building' : 'folder'} size={20} color={isOrg ? '#2563eb' : '#d97706'} />
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate" style={{ color: '#111827' }}>
                            {isOrg ? 'Organization Invitation' : 'Repository Invitation'}
                          </p>
                          <p className="text-sm mt-1" style={{ color: '#4b5563' }}>
                            {isOrg ? (
                              <>
                                You've been invited to join as{' '}
                                <span className="font-medium" style={{ color: '#2563eb' }}>
                                  {orgData?.role}
                                </span>
                              </>
                            ) : (
                              <>
                                You've been invited to{' '}
                                <span className="font-medium" style={{ color: '#d97706' }}>
                                  {repoData?.repositoryName || 'a repository'}
                                </span>
                              </>
                            )}
                          </p>

                          <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: '#6b7280' }}>
                            <CommonIcon name="clock" size={12} />
                            <span>{formatDate(invitation.createdAt)}</span>
                          </div>

                          {/* Action Buttons */}
                          <div className="flex gap-2 mt-3">
                            <Button
                              onClick={() => handleAccept(invitation)}
                              disabled={isAccepting || isDeclining}
                              className="flex-1 py-1 px-2 text-xs h-8"
                            >
                              {isAccepting ? (
                                <>
                                  <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                                  Accepting...
                                </>
                              ) : (
                                <>
                                  <CommonIcon name="check" size={12} className="mr-1" />
                                  Accept
                                </>
                              )}
                            </Button>

                            {isOrg && (
                              <Button
                                onClick={() => handleDecline(invitation)}
                                disabled={isAccepting || isDeclining}
                                variant="outline"
                                className="flex-1 py-1 px-2 text-xs h-8"
                              >
                                {isDeclining ? (
                                  <>
                                    <div className="animate-spin rounded-full h-3 w-3 border-b-2 mr-1" style={{ borderColor: '#4b5563' }}></div>
                                    Declining...
                                  </>
                                ) : (
                                  <>
                                    <CommonIcon name="x" size={12} className="mr-1" />
                                    Decline
                                  </>
                                )}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
