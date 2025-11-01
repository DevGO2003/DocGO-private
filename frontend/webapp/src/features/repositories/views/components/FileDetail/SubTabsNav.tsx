import React from 'react';
import { Tabs, TabList, CommonTab } from '@shared/components';

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
    <Tabs className="mb-4">
      <TabList>
        {subTabs.map(t => (
          <CommonTab
            key={t.id}
            value={t.id}
            activeValue={activeSubTab}
            onSelect={() => !loading && onChange(t.id)}
            disabled={loading}
          >
            {loading ? <span className="inline-block w-16 h-4 bg-gray-200 animate-pulse rounded"></span> : t.label}
          </CommonTab>
        ))}
      </TabList>
    </Tabs>
  );
};

