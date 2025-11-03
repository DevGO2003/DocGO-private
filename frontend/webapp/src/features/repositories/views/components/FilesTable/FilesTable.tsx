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
            <TableHeader><Text className="text-xs font-medium uppercase" style={ color: '#6b7280' }>File</Text></TableHeader>
            <TableHeader><Text className="text-xs font-medium uppercase" style={ color: '#6b7280' }>Trạng thái</Text></TableHeader>
            <TableHeader><Text className="text-xs font-medium uppercase" style={ color: '#6b7280' }>Loại</Text></TableHeader>
            <TableHeader><Text className="text-xs font-medium uppercase" style={ color: '#6b7280' }>Kích thước</Text></TableHeader>
            <TableHeader><Text className="text-xs font-medium uppercase" style={ color: '#6b7280' }>Tải lên lúc</Text></TableHeader>
            <TableHeader></TableHeader>
          </TableRow>
        </thead>
        <tbody>
          {items.map((f) => (
            <TableRow key={f.fileId}>
              <TableCell><Text className="text-sm" style={ color: '#111827' }>{f.fileName}</Text></TableCell>
              <TableCell><Text className="text-sm" style={ color: '#4b5563' }>{f.status || '-'}</Text></TableCell>
              <TableCell><Text className="text-sm" style={ color: '#4b5563' }>{f.contractType || '-'}</Text></TableCell>
              <TableCell><Text className="text-sm" style={ color: '#4b5563' }>{(f.fileSize ?? 0)} bytes</Text></TableCell>
              <TableCell><Text className="text-sm" style={ color: '#4b5563' }>{f.uploadedAt ? new Date(f.uploadedAt).toLocaleString('vi-VN') : '-'}</Text></TableCell>
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

