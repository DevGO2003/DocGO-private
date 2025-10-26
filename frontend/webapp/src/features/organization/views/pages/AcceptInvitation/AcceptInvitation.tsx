import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, Building2, UserCheck, X, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, Button } from '@shared/components';
import { useAcceptInvitation, useDeclineInvitation, type AcceptInvitationResponse } from '@features/organization';

export const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');

  const [error, setError] = useState<string>('');

  const { mutate: acceptInvitation, isPending: isAccepting } = useAcceptInvitation();
  const { mutate: declineInvitation, isPending: isDeclining } = useDeclineInvitation();

  // TODO: Fetch invitation details by token when backend API is ready
  // const { data: invitation, isLoading } = useGetInvitationByToken(token || '');

  const handleAccept = () => {
    if (!token) return;

    console.log('✅ [Accept Invitation] Accepting invitation with token:', token);

    acceptInvitation(
      { token },
      {
        onSuccess: (data: AcceptInvitationResponse) => {
          console.log('✅ [Accept Invitation] Success:', data);
          // Redirect to organization
          if (data.organizationId) {
            navigate(`/organizations/${data.organizationId}/workspace`);
          } else {
            navigate('/organizations');
          }
        },
        onError: (error: any) => {
          console.error('❌ [Accept Invitation] Error:', error);
          setError(error?.response?.data?.description || 'Failed to accept invitation');
        },
      }
    );
  };

  const handleDecline = () => {
    if (!token) return;

    console.log('❌ [Accept Invitation] Declining invitation with token:', token);

    declineInvitation(
      { token },
      {
        onSuccess: () => {
          console.log('✅ [Accept Invitation] Declined successfully');
          navigate('/organizations');
        },
        onError: (error: any) => {
          console.error('❌ [Accept Invitation] Decline error:', error);
          setError(error?.response?.data?.description || 'Failed to decline invitation');
        },
      }
    );
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Invalid Link</h2>
            <p className="text-gray-600 mb-6">This invitation link is invalid or expired.</p>
            <Button onClick={() => navigate('/organizations')} className="w-full">
              Go to Organizations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <X className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <Button onClick={() => navigate('/organizations')} className="w-full">
              Go to Organizations
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="border-b bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
          <div className="flex items-center gap-3">
            <Mail className="w-8 h-8" />
            <div>
              <h1 className="text-2xl font-bold">Organization Invitation</h1>
              <p className="text-blue-100 mt-1">You've been invited to join an organization</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* Invitation Details */}
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-4">
                <Building2 className="w-12 h-12 text-blue-600 flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold text-gray-900 mb-2">
                    Organization Name
                  </h2>
                  <p className="text-gray-600 mb-4">
                    You've been invited to join this organization as a{' '}
                    <strong className="text-blue-600">Member</strong>
                  </p>

                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Mail className="w-4 h-4" />
                    <span>Invited to: {searchParams.get('email') || 'your email'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Note about invitation details */}
            <div className="text-sm text-gray-500 text-center bg-yellow-50 border border-yellow-200 rounded p-3">
              Click <strong>Accept</strong> to join this organization and start collaborating with your team.
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Button
                onClick={handleDecline}
                variant="outline"
                className="flex-1"
                disabled={isAccepting || isDeclining}
              >
                {isDeclining ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Declining...
                  </>
                ) : (
                  <>
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </>
                )}
              </Button>

              <Button
                onClick={handleAccept}
                className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
                disabled={isAccepting || isDeclining}
              >
                {isAccepting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Accepting...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Accept Invitation
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
