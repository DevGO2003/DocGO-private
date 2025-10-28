import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, LoadingSpinner, Card, CardContent, CardHeader, CardTitle } from '@shared/components';
import { Flex, Text } from '@shared/components';
import { fileAPI } from '@features/upload/services/file-api';
import { DetailHeader } from '@features/repositories/views/components/DocumentDetail/DetailHeader';
import { MainTabsNav } from '@features/repositories/views/components/DocumentDetail/MainTabsNav';
import { SubTabsNav } from '@features/repositories/views/components/DocumentDetail/SubTabsNav';
import { DocumentDetailTabs } from '@features/repositories/views/components/DocumentDetail/DocumentDetailTabs';

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
  const [activeMainTab, setActiveMainTab] = useState<string>('contracts');
  const [activeSubTab, setActiveSubTab] = useState<string>('basic-info');

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const resp = await fileAPI.getFileDetails(fileId || '');
        if (!isMounted) return;
        const basic = resp.data as FileDetailData;
        setFile(basic);
        // Map to documentData structure expected by tabs (mock fields)
        const mapped = {
          id: basic.fileId,
          title: basic.fileName,
          description: '',
          status: 'ACTIVE',
          contractType: 'GENERAL',
          tags: [],
          parties: [],
          content: '',
          fileSystemMetadata: {
            originalFilename: basic.fileName,
            originalFileSize: basic.size,
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-5xl mx-auto p-6">
          <div className="flex items-center justify-center py-16">
            <LoadingSpinner text="Đang tải chi tiết tệp..." />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-5xl mx-auto p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-6">
              <Text className="text-red-700 text-center">{error}</Text>
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={handleBack}>Quay lại repository</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!file) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="max-w-5xl mx-auto p-6">
          <Card>
            <CardContent className="p-6">
              <p className="text-center text-gray-600">Không tìm thấy tệp.</p>
              <div className="flex justify-center mt-4">
                <Button variant="outline" onClick={handleBack}>Quay lại repository</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto p-6 space-y-6">
        <DetailHeader
          title={documentData?.title || file.fileName}
          subtitle={`Mã: ${file.fileId} · Loại: ${documentData?.contractType ?? 'GENERAL'} · Trạng thái: ${documentData?.status ?? 'ACTIVE'}`}
          breadcrumbs={[
            { label: 'Repositories', href: '/repositories' },
            { label: `Repo ${id}`, href: `/repositories/${id}` },
            { label: 'Files', href: `/repositories/${id}/files` },
            { label: 'Chi tiết', current: true },
          ]}
          right={
            <div className="w-full">
              <Flex wrap gap={8} align="center" justify="end">
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
        />

        <div className="mt-2">
          <MainTabsNav
            activeMainTab={activeMainTab}
            onChange={(tabId) => {
              setActiveMainTab(tabId);
              if (tabId === 'contracts') setActiveSubTab('basic-info');
              else if (tabId === 'overview') setActiveSubTab('details');
              else if (tabId === 'comments') setActiveSubTab('comments-list');
            }}
          />
          <SubTabsNav
            activeMainTab={activeMainTab}
            activeSubTab={activeSubTab}
            onChange={(tabId) => setActiveSubTab(tabId)}
          />
        </div>

        <DocumentDetailTabs
          documentData={documentData}
          contractSummary={contractSummary}
          activeMainTab={activeMainTab}
          activeSubTab={activeSubTab}
        />
      </div>
    </div>
  );
};
