import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, CardContent } from '@shared/components';
import { Flex, Text } from '@shared/components';
import { ControlMainLayout } from '@shared/layouts';
import { fileAPI } from '@features/upload/services/file-api';
import { MainTabsNav } from '@features/repositories/views/components/FileDetail/MainTabsNav';
import { SubTabsNav } from '@features/repositories/views/components/FileDetail/SubTabsNav';
import { FileDetailTabs } from '@features/repositories/views/components/FileDetail/FileDetailTabs';

interface FileDetailData {
  fileId: string;
  fileName: string;
  size: number;
  uploadedAt: string;
}

export const RepositoryFileDetail: React.FC = () => {
  const { id, fileId } = useParams<{ id: string; fileId: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<FileDetailData | null>(null);
  const [documentData, setDocumentData] = useState<any>(null);
  const [contractSummary, setContractSummary] = useState<any>(null);
  const [activeMainTab, setActiveMainTab] = useState<string>('overview');
  const [activeSubTab, setActiveSubTab] = useState<string>('details');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const resp = await fileAPI.getFileDetails(fileId || '');
        if (!isMounted) return;
        const apiData = resp.data;
        const basic = apiData as FileDetailData;
        setFile(basic);
        
        // Map API data to full structure expected by tabs (like src-old)
        const mapped = {
          id: basic.fileId,
          title: basic.fileName,
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
          content: (apiData as any)?.content?.plaintext || '',
          ocrContent: (apiData as any)?.content?.ocr || '',
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
        setError(e?.message || 'Không thể tải chi tiết tệp');
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    if (fileId) fetchData();
    return () => {
      isMounted = false;
    };
  }, [fileId]);

  const handleBack = () => {
    navigate('/repositories/' + (id ?? ''));
  };

  return (
    <ControlMainLayout
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
      headerRight={
        <div className="w-full">
          <Flex wrap gap={2.5} align="center" justify="end">
            <Button variant="outline">Chỉnh sửa</Button>
            <Button variant="outline">Gửi duyệt</Button>
            <Button variant="outline">Tạo phiên bản</Button>
            <Button variant="outline">Gửi ký</Button>
            <Button variant="outline">Tải PDF</Button>
            <Button variant="outline">Bình luận</Button>
            <Button variant="destructive">Xóa</Button>
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
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <Text className="text-red-700 text-center">{error}</Text>
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={handleBack}>Quay lại repository</Button>
              </div>
            </CardContent>
          </Card>
        )}
        {!file && !isLoading && !error && (
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-600">Không tìm thấy tệp.</p>
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={handleBack}>Quay lại repository</Button>
              </div>
            </CardContent>
          </Card>
        )}
        {file && (
          <FileDetailTabs
            fileData={documentData}
            contractSummary={contractSummary}
            activeMainTab={activeMainTab}
            activeSubTab={activeSubTab}
          />
        )}
      </div>
    </ControlMainLayout>
  );
}
