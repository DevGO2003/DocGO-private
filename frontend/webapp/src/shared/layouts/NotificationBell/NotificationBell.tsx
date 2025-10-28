import { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Building2, Clock, RefreshCw } from 'lucide-react';
import { useMyPendingInvitations, useAcceptInvitation, useDeclineInvitation } from '@features/organizations';
import { Button } from '@shared/components';
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

  const handleAccept = (token: string) => {
    acceptInvitation(
      { token },
      {
        onSuccess: () => {
          console.log('✅ Invitation accepted from notification');
        },
        onError: (error: any) => {
          console.error('❌ Failed to accept invitation:', error);
          alert('Failed to accept invitation. Please try again.');
        },
      }
    );
  };

  const handleDecline = (token: string) => {
    declineInvitation(
      { token },
      {
        onSuccess: () => {
          console.log('✅ Invitation declined from notification');
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
        className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {pendingCount > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
            {pendingCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              Notifications
              {pendingCount > 0 && (
                <span className="ml-2 text-sm font-normal text-gray-500">
                  ({pendingCount} pending)
                </span>
              )}
            </h3>
            <button
              onClick={() => refetch()}
              disabled={isFetching}
              className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors disabled:opacity-50"
              title="Refresh notifications"
            >
              <RefreshCw className={`w-4 h-4 ${isFetching ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2">Loading...</p>
              </div>
            ) : pendingCount === 0 ? (
              <div className="px-4 py-8 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
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
                      <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building2 className="w-5 h-5 text-blue-600" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          Organization Invitation
                        </p>
                        <p className="text-sm text-gray-600 mt-1">
                          You've been invited to join as{' '}
                          <span className="font-medium text-blue-600">
                            {invitation.role}
                          </span>
                        </p>

                        <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(invitation.createdAt)}</span>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 mt-3">
                          <Button
                            onClick={() => handleAccept(invitation.token)}
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
                                <Check className="w-3 h-3 mr-1" />
                                Accept
                              </>
                            )}
                          </Button>

                          <Button
                            onClick={() => handleDecline(invitation.token)}
                            disabled={isAccepting || isDeclining}
                            variant="outline"
                            className="flex-1 py-1 px-2 text-xs h-8"
                          >
                            {isDeclining ? (
                              <>
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-gray-600 mr-1"></div>
                                Declining...
                              </>
                            ) : (
                              <>
                                <X className="w-3 h-3 mr-1" />
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
