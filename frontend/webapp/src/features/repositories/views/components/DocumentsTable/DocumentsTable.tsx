import React from 'react';
import { Button } from '@shared/components';
import { REPOSITORY_ROUTES, buildPath } from '@constants';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableRow, TableCell, Text } from '@shared/components';

export interface DocumentsTableItem {
  fileId: string;
  fileName: string;
  status?: string;
  contractType?: string;
  fileSize?: number;
  uploadedAt?: string;
}

export const DocumentsTable: React.FC<{ items: DocumentsTableItem[]; repositoryId: string }>
  = ({ items, repositoryId }) => {
  return (
    <Table.Container>
      <Table minWidth="full" dividerColor="gray200">
        <thead>
          <TableRow bg="gray50">
            <TableHeader align="left"><Text size="xs" fontWeight="medium" color="gray500" textTransform="uppercase">Tài liệu</Text></TableHeader>
            <TableHeader align="left"><Text size="xs" fontWeight="medium" color="gray500" textTransform="uppercase">Trạng thái</Text></TableHeader>
            <TableHeader align="left"><Text size="xs" fontWeight="medium" color="gray500" textTransform="uppercase">Loại</Text></TableHeader>
            <TableHeader align="left"><Text size="xs" fontWeight="medium" color="gray500" textTransform="uppercase">Kích thước</Text></TableHeader>
            <TableHeader align="left"><Text size="xs" fontWeight="medium" color="gray500" textTransform="uppercase">Tải lên lúc</Text></TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
        </thead>
        <tbody>
          {items.map((f) => (
            <TableRow key={f.fileId}>
              <TableCell><Text size="sm" color="gray900" isBreakAll>{f.fileName}</Text></TableCell>
              <TableCell><Text size="sm" color="gray600">{f.status || '-'}</Text></TableCell>
              <TableCell><Text size="sm" color="gray600">{f.contractType || '-'}</Text></TableCell>
              <TableCell><Text size="sm" color="gray600">{(f.fileSize ?? 0)} bytes</Text></TableCell>
              <TableCell><Text size="sm" color="gray600">{f.uploadedAt ? new Date(f.uploadedAt).toLocaleString('vi-VN') : '-'}</Text></TableCell>
              <TableCell align="right">
                <Link
                  to={buildPath(REPOSITORY_ROUTES.FILE_DETAIL, { id: repositoryId, fileId: f.fileId })}
                >
                  <Button variant="outline">Xem chi tiết</Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </Table.Container>
  );
}
