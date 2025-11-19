import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Card } from '@shared/components';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { useAcceptInvite } from '@features/repositories/models/api/repositoryApi';
import { REPOSITORY_ROUTES, buildPath } from '@constants';

export const AcceptRepositoryInvite: React.FC = () => {
  const { token } = useParams<{ token: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const acceptInviteMutation = useAcceptInvite();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [repositoryId, setRepositoryId] = useState<string>('');

  useEffect(() => {
    const handleAcceptInvite = async () => {
      if (!token) {
        setStatus('error');
        setErrorMessage('Token mời không hợp lệ');
        return;
      }

      try {
        console.log('[AcceptInvite] Accepting invite with token:', token);
        await acceptInviteMutation.mutateAsync(token);
        console.log('[AcceptInvite] Invite accepted successfully');
        
        // Get repository ID from query params if available
        const repoId = searchParams.get('repositoryId');
        if (repoId) {
          setRepositoryId(repoId);
        }
        
        setStatus('success');
      } catch (error: any) {
        console.error('[AcceptInvite] Failed to accept invite:', error);
        setStatus('error');
        setErrorMessage(
          error?.response?.data?.message || 
          error?.message || 
          'Không thể chấp nhận lời mời. Vui lòng thử lại.'
        );
      }
    };

    handleAcceptInvite();
  }, [token, searchParams, acceptInviteMutation]);

  const handleGoToRepository = () => {
    if (repositoryId) {
      navigate(buildPath(REPOSITORY_ROUTES.DETAIL, { id: repositoryId }));
    } else {
      navigate(REPOSITORY_ROUTES.LIST);
    }
  };

  const handleGoToRepositories = () => {
    navigate(REPOSITORY_ROUTES.LIST);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <Card className="max-w-md w-full p-8">
        {status === 'loading' && (
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Đang xử lý lời mời...
            </h2>
            <p className="text-gray-600">
              Vui lòng đợi trong giây lát
            </p>
          </div>
        )}

        {status === 'success' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CommonIcon name="check" className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Chấp nhận lời mời thành công!
            </h2>
            <p className="text-gray-600 mb-6">
              Bạn đã được thêm vào repository. Bạn có thể bắt đầu làm việc ngay bây giờ.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleGoToRepositories}
                className="flex-1"
              >
                Danh sách Repository
              </Button>
              {repositoryId && (
                <Button
                  onClick={handleGoToRepository}
                  className="flex-1"
                >
                  Đến Repository
                </Button>
              )}
            </div>
          </div>
        )}

        {status === 'error' && (
          <div className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CommonIcon name="x" className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Không thể chấp nhận lời mời
            </h2>
            <p className="text-gray-600 mb-6">
              {errorMessage}
            </p>
            <Button
              onClick={handleGoToRepositories}
              variant="outline"
            >
              Quay lại Danh sách Repository
            </Button>
          </div>
        )}
      </Card>
    </div>
  );
};
