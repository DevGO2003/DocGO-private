import React from 'react';
import { Tabs, Button, Flex } from '@shared/components';

interface Props {
  activeMainTab: string;
  onChange: (tabId: string) => void;
}

export const MainTabsNav: React.FC<Props> = ({ activeMainTab, onChange }) => {
  const tabs = [
    { id: 'contracts', label: 'Hợp đồng' },
    { id: 'overview', label: 'Tổng quan' },
    { id: 'comments', label: 'Bình luận' },
  ];

  return (
    <Flex gap="4" borderBottom="1px" color="gray200" mb="2">
      {tabs.map(t => (
        <Button
          key={t.id}
          variant={activeMainTab===t.id ? "tab-active" : "tab"}
          onClick={() => onChange(t.id)}
        >
          {t.label}
        </Button>
      ))}
    </Flex>
  );
}
