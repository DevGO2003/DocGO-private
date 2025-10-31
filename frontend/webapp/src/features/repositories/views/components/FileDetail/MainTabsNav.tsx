import React from 'react';
import { Button } from '@shared/components';

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
    <div className="flex gap-4 mb-2 border-b border-gray-200">
      {tabs.map(t => (
        <Button
          key={t.id}
          variant={activeMainTab === t.id ? "default" : "ghost"}
          onClick={() => !t.disabled && !loading && onChange(t.id)}
          disabled={t.disabled || loading}
          title={t.disabled ? 'File không phải hợp đồng' : undefined}
          className={activeMainTab === t.id ? 'bg-indigo-600 text-white hover:bg-indigo-700' : ''}
        >
          {loading ? <span className="inline-block w-16 h-4 bg-gray-200 animate-pulse rounded"></span> : t.label}
        </Button>
      ))}
    </div>
  );
};

