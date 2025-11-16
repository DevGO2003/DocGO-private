import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, RefreshButton, Text } from '@shared/components';
import RepositoryLayout from '../../../layouts/RepositoryLayout';
import { fetchFileById } from '@features/upload/models/api/fileApi';
import { FileDetailTabs } from '@features/repositories/views/components/FileDetail/FileDetailTabs';
import { NOT_FOUND_PATH } from '@constants';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { deleteFile, downloadFile } from '@features/repositories/services/fileDetailApi';
import { useContractApproval } from '@features/approvals/hooks/useContractApproval';
import { ApprovalActionModal } from '@features/approvals/components/ApprovalActionModal';
import { ApprovalLevel } from '@features/approvals/types/approval.types';
import { useAppSelector } from '@store/hooks';

interface FileDetailData {
  fileId: string;
  fileName: string;
  size: number;
  uploadedAt: string;
}

export const RepositoryFileDetail: React.FC = () => {
  const { id, fileId } = useParams<{ id: string; fileId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<FileDetailData | null>(null);
  const [documentData, setDocumentData] = useState<any>(null);
  const [contractSummary, setContractSummary] = useState<any>(null);
  const [activeMainTab, setActiveMainTab] = useState<string>('overview');
  const [activeSubTab, setActiveSubTab] = useState<string>('details');
  const [notFound, setNotFound] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  // Approval workflow states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showStartApprovalModal, setShowStartApprovalModal] = useState(false);

  // Get user info from Redux store
  const authUser = useAppSelector((state) => state.auth.user);

  // Get organization role and permissions from localStorage
  const orgRole = localStorage.getItem('organizationRole') || authUser?.role || 'MEMBER';
  const orgPermissions = (localStorage.getItem('organizationPermissions') || '').split(',').filter(Boolean);

  const currentUser = {
    role: orgRole,
    permissions: orgPermissions
  };

  // Use approval hook
  const {
    workflow,
    loading: approvalLoading,
    error: approvalError,
    currentLevel,
    startApproval,
    approve,
    reject,
    refresh: refreshApproval
  } = useContractApproval({
    contractId: fileId || '',
    userRole: currentUser.role,
    userPermissions: currentUser.permissions,
    autoRefresh: true,
    refreshInterval: 30000
  });

  useEffect(() => {
    // Kiểm tra repository ID có hợp lệ không
    if (!id || !fileId) {
      setNotFound(true);
      return;
    }

    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const resp = await fetchFileById(fileId || '');
        if (!isMounted) return;

        // Kiểm tra xem file có tồn tại không
        if (!resp || !(resp as any).data) {
          setNotFound(true);
          return;
        }

        const apiData = (resp as any).data;
        const basic = apiData as FileDetailData;
        setFile(basic);

        // Map API data to full structure expected by tabs (like src-old)
        const mapped = {
          id: (apiData as any)?.id ?? basic.fileId,
          title: basic.fileName,
          overview: (apiData as any)?.overview ?? undefined,
          description: (apiData as any)?.description || '',
          status: (apiData as any)?.status || 'ACTIVE',
          contractType: (apiData as any)?.contractType || 'GENERAL',
          tags: (apiData as any)?.tags || [],
          parties: (apiData as any)?.contract?.parties || [],
          effectiveDate: (apiData as any)?.contract?.effectiveDate || null,
          expiryDate: (apiData as any)?.contract?.expiryDate || null,
          totalValue: (apiData as any)?.contract?.totalValue || null,
          currency: (apiData as any)?.contract?.currency || 'VND',
          project: (apiData as any)?.contract?.project || null,
          department: (apiData as any)?.contract?.department || null,
          priority: (apiData as any)?.contract?.priority || null,
          confidentiality: (apiData as any)?.contract?.confidentiality || null,
          summary: (apiData as any)?.contract?.summary || '',
          paymentDetails: {
            totalValue: (apiData as any)?.contract?.totalValue || null,
            currency: (apiData as any)?.contract?.currency || 'VND',
            schedule: (apiData as any)?.contract?.payment?.schedule || [],
            paymentMethod: (apiData as any)?.contract?.payment?.method || '',
          },
          keyClauses: (apiData as any)?.contract?.clauses?.key || [],
          unfavorableClauses: (apiData as any)?.contract?.clauses?.unfavorable || [],
          reminders: (apiData as any)?.contract?.reminders || [],
          riskAssessment: {
            riskLevel: (apiData as any)?.contract?.risk?.riskLevel || null,
            riskFactors: (apiData as any)?.contract?.risk?.factors || [],
            mitigationMeasures: (apiData as any)?.contract?.risk?.mitigations || [],
          },
          complianceStatus: {
            status: (apiData as any)?.contract?.compliance?.status || null,
            issues: (apiData as any)?.contract?.compliance?.issues || [],
            recommendations: (apiData as any)?.contract?.compliance?.recommendations || [],
          },
          content: (apiData as any)?.content?.ocr?.text || '',
          ocr: {
            engine: (apiData as any)?.content?.ocr?.engine || (apiData as any)?.ocrEngine || null,
            confidence: (apiData as any)?.content?.ocr?.confidence ?? (apiData as any)?.ocrConfidence ?? null,
            processedAt: (apiData as any)?.content?.ocr?.processedAt || null,
            processingTime: (apiData as any)?.content?.ocr?.processingTime ?? null,
            status: (apiData as any)?.content?.ocr?.status || (apiData as any)?.ocrStatus || null,
            error: (apiData as any)?.content?.ocr?.error || null,
          },
          authorNotes: (apiData as any)?.notes || [],
          history: (apiData as any)?.history || [],
          permissions: (apiData as any)?.permissions || [],
          fileSystemMetadata: {
            dateModified: (apiData as any)?.metadata?.fileSystem?.dateModified || null,
            dateAdded: (apiData as any)?.metadata?.fileSystem?.dateAdded || null,
            mediaFilename: (apiData as any)?.metadata?.fileSystem?.mediaFilename || '',
            originalFilename: (apiData as any)?.metadata?.fileSystem?.originalFilename || basic.fileName,
            originalMD5: (apiData as any)?.metadata?.fileSystem?.originalMD5 || '',
            originalFileSize: (apiData as any)?.metadata?.fileSystem?.originalFileSize || basic.size,
            originalMimeType: (apiData as any)?.metadata?.fileSystem?.originalMimeType || null,
            archiveMD5: (apiData as any)?.metadata?.fileSystem?.archiveMD5 || '',
            archiveFileSize: (apiData as any)?.metadata?.fileSystem?.archiveFileSize || null,
          },
          originalDocumentMetadata: {
            dcFormat: (apiData as any)?.metadata?.originalDocument?.dcFormat || null,
            dcTitle: (apiData as any)?.metadata?.originalDocument?.dcTitle || basic.fileName,
            dcCreator: (apiData as any)?.metadata?.originalDocument?.dcCreator || null,
            dcDescription: (apiData as any)?.metadata?.originalDocument?.dcDescription || '',
            xmpCreateDate: (apiData as any)?.metadata?.originalDocument?.xmpCreateDate || null,
            xmpCreatorTool: (apiData as any)?.metadata?.originalDocument?.xmpCreatorTool || null,
            xmpModifyDate: (apiData as any)?.metadata?.originalDocument?.xmpModifyDate || null,
          },
        };
        setDocumentData(mapped);
        setContractSummary(null);
      } catch (e: any) {
        if (!isMounted) return;
        // Nếu lỗi 404 hoặc file không tồn tại, redirect sang trang 404
        if (
          e?.response?.status === 404 ||
          e?.response?.data?.statusCode === 404 ||
          e?.message?.includes('404')
        ) {
          setNotFound(true);
        } else {
          setError(e?.message || 'Không thể tải chi tiết tệp');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (fileId) fetchData();
    return () => {
      isMounted = false;
    };
  }, [fileId, id]);

  // Redirect sang 404 nếu repository hoặc file không tồn tại
  useEffect(() => {
    if (notFound) {
      navigate(NOT_FOUND_PATH, { replace: true });
    }
  }, [notFound, navigate]);

  const handleBack = () => {
    navigate('/repositories/' + (id ?? ''));
  };

  const handleDownloadPDF = async () => {
    if (!fileId || isDownloading) return;

    try {
      setIsDownloading(true);
      console.log('Downloading file:', fileId);

      // Download file with authentication via automation-service
      const response: any = await downloadFile(fileId);

      // Extract blob from response (apiClient may wrap it)
      const blob = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], {
          type: response.headers?.['content-type'] || 'application/octet-stream'
        });

      // Get filename from Content-Disposition header or use default
      let fileName = documentData?.title || file?.fileName || 'document';
      const contentDisposition = response.headers?.['content-disposition'];
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="?(.+)"?/i);
        if (fileNameMatch && fileNameMatch[1]) {
          fileName = fileNameMatch[1];
        }
      }

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;

      // Trigger download
      document.body.appendChild(link);
      link.click();

      // Cleanup
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('✅ Download successful:', fileName);
    } catch (error: any) {
      console.error('❌ Download failed:', error);
      alert('Không thể tải xuống file. Vui lòng thử lại.');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = async () => {
    if (!fileId) return;

    // Confirm deletion
    const confirmMessage = `Bạn có chắc chắn muốn xóa tài liệu "${documentData?.title || file?.fileName}"?\n\nHành động này không thể hoàn tác.`;
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      setIsLoading(true);

      // Call delete API
      await deleteFile(fileId);

      console.log('✅ File deleted successfully');
      alert('Đã xóa tài liệu thành công!');

      // Navigate to organization workspace with contracts tab
      const orgId = documentData?.organizationId || documentData?.overview?.organizationId;
      if (orgId) {
        navigate(`/organizations/${orgId}/workspace?tab=contracts`);
      } else {
        // Fallback to repository
        navigate(`/repositories/${id}`);
      }

    } catch (error: any) {
      console.error('❌ Delete failed:', error);
      setError(error?.message || 'Không thể xóa tài liệu');
      alert('Không thể xóa tài liệu. Vui lòng thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    console.log('[RepositoryFileDetail] Refreshing data...');
    setIsRefreshing(true);
    try {
      // Invalidate file detail query
      await queryClient.invalidateQueries({ queryKey: ['file', fileId] });

      // Refetch data manually
      const resp = await fetchFileById(fileId || '');
      if (resp && (resp as any).data) {
        const apiData = (resp as any).data;
        const basic = apiData as FileDetailData;
        setFile(basic);

        // Re-map data
        const mapped = {
          id: (apiData as any)?.id ?? basic.fileId,
          title: basic.fileName,
          overview: (apiData as any)?.overview ?? undefined,
          description: (apiData as any)?.description || '',
          status: (apiData as any)?.status || 'ACTIVE',
          contractType: (apiData as any)?.contractType || 'GENERAL',
          tags: (apiData as any)?.tags || [],
          parties: (apiData as any)?.contract?.parties || [],
          effectiveDate: (apiData as any)?.contract?.effectiveDate || null,
          expiryDate: (apiData as any)?.contract?.expiryDate || null,
          totalValue: (apiData as any)?.contract?.totalValue || null,
          currency: (apiData as any)?.contract?.currency || 'VND',
          project: (apiData as any)?.contract?.project || null,
          department: (apiData as any)?.contract?.department || null,
          priority: (apiData as any)?.contract?.priority || null,
          confidentiality: (apiData as any)?.contract?.confidentiality || null,
          summary: (apiData as any)?.contract?.summary || '',
          paymentDetails: {
            totalValue: (apiData as any)?.contract?.totalValue || null,
            currency: (apiData as any)?.contract?.currency || 'VND',
            schedule: (apiData as any)?.contract?.payment?.schedule || [],
            paymentMethod: (apiData as any)?.contract?.payment?.method || '',
          },
          keyClauses: (apiData as any)?.contract?.clauses?.key || [],
          unfavorableClauses: (apiData as any)?.contract?.clauses?.unfavorable || [],
          reminders: (apiData as any)?.contract?.reminders || [],
          riskAssessment: {
            riskLevel: (apiData as any)?.contract?.risk?.riskLevel || null,
            riskFactors: (apiData as any)?.contract?.risk?.factors || [],
            mitigationMeasures: (apiData as any)?.contract?.risk?.mitigations || [],
          },
          complianceStatus: {
            status: (apiData as any)?.contract?.compliance?.status || null,
            issues: (apiData as any)?.contract?.compliance?.issues || [],
            recommendations: (apiData as any)?.contract?.compliance?.recommendations || [],
          },
          content: (apiData as any)?.content?.ocr?.text || '',
        };
        setDocumentData(mapped);
        setContractSummary(mapped);
      }

      console.log('[RepositoryFileDetail] Refresh completed');
    } catch (error) {
      console.error('[RepositoryFileDetail] Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <RepositoryLayout
      title={documentData?.title || file?.fileName || 'Chi tiết tài liệu'}
      subtitle={file ? `Mã: ${file.fileId}` : undefined}
      breadcrumbs={[
        { label: 'Repositories', href: '/repositories' },
        { label: id ? `Repo ${id}` : 'Repository', href: id ? `/repositories/${id}` : '/repositories' },
        { label: 'Files', href: id ? `/repositories/${id}/files` : undefined },
        { label: 'Chi tiết', current: true },
      ]}
      loading={isLoading}
      loadingText="Đang tải chi tiết tệp..."
      onRefresh={handleRefresh}
      headerRight={
        <div className="w-full flex items-center" style={{ columnGap: '10px' }}>
          <div className="flex items-center" style={{ columnGap: '10px' }}>
            {!workflow && (
              <Button
                variant="outline"
                onClick={() => setShowStartApprovalModal(true)}
                disabled={!documentData?.totalValue}
              >
                <CommonIcon name="check" className="w-4 h-4 mr-2" /> Gửi duyệt
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleDownloadPDF}
              disabled={isDownloading || !file}
            >
              <CommonIcon name="download" className="w-4 h-4 mr-2" /> Tải tệp
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <CommonIcon name="trash" className="w-4 h-4 mr-2" /> Xóa
            </Button>
          </div>
          <div className="ml-auto">
            <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
          </div>
        </div>
      }
      tabsConfig={{
        mainTabs: [
          { id: 'overview', label: 'Tổng quan', icon: 'folder', disabled: false },
          {
            id: 'contracts',
            label: 'Hợp đồng',
            icon: 'file',
            disabled: !(documentData?.type === 'contract' || documentData?.contractType),
            disabledTooltip: 'File không phải hợp đồng'
          },
          { id: 'approval', label: 'Phê duyệt', icon: 'check-circle', disabled: false },
          { id: 'comments', label: 'Bình luận', icon: 'message', disabled: false },
        ],
        activeMainTab: activeMainTab,
        onMainTabChange: (tabId: string) => {
          if (!isLoading) {
            setActiveMainTab(tabId);
            if (tabId === 'contracts') setActiveSubTab('contract-overview');
            else if (tabId === 'overview') setActiveSubTab('details');
            else if (tabId === 'approval') setActiveSubTab('approval-status');
            else if (tabId === 'comments') setActiveSubTab('comments-list');
          }
        },
        subTabsMap: {
          contracts: [
            { id: 'contract-overview', label: 'Tổng quan HĐ', icon: 'info' },
            { id: 'parties', label: 'Các bên', icon: 'building' },
            { id: 'payment', label: 'Thanh toán', icon: 'dollar-sign' },
            { id: 'clauses', label: 'Điều khoản', icon: 'file-text' },
            { id: 'risk', label: 'Rủi ro', icon: 'alert-circle' },
            { id: 'reminders', label: 'Nhắc nhở', icon: 'bell' },
            { id: 'compliance', label: 'Tuân thủ', icon: 'tag' },
          ],
          overview: [
            { id: 'details', label: 'Chi tiết', icon: 'info' },
            { id: 'content', label: 'Nội dung', icon: 'file-text' },
            { id: 'ocr', label: 'Nội dung OCR', icon: 'file-text' },
            { id: 'metadata', label: 'Siêu dữ liệu', icon: 'tag' },
            { id: 'notes', label: 'Ghi chú', icon: 'message' },
            { id: 'history', label: 'Lịch sử', icon: 'clock' },
            { id: 'permissions', label: 'Quyền hạn', icon: 'lock' },
          ],
          comments: [
            { id: 'comments-list', label: 'Danh sách bình luận', icon: 'message' },
          ],
        },
        activeSubTab: activeSubTab,
        onSubTabChange: (tabId: string) => !isLoading && setActiveSubTab(tabId),
        loading: isLoading,
      }}
    >
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {approvalError && (
          <Card style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
            <CardContent className="p-4">
              <Text style={{ color: '#b91c1c' }}>{approvalError}</Text>
            </CardContent>
          </Card>
        )}

        {error && (
          <Card style={{ borderColor: '#fecaca', backgroundColor: '#fef2f2' }}>
            <CardContent className="p-6">
              <Text className="text-center" style={{ color: '#b91c1c' }}>{error}</Text>
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={handleBack}>Quay lại repository</Button>
              </div>
            </CardContent>
          </Card>
        )}
        {!file && !isLoading && !error && (
          <Card>
            <CardContent className="p-6">
              <p style={{ color: '#4b5563' }}>Không tìm thấy tệp.</p>
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={handleBack}>Quay lại repository</Button>
              </div>
            </CardContent>
          </Card>
        )}
        {file && (
          <FileDetailTabs
            fileData={documentData}
            activeMainTab={activeMainTab}
            activeSubTab={activeSubTab}
            workflow={workflow}
            userRole={currentUser.role}
            userPermissions={currentUser.permissions}
            onApprove={() => setShowApproveModal(true)}
            onReject={() => setShowRejectModal(true)}
          />
        )}

        {/* Approval Modals */}
        {showStartApprovalModal && (
          <ApprovalActionModal
            isOpen={showStartApprovalModal}
            onClose={() => setShowStartApprovalModal(false)}
            action="approve"
            level={ApprovalLevel.LEGAL}
            contractTitle={documentData?.title || 'Hợp đồng'}
            onSubmit={async (comment) => {
              try {
                await startApproval(comment);
                setShowStartApprovalModal(false);
                alert('✅ Đã gửi phê duyệt thành công!');
                await refreshApproval();
              } catch (err: any) {
                alert('❌ Lỗi: ' + err.message);
              }
            }}
          />
        )}
        
        {currentLevel && (
          <>
            <ApprovalActionModal
              isOpen={showApproveModal}
              onClose={() => setShowApproveModal(false)}
              action="approve"
              level={currentLevel}
              contractTitle={documentData?.title || 'Hợp đồng'}
              onSubmit={async (comment) => {
                try {
                  await approve(comment);
                  setShowApproveModal(false);
                  alert('✅ Đã phê duyệt thành công!');
                  await refreshApproval();
                } catch (err: any) {
                  alert('❌ Lỗi: ' + err.message);
                }
              }}
            />
            
            <ApprovalActionModal
              isOpen={showRejectModal}
              onClose={() => setShowRejectModal(false)}
              action="reject"
              level={currentLevel}
              contractTitle={documentData?.title || 'Hợp đồng'}
              onSubmit={async (comment) => {
                try {
                  await reject(comment);
                  setShowRejectModal(false);
                  alert('❌ Đã từ chối!');
                  await refreshApproval();
                } catch (err: any) {
                  alert('❌ Lỗi: ' + err.message);
                }
              }}
            />
          </>
        )}
      </div>
    </RepositoryLayout>
  );
}
