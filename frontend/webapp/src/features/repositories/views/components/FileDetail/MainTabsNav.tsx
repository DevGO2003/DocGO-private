import React from 'react';
import { Button, Flex } from '@shared/components';

interface Props {
  activeMainTab: string;
  onChange: (tabId: string) => void;
  fileData?: any; // Optional to check if file is contract
}

export const MainTabsNav: React.FC<Props> = ({ activeMainTab, onChange, fileData }) => {
  const isContract = fileData?.type === 'contract' || fileData?.contractType;
  
  const tabs = [
    { id: 'overview', label: 'Tổng quan', disabled: false },
    { id: 'contracts', label: 'Hợp đồng', disabled: !isContract },
    { id: 'comments', label: 'Bình luận', disabled: false },
  ];

  return (
    <Flex gap="4" borderBottom="1px" color="gray200" mb="2">
      {tabs.map(t => (
        <Button
          key={t.id}
          variant={activeMainTab === t.id ? "tab-active" : "tab"}
          onClick={() => !t.disabled && onChange(t.id)}
          disabled={t.disabled}
          title={t.disabled ? 'File không phải hợp đồng' : undefined}
        >
          {t.label}
        </Button>
      ))}
    </Flex>
  );
};

