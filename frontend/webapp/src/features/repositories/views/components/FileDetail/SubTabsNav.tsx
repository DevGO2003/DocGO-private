import React from 'react';
import { Button, Flex } from '@shared/components';

interface Props {
  activeMainTab: string;
  activeSubTab: string;
  onChange: (tabId: string) => void;
}

export const SubTabsNav: React.FC<Props> = ({ activeMainTab, activeSubTab, onChange }) => {
  const subTabsMap: Record<string, { id: string; label: string }[]> = {
    contracts: [
      { id: 'contract-overview', label: 'Tổng quan HĐ' },
      { id: 'basic-info', label: 'Thông tin cơ bản' },
      { id: 'parties', label: 'Các bên' },
      { id: 'key-clauses', label: 'Điều khoản chính' },
      { id: 'payment', label: 'Thanh toán' },
    ],
    overview: [
      { id: 'details', label: 'Chi tiết' },
      { id: 'content', label: 'Nội dung' },
      { id: 'ocr', label: 'Nội dung OCR' },
      { id: 'metadata', label: 'Metadata' },
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
    <Flex gap="2" mb="4">
      {subTabs.map(t => (
        <Button
          key={t.id}
          variant={activeSubTab === t.id ? 'tab-active' : 'tab'}
          size="sm"
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </Button>
      ))}
    </Flex>
  );
};

