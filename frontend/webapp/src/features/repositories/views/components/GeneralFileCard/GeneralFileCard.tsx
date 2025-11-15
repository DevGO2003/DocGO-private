import React from 'react';
import { Card, CardContent, Button, CommonIcon } from '@shared/components';
import { Checkbox } from '@shared/components';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { openPreview } from '@store/slices/previewPanelSlice';

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
  detailHref: string;
  openUrl?: string;
  downloadUrl?: string;
}

export const GeneralFileCard: React.FC<GeneralFileCardProps> = ({ item, right, isSelected, onSelect, detailHref, openUrl, downloadUrl }) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const [showPreview, setShowPreview] = React.useState(false);
  const [previewPos, setPreviewPos] = React.useState<{ x: number; y: number } | null>(null);
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
      <CardContent className="p-4 pb-14">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
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
            <div className="mt-2 space-y-1 text-xs" style={{ color: '#6b7280' }} >
              {item.totalValue && <div>Value: {item.totalValue.toLocaleString()} {item.currency}</div>}
              {item.parties && <div>{t('fileCard.parties')}: {item.parties.map(p => p.name).join(', ')}</div>}
              {item.riskLevel && <span className={`px-1 py-0.5 rounded text-xs ${item.riskLevel === 'LOW' ? 'bg-green-100' : 'bg-yellow-100'}`}>{item.riskLevel}</span>}
              {item.reminders && <div>Reminders: {item.reminders.length}</div>}
            </div>
          <div className="mt-2 text-xs" style={{ color: '#6b7280' }} >
            {(item.fileType || 'file')} · {(item.fileSize ?? 0)} bytes · {item.uploadedAt ? new Date(item.uploadedAt).toLocaleString() : ''}
          </div>
        </div>
        {right && (
          <div className="flex flex-col items-end gap-4 flex-shrink-0 min-w-[140px]">
            {React.Children.map(React.Children.toArray(right), (child, index) => (
              <div key={index} className="w-full flex justify-end">
                {child}
              </div>
            ))}
          </div>
        )}
      </div>
      </CardContent>
      <div className="absolute inset-x-0 bottom-0 z-10">
        <div className="flex rounded-none border-t" style={{ borderColor: '#e5e7eb' }}>
          <Link to={detailHref} className="flex-1">
            <Button variant="ghost" className="w-full h-10">
              <CommonIcon name="file-text" className="mr-2 h-4 w-4" />
              {t('fileCard.viewDetails')}
            </Button>
          </Link>
          <button
            className="flex-1"
            onClick={() => {
              dispatch(openPreview({
                fileId: item.fileId,
                fileName: item.fileName,
                fileType: item.fileType || 'file',
              }));
            }}
            onMouseEnter={(e) => {
              const rect = (e.currentTarget as HTMLButtonElement).getBoundingClientRect();
              setPreviewPos({ x: rect.left + rect.width / 2, y: rect.top });
              setShowPreview(true);
            }}
            onMouseLeave={() => {
              setShowPreview(false);
              setPreviewPos(null);
            }}
          >
            <Button variant="ghost" className="w-full h-10">
              <CommonIcon name="search" className="mr-2 h-4 w-4" />
              {t('fileCard.preview')}
            </Button>
          </button>
          <button
            className="flex-1"
            onClick={() => {
              if (downloadUrl) window.open(downloadUrl, '_blank', 'noopener,noreferrer');
            }}
          >
            <Button variant="ghost" className="w-full h-10">
              <CommonIcon name="download" className="mr-2 h-4 w-4" />
              {t('fileCard.download')}
            </Button>
          </button>
        </div>
      </div>
      {showPreview && previewPos && (
        <div
          className="fixed z-50 bg-white border rounded-lg shadow p-3"
          style={{ left: previewPos.x, top: previewPos.y - 8, transform: 'translate(-50%, -100%)', borderColor: '#e5e7eb' }}
        >
          <div className="text-sm" style={{ color: '#374151' }}>
            <div className="font-medium truncate" title={item.fileName}>{item.fileName}</div>
            <div className="mt-1 text-xs" style={{ color: '#6b7280' }}>
              {(item.fileType || 'file')} · {(item.fileSize ?? 0)} bytes
            </div>
            <div className="mt-2 text-xs" style={{ color: '#6b7280' }}>
              {t('fileCard.openTabForFullContent')}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};
