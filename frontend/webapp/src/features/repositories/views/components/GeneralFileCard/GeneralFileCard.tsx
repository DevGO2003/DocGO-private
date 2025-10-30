import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

export interface GeneralFileItem {
  fileId: string;
  fileName: string;
  status?: string;
  contractType?: string;
  tags?: string[];
  fileType?: string;
  fileSize?: number;
  uploadedAt?: string;
  totalValue?: number;
  currency?: string;
  parties?: { name: string }[];
  riskLevel?: string;
  reminders?: string[];
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

interface GeneralFileCardProps {
  item: GeneralFileItem;
  right?: React.ReactNode;
  isSelected?: boolean;
  onSelect?: (checked: boolean) => void;
}

export const GeneralFileCard: React.FC<GeneralFileCardProps> = ({ item, right, isSelected, onSelect }) => {
  return (
    <Card className="relative group">
      {isSelected !== undefined && onSelect && (
        <div className="absolute top-2 left-2 z-10">
          <Checkbox 
            checked={isSelected} 
            onCheckedChange={onSelect}
            className="border-2 border-white shadow-md"
          />
        </div>
      )}
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="font-medium text-gray-900 truncate" title={item.fileName}>{item.fileName}</div>
            <div className="mt-1 flex flex-wrap items-center gap-2">
              {item.status && (
                <span className={`px-2 py-0.5 rounded-lg text-xs border ${badgeClass(item.status)}`}>{item.status}</span>
              )}
              {item.contractType && (
                <span className="px-2 py-0.5 rounded-lg text-xs border border-gray-200 text-gray-600">{item.contractType}</span>
              )}
              {item.tags?.slice(0, 3).map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded-lg text-xs bg-indigo-50 text-indigo-700">#{tag}</span>
              ))}
            </div>
            <div className="mt-2 space-y-1 text-xs text-gray-500">
              {item.totalValue && <div>Value: {item.totalValue.toLocaleString()} {item.currency}</div>}
              {item.parties && <div>Parties: {item.parties.map(p => p.name).join(', ')}</div>}
              {item.riskLevel && <span className={`px-1 py-0.5 rounded text-xs ${item.riskLevel === 'LOW' ? 'bg-green-100' : 'bg-yellow-100'}`}>{item.riskLevel}</span>}
              {item.reminders && <div>Reminders: {item.reminders.length}</div>}
            </div>
            <div className="mt-2 text-xs text-gray-500">
              {(item.fileType || 'file')} · {(item.fileSize ?? 0)} bytes · {item.uploadedAt ? new Date(item.uploadedAt).toLocaleString('vi-VN') : ''}
            </div>
          </div>
          {right}
        </div>
      </CardContent>
    </Card>
  );
};
