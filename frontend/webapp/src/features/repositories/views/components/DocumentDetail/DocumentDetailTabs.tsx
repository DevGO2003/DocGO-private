import React from 'react';
import { Card, Stack, Grid, Text } from '@shared/components';

interface Props {
  documentData: any;
  contractSummary: any;
  activeMainTab: string;
  activeSubTab: string;
}

export const DocumentDetailTabs: React.FC<Props> = ({ documentData, contractSummary, activeMainTab, activeSubTab }) => {
  if (!documentData) return null;

  return (
    <Card padding="4">
      {activeMainTab === 'contracts' && (
        <div>
          {activeSubTab === 'basic-info' && (
            <Stack gap="3">
              <Text size="sm"><Text as="span" color="gray500">Mô tả:</Text> <Text as="span" color="gray900">{documentData.description || '-'}</Text></Text>
              <Text size="sm"><Text as="span" color="gray500">Trạng thái:</Text> <Text as="span" color="gray900">{documentData.status || '-'}</Text></Text>
              <Text size="sm"><Text as="span" color="gray500">Loại hợp đồng:</Text> <Text as="span" color="gray900">{documentData.contractType || '-'}</Text></Text>
              <Text size="sm"><Text as="span" color="gray500">Tags:</Text> <Text as="span" color="gray900">{(documentData.tags||[]).join(', ') || '-'}</Text></Text>
            </Stack>
          )}
          {activeSubTab === 'key-clauses' && (
            <Text size="sm" color="gray700">(Mock) Điều khoản chính chưa có dữ liệu thật.</Text>
          )}
          {activeSubTab === 'payment' && (
            <Text size="sm" color="gray700">(Mock) Thông tin thanh toán chưa có dữ liệu thật.</Text>
          )}
        </div>
      )}

      {activeMainTab === 'overview' && (
        <div>
          {activeSubTab === 'details' && (
            <Text size="xs" color="gray700" as="pre">{documentData.content || '(Không có nội dung)'}</Text>
          )}
          {activeSubTab === 'metadata' && (
            <Grid cols={{base:1, md:2}} gap="4">
              <div>
                <Text color="gray500">Original Filename</Text>
                <Text fontWeight="medium">{documentData?.fileSystemMetadata?.originalFilename || '-'}</Text>
              </div>
              <div>
                <Text color="gray500">Original Size</Text>
                <Text fontWeight="medium">{documentData?.fileSystemMetadata?.originalFileSize ?? '-'}</Text>
              </div>
            </Grid>
          )}
        </div>
      )}

      {activeMainTab === 'comments' && (
        <Text size="sm" color="gray700">(Mock) Danh sách bình luận.</Text>
      )}
    </Card>
  );
}
