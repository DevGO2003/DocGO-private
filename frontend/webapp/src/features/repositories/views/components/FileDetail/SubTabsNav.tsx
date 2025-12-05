import React from 'react';
import { Tabs, TabList, CommonTab } from '@shared/components';

/**
 * @deprecated Use GenericSubTabsNav with tabsConfig in HeaderControlLayout instead
 * This component will be removed in future versions
 */
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
    <Tabs className="border-b mb-4" style={{ borderColor: '#e5e7eb' }}>
      <TabList>
        {subTabs.map(t => (
          <CommonTab
            key={t.id}
            value={t.id}
            activeValue={activeSubTab}
            onSelect={() => !loading && onChange(t.id)}
            disabled={loading}
          >
            {loading ? <span className="inline-block rounded" style={{ backgroundColor: '#e5e7eb' }} ></span> : t.label}
          </CommonTab>
        ))}
      </TabList>
    </Tabs>
  );
};

