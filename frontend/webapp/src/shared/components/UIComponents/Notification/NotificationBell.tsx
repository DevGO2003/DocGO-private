import { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Building2, Clock, RefreshCw } from 'lucide-react';
import { useMyPendingInvitations, useAcceptInvitation, useDeclineInvitation } from '@features/organizations';
import { Popover, Button, Badge, Panel, Flex, Stack, Text, Heading } from '@shared/components';
import { Invitation } from '@features/organizations/models/types/organization.types';
import { createRoughCanvas, drawRoughRect } from '@shared/lib/roughUtils';

export const NotificationBell = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const { data: invitations, isLoading, refetch, isFetching } = useMyPendingInvitations();
  const { mutate: acceptInvitation, isPending: isAccepting } = useAcceptInvitation();
  const { mutate: declineInvitation, isPending: isDeclining } = useDeclineInvitation();

  const pendingCount = invitations?.length || 0;

  const drawCanvas = () => {
    if (!panelRef.current || !canvasRef.current) return;
    const el = panelRef.current;
    const canvas = canvasRef.current;
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    if (width === 0 || height === 0) return;
    canvas.width = width;
    canvas.height = height;
    const rc = createRoughCanvas(canvas);
    drawRoughRect(rc, 6, 6, width - 12, height - 12, {
      stroke: '#94a3b8',
      strokeWidth: 2,
      roughness: 1.5,
    });
  };

  useEffect(() => {
    if (isOpen) {
      const t = setTimeout(drawCanvas, 50);
      return () => clearTimeout(t);
    }
  }, [isOpen, isLoading, isFetching, pendingCount]);

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
    <Popover>
      <Button variant="icon" onClick={() => setIsOpen(!isOpen)} aria-label="Notifications">
        <Bell size={24} color="gray600" />
        {pendingCount > 0 && (
          <Badge color="red">{pendingCount}</Badge>
        )}
      </Button>
      {isOpen && (
        <Panel shadow bordered width="96">
          <Stack gap="3">
            <Flex align="center" justify="between">
              <Heading level={3} size="lg" fontWeight="semibold" color="gray900">
                Notifications
                {pendingCount > 0 && (
                  <Text as="span" size="sm" fontWeight="normal" color="gray500">({pendingCount} pending)</Text>
                )}
              </Heading>
              <Button
                variant="icon"
                onClick={() => refetch()}
                disabled={isFetching}
                title="Refresh notifications"
              >
                <RefreshCw size={16} className={isFetching ? 'animate-spin' : ''} />
              </Button>
            </Flex>
            {/* Content */}
            <Stack maxHeight="96" scrollY>
              {isLoading ? (
                <Flex align="center" justify="center" py="6"><LoadingSpinner /></Flex>
              ) : pendingCount === 0 ? (
                <Stack align="center" py="8">
                  <Bell size={48} opacity={0.5} color="gray500" />
                  <Text size="sm" color="gray500">No pending invitations</Text>
                </Stack>
              ) : (
                <Stack gap="2">
                  {invitations?.map((invitation: Invitation) => (
                    <Panel key={invitation.id} hoverable>
                      <Flex align="start" gap="3">
                        <Flex align="center" justify="center" shrink="0" width="10" height="10" bg="blue100" rounded>
                          <Building2 size={20} color="blue600" />
                        </Flex>
                        <Stack flex="1">
                          <Heading level={4} size="sm" fontWeight="medium" color="gray900" isTruncated>
                            Organization Invitation
                          </Heading>
                          <Text size="sm" color="gray600">
                            You've been invited to join as <Text as="span" color="blue600" fontWeight="medium">{invitation.role}</Text>
                          </Text>
                          <Flex align="center" gap="2" mt="2">
                            <Clock size={12} color="gray500" />
                            <Text size="xs" color="gray500">{formatDate(invitation.createdAt)}</Text>
                          </Flex>
                          <Flex gap="2" mt="3">
                            <Button
                              fullWidth
                              size="xs"
                              onClick={() => handleAccept(invitation.token)}
                              disabled={isAccepting || isDeclining}
                            >
                              {isAccepting ? (
                                <>
                                  {/* TODO: Replace spinner by <LoadingSpinner size='xs'/> */}
                                  Accepting...
                                </>
                              ) : (
                                <>
                                  <Check size={12} /> Accept
                                </>
                              )}
                            </Button>
                            <Button
                              fullWidth
                              variant="outline"
                              size="xs"
                              onClick={() => handleDecline(invitation.token)}
                              disabled={isAccepting || isDeclining}
                            >
                              {isDeclining ? (
                                <>
                                  {/* TODO: Replace spinner by <LoadingSpinner size='xs'/> */}
                                  Declining...
                                </>
                              ) : (
                                <>
                                  <X size={12} /> Decline
                                </>
                              )}
                            </Button>
                          </Flex>
                        </Stack>
                      </Flex>
                    </Panel>
                  ))}
                </Stack>
              )}
            </Stack>
          </Stack>
        </Panel>
      )}
    </Popover>
  );
};
