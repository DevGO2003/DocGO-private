import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Card, CardContent, CardHeader, Button } from '@shared/components';
import { useAcceptInvitation, useDeclineInvitation, type AcceptInvitationResponse } from '@/features/organizations';

export const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  const { t } = useTranslation();

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
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <CommonIcon name="x" size={64} color="#ef4444" className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#111827' }} >{t('organizations.acceptInvitation.invalidTitle')}</h2>
            <p className="mb-6" style={{ color: '#4b5563' }} >{t('organizations.acceptInvitation.invalidDesc')}</p>
            <Button onClick={() => navigate('/organizations')} className="w-full">
              {t('organizations.acceptInvitation.goToOrganizations')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <CommonIcon name="x" size={64} color="#ef4444" className="mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2" style={{ color: '#111827' }} >{t('organizations.acceptInvitation.error')}</h2>
            <p className="mb-6" style={{ color: '#4b5563' }} >{error}</p>
            <Button onClick={() => navigate('/organizations')} className="w-full">
              {t('organizations.acceptInvitation.goToOrganizations')}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ backgroundImage: 'linear-gradient(to bottom right, ...)' /* MANUAL FIX NEEDED */ }} >
      <Card className="max-w-2xl w-full">
        <CardHeader className="border-b" style={{ color: '#ffffff' }} >
          <div className="flex items-center gap-3">
            <CommonIcon name="mail" size={32} />
            <div>
              <h1 className="text-2xl font-bold">{t('organizations.acceptInvitation.header.title')}</h1>
              <p className="text-blue-100 mt-1">{t('organizations.acceptInvitation.header.subtitle')}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-8">
          {/* Invitation Details */}
          <div className="space-y-6">
            <div className="border rounded-lg p-6" style={{ borderColor: '#bfdbfe', backgroundColor: '#eff6ff' }} >
              <div className="flex items-start gap-4">
                <CommonIcon name="building" size={48} color="#3b82f6" className="flex-shrink-0" />
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2" style={{ color: '#111827' }} >
                    {t('organizations.acceptInvitation.orgName')}
                  </h2>
                  <p className="mb-4" style={{ color: '#4b5563' }} >
                    {t('organizations.acceptInvitation.invitedAs', { role: 'Member' })}
                  </p>

                  <div className="flex items-center gap-2 text-sm" style={{ color: '#6b7280' }} >
                    <CommonIcon name="mail" size={24} color="#3b82f6" />
                    <span>{t('organizations.acceptInvitation.invitedTo', { email: searchParams.get('email') || 'your email' })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Note about invitation details */}
            <div className="text-sm border rounded p-3" style={{ borderColor: '#fef08a', color: '#6b7280', backgroundColor: '#fefce8' }} >
              {t('organizations.acceptInvitation.note')}
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
                    <CommonIcon name="loading" size={24} color="#3b82f6" className="animate-spin mr-2" />
                    {t('organizations.acceptInvitation.declining')}
                  </>
                ) : (
                  <>
                    <CommonIcon name="x" size={24} color="#ef4444" className="mr-2" />
                    {t('organizations.acceptInvitation.decline')}
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
                    <CommonIcon name="loading" size={24} color="#ffffff" className="animate-spin mr-2" />
                    {t('organizations.acceptInvitation.accepting')}
                  </>
                ) : (
                  <>
                    <CommonIcon name="user-check" size={24} color="#22c55e" className="mr-2" />
                    {t('organizations.acceptInvitation.accept')}
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
