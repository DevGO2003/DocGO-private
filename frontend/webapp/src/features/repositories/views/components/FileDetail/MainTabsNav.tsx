import React from 'react';
import { Tabs, TabList, CommonTab } from '@shared/components';

interface Props {
  activeMainTab: string;
  onChange: (tabId: string) => void;
  fileData?: any; // Optional to check if file is contract
  loading?: boolean;
}

export const MainTabsNav: React.FC<Props> = ({ activeMainTab, onChange, fileData, loading }) => {
  const isContract = fileData?.type === 'contract' || fileData?.contractType;
  
  const tabs = [
    { id: 'overview', label: 'Tổng quan', disabled: false },
    { id: 'contracts', label: 'Hợp đồng', disabled: !isContract },
    { id: 'comments', label: 'Bình luận', disabled: false },
  ];

  return (
    <Tabs className="border-b border-gray-200">
      <TabList>
        {tabs.map(t => (
          <CommonTab
            key={t.id}
            value={t.id}
            activeValue={activeMainTab}
            onSelect={() => !t.disabled && !loading && onChange(t.id)}
            disabled={t.disabled || loading}
            title={t.disabled ? 'File không phải hợp đồng' : undefined}
          >
            {loading ? <span className="inline-block w-16 h-4 bg-gray-200 animate-pulse rounded"></span> : t.label}
          </CommonTab>
        ))}
      </TabList>
    </Tabs>
  );
};

