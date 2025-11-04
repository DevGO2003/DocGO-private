import React from 'react';
import { Card, CardContent, Checkbox } from '@shared/components';
import type { ContractFile } from '@features/repositories/models/types/file.types';

interface ContractFileCardProps {
  item: ContractFile;
  right?: React.ReactNode;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
}

const badgeClass = (status?: string) => {
  switch (status) {
    case 'DRAFT':
      return 'bg-gray-50 text-gray-700 border-gray-200';
    case 'PENDING_REVIEW':
      return 'bg-amber-50 text-amber-700 border-amber-200';
    case 'APPROVED':
      return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'ACTIVE':
      return 'bg-green-50 text-green-700 border-green-200';
    case 'EXPIRED':
      return 'bg-rose-50 text-rose-700 border-rose-200';
    case 'ARCHIVED':
      return 'bg-slate-50 text-slate-700 border-slate-200';
    default:
      return 'bg-gray-50 text-gray-700 border-gray-200';
  }
};

export const ContractFileCard: React.FC<ContractFileCardProps> = ({ item, right, isSelected, onSelect }) => {
  return (
    <Card className="relative group">
      {isSelected !== undefined && onSelect && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={onSelect}
            className="border-2 border-white" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-medium truncate" style={{ color: '#111827' }} title={item.fileName}>{item.fileName}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {item.status && (
                <span className={`px-2 py-0.5 rounded-lg text-xs border ${badgeClass(item.status)}`}>{item.status}</span>
              )}
              {item.contractType && (
                <span className="px-2 py-0.5 rounded-lg text-xs border" style={{ borderColor: '#e5e7eb', color: '#4b5563' }} >{item.contractType}</span>
              )}
              {item.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-lg text-xs" style={{ backgroundColor: '#eef2ff' }} >#{tag}</span>
              ))}
            </div>
            <div className="mt-2 space-y-1 text-xs" style={{ color: '#4b5563' }} >
              <div>
                {item.totalValue ? `${item.totalValue.toLocaleString()} ${item.currency || ''}` : ''}
              </div>
              {item.parties && item.parties.length > 0 && (
                <div>Parties: {item.parties.map(p => p.name).filter(Boolean).join(', ')}</div>
              )}
              {(item.effectiveDate || item.expiryDate) && (
                <div>
                  {item.effectiveDate ? new Date(item.effectiveDate).toLocaleDateString('vi-VN') : ''}
                  {item.expiryDate ? ` → ${new Date(item.expiryDate).toLocaleDateString('vi-VN')}` : ''}
                </div>
              )}
              {item.riskLevel && (
                <span className={`px-1 py-0.5 rounded text-xs ${item.riskLevel === 'LOW' ? 'bg-green-100' : item.riskLevel === 'HIGH' ? 'bg-red-100' : 'bg-yellow-100'}`}>{item.riskLevel}</span>
              )}
            </div>
            <div className="mt-2 text-xs" style={{ color: '#6b7280' }} >
              {(item.fileType || 'contract')} · {(item.fileSize ?? 0)} bytes · {item.uploadedAt ? new Date(item.uploadedAt).toLocaleString('vi-VN') : ''}
            </div>
          </div>
          {right}
        </div>
      </CardContent>
    </Card>
  );
};

export default ContractFileCard;
