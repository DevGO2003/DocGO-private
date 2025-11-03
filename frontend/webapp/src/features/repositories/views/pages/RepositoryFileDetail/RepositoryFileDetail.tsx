import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button, Card, CardContent, RefreshButton } from '@shared/components';
import { Flex, Text } from '@shared/components';
import RepositoryLayout from '../../../layouts/RepositoryLayout';
import { fetchFileById } from '@features/upload/models/api/fileApi';
import { MainTabsNav } from '@features/repositories/views/components/FileDetail/MainTabsNav';
import { SubTabsNav } from '@features/repositories/views/components/FileDetail/SubTabsNav';
import { FileDetailTabs } from '@features/repositories/views/components/FileDetail/FileDetailTabs';
import { NOT_FOUND_PATH } from '@constants';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { updateFileDetails, deleteFile, downloadFile } from '@features/repositories/services/fileDetailApi';

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
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [editedData, setEditedData] = useState<any>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  const handleEdit = () => {
    setIsEditing(true);
    setEditedData(documentData);
  };

  const handleSave = async () => {
    if (!editedData || !fileId) return;
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Extract data to update
      const updateData = {
        title: editedData.overview?.title,
        documentType: editedData.overview?.documentType,
        status: editedData.overview?.status,
        tags: editedData.overview?.tags,
        archiveSerial: editedData.overview?.archiveSerial,
        dateCreated: editedData.overview?.dateCreated,
      };
      
      // Call API to update
      await updateFileDetails(fileId, updateData);
      
      // Refresh data
      const resp = await fetchFileById(fileId);
      if (resp && (resp as any).data) {
        const apiData = (resp as any).data;
        setDocumentData(apiData);
      }
      
      setIsEditing(false);
      setIsDirty(false);
      setEditedData(null);
      
      // Show success message (you can use toast/notification here)
      console.log('Lưu thành công!');
    } catch (e: any) {
      setError(e?.message || 'Không thể lưu thay đổi');
      console.error('Save error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveAndClose = async () => {
    await handleSave();
    handleBack();
  };

  const handleDiscard = () => {
    if (isDirty && !window.confirm('Bạn có muốn hủy các thay đổi?')) {
      return;
    }
    setIsEditing(false);
    setIsDirty(false);
    setEditedData(null);
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
        <div className="w-full">
          <Flex wrap gap={2.5} align="center" justify="end">
            <RefreshButton onClick={handleRefresh} loading={isRefreshing} />
            {isEditing ? (
              <>
                <Button variant="outline" onClick={handleDiscard}>
                  <CommonIcon name="x" className="w-4 h-4 mr-2" /> Hủy
                </Button>
                <Button variant="outline" onClick={handleSaveAndClose}>
                  <CommonIcon name="save" className="w-4 h-4 mr-2" /> Lưu & Đóng
                </Button>
                <Button onClick={handleSave}>
                  <CommonIcon name="save" className="w-4 h-4 mr-2" /> Lưu
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={handleEdit}>
                  <CommonIcon name="edit" className="w-4 h-4 mr-2" /> Chỉnh sửa
                </Button>
                <Button variant="outline">
                  <CommonIcon name="check" className="w-4 h-4 mr-2" /> Gửi duyệt
                </Button>
                <Button variant="outline">
                  <CommonIcon name="plus" className="w-4 h-4 mr-2" /> Tạo phiên bản
                </Button>
                <Button variant="outline">
                  <CommonIcon name="send" className="w-4 h-4 mr-2" /> Gửi ký
                </Button>
                <Button variant="outline">
                  <CommonIcon name="download" className="w-4 h-4 mr-2" /> Tải PDF
                </Button>
                <Button variant="outline">
                  <CommonIcon name="message" className="w-4 h-4 mr-2" /> Bình luận
                </Button>
                <Button variant="destructive">
                  <CommonIcon name="trash" className="w-4 h-4 mr-2" /> Xóa
                </Button>
              </>
            )}
          </Flex>
        </div>
      }
      primaryTabs={
        <MainTabsNav
          activeMainTab={activeMainTab}
          onChange={(tabId: string) => {
            if (!isLoading) {
              setActiveMainTab(tabId);
              if (tabId === 'contracts') setActiveSubTab('contract-overview');
              else if (tabId === 'overview') setActiveSubTab('details');
              else if (tabId === 'comments') setActiveSubTab('comments-list');
            }
          }}
          fileData={documentData}
          loading={isLoading}
        />
      }
      secondaryTabs={
        <SubTabsNav
          activeMainTab={activeMainTab}
          activeSubTab={activeSubTab}
          onChange={(tabId: string) => !isLoading && setActiveSubTab(tabId)}
          loading={isLoading}
        />
      }
    >
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {error && (
          <Card style={ borderColor: '#fecaca' } style={ backgroundColor: '#fef2f2' }>
            <CardContent className="p-6">
              <Text className="text-center" style={ color: '#b91c1c' }>{error}</Text>
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={handleBack}>Quay lại repository</Button>
              </div>
            </CardContent>
          </Card>
        )}
        {!file && !isLoading && !error && (
          <Card>
            <CardContent className="p-6">
              <p style={ color: '#4b5563' }>Không tìm thấy tệp.</p>
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
            isEditing={isEditing}
            onDataChange={(newData) => {
              setEditedData(newData);
              setIsDirty(true);
            }}
          />
        )}
      </div>
    </RepositoryLayout>
  );
}
