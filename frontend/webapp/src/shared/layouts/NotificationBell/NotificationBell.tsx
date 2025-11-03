import { useState, useRef, useEffect } from 'react';
import { useMyPendingInvitations, useAcceptInvitation, useDeclineInvitation } from '@features/organizations';
import { Button } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Invitation } from '@features/organizations/models/types/organization.types';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { data: invitations, isLoading, refetch, isFetching } = useMyPendingInvitations();
  const { mutate: acceptInvitation, isPending: isAccepting } = useAcceptInvitation();
  const { mutate: declineInvitation, isPending: isDeclining } = useDeclineInvitation();

  const pendingCount = invitations?.length || 0;

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

  const handleAccept = (invitationIdOrToken: string) => {
    console.log('🔄 Accepting invitation with ID/Token:', invitationIdOrToken);
    acceptInvitation(
      { token: invitationIdOrToken },
      {
        onSuccess: () => {
          console.log('✅ Invitation accepted from notification');
          refetch(); // Refresh the list
        },
        onError: (error: any) => {
          console.error('❌ Failed to accept invitation:', error);
          alert('Failed to accept invitation. Please try again.');
        },
      }
    );
  };

  const handleDecline = (invitationIdOrToken: string) => {
    console.log('🔄 Declining invitation with ID/Token:', invitationIdOrToken);
    declineInvitation(
      { token: invitationIdOrToken },
      {
        onSuccess: () => {
          console.log('✅ Invitation declined from notification');
          refetch(); // Refresh the list
        },
        onError: (error: any) => {
          console.error('❌ Failed to decline invitation:', error);
          alert('Failed to decline invitation. Please try again.');
        },
      }
    );
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
              onClick={() => refetch()}
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
                {invitations?.map((invitation: Invitation) => (
                  <div
                    key={invitation.id}
                    className="px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#dbeafe' }}>
                        <CommonIcon name="building" size={20} color="#2563eb" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate" style={{ color: '#111827' }}>
                          Organization Invitation
                        </p>
                        <p className="text-sm mt-1" style={{ color: '#4b5563' }}>
                          You've been invited to join as{' '}
                          <span className="font-medium" style={{ color: '#2563eb' }}>
                            {invitation.role}
                          </span>
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-xs" style={{ color: '#6b7280' }}>
                          <CommonIcon name="clock" size={12} />
                          <span>{formatDate(invitation.createdAt)}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => handleAccept(invitation.token || invitation.id)}
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

                          <Button
                            onClick={() => handleDecline(invitation.token || invitation.id)}
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
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
