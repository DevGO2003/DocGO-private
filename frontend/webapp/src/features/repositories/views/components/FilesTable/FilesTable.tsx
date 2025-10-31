import React from 'react';
import { Button } from '@shared/components';
import { REPOSITORY_ROUTES, buildPath } from '@constants';
import { Link } from 'react-router-dom';
import { Table, TableHeader, TableRow, TableCell, Text, TableContainer } from '@shared/components';

export interface FilesTableItem {
  fileId: string;
  fileName: string;
  status?: string;
  contractType?: string;
  fileSize?: number;
  uploadedAt?: string;
}

export const FilesTable: React.FC<{ items: FilesTableItem[]; repositoryId: string }>
  = ({ items, repositoryId }) => {
  return (
    <TableContainer>
      <Table>
        <thead>
          <TableRow>
            <TableHeader><Text className="text-xs font-medium text-gray-500 uppercase">File</Text></TableHeader>
            <TableHeader><Text className="text-xs font-medium text-gray-500 uppercase">Trạng thái</Text></TableHeader>
            <TableHeader><Text className="text-xs font-medium text-gray-500 uppercase">Loại</Text></TableHeader>
            <TableHeader><Text className="text-xs font-medium text-gray-500 uppercase">Kích thước</Text></TableHeader>
            <TableHeader><Text className="text-xs font-medium text-gray-500 uppercase">Tải lên lúc</Text></TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
        </thead>
        <tbody>
          {items.map((f) => (
            <TableRow key={f.fileId}>
              <TableCell><Text className="text-sm text-gray-900 break-all">{f.fileName}</Text></TableCell>
              <TableCell><Text className="text-sm text-gray-600">{f.status || '-'}</Text></TableCell>
              <TableCell><Text className="text-sm text-gray-600">{f.contractType || '-'}</Text></TableCell>
              <TableCell><Text className="text-sm text-gray-600">{(f.fileSize ?? 0)} bytes</Text></TableCell>
              <TableCell><Text className="text-sm text-gray-600">{f.uploadedAt ? new Date(f.uploadedAt).toLocaleString('vi-VN') : '-'}</Text></TableCell>
              <TableCell>
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
    </TableContainer>
  );
}

