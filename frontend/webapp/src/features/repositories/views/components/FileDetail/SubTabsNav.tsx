import React from 'react';
import { Button } from '@shared/components';

interface Props {
  activeMainTab: string;
  activeSubTab: string;
  onChange: (tabId: string) => void;
  loading?: boolean;
}

export const SubTabsNav: React.FC<Props> = ({ activeMainTab, activeSubTab, onChange, loading }) => {
  const subTabsMap: Record<string, { id: string; label: string }[]> = {
    contracts: [
      { id: 'contract-overview', label: 'Tổng quan HĐ' },
      { id: 'parties', label: 'Các bên' },
      { id: 'payment', label: 'Thanh toán' },
      { id: 'clauses', label: 'Điều khoản' },
      { id: 'risk', label: 'Rủi ro' },
      { id: 'reminders', label: 'Nhắc nhở' },
      { id: 'compliance', label: 'Tuân thủ' },
    ],
    overview: [
      { id: 'details', label: 'Chi tiết' },
      { id: 'content', label: 'Nội dung' },
      { id: 'ocr', label: 'Nội dung OCR' },
      { id: 'metadata', label: 'Siêu dữ liệu' },
      { id: 'notes', label: 'Ghi chú' },
      { id: 'history', label: 'Lịch sử' },
      { id: 'permissions', label: 'Quyền hạn' },
    ],
    comments: [
      { id: 'comments-list', label: 'Danh sách bình luận' },
    ],
  };

  const subTabs = subTabsMap[activeMainTab] ?? [];

  return (
    <div className="flex gap-2 mb-4">
      {subTabs.map(t => (
        <Button
          key={t.id}
          variant={activeSubTab === t.id ? 'default' : 'outline'}
          size="sm"
          onClick={() => !loading && onChange(t.id)}
          disabled={loading}
          className={activeSubTab === t.id ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
        >
          {loading ? <span className="inline-block w-16 h-4 bg-gray-200 animate-pulse rounded"></span> : t.label}
        </Button>
      ))}
    </div>
  );
};

