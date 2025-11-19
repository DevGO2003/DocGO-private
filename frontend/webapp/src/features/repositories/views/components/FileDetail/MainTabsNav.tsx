import React from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabList, CommonTab } from '@shared/components';

/**
 * @deprecated Use GenericMainTabsNav with tabsConfig in HeaderControlLayout instead
 * This component will be removed in future versions
 */
interface Props {
  activeMainTab: string;
  onChange: (tabId: string) => void;
  fileData?: any; // Optional to check if file is contract
  loading?: boolean;
}

export const MainTabsNav: React.FC<Props> = ({ activeMainTab, onChange, fileData, loading }) => {
  const { t } = useTranslation();
  const isContract = fileData?.type === 'contract' || fileData?.contractType;
  
  const tabs = [
    { id: 'overview', label: t('repositories.detail.tabs.overview'), disabled: false },
    { id: 'contracts', label: t('repositories.detail.tabs.contracts', { defaultValue: 'Hợp đồng' }), disabled: !isContract },
    { id: 'comments', label: t('repositories.detail.tabs.comments', { defaultValue: 'Bình luận' }), disabled: false },
  ];

  return (
    <Tabs className="border-b" style={{ borderColor: '#e5e7eb' }} >
      <TabList>
        {tabs.map(tab => (
          <CommonTab
            key={tab.id}
            value={tab.id}
            activeValue={activeMainTab}
            onSelect={() => !tab.disabled && !loading && onChange(tab.id)}
            disabled={tab.disabled || loading}
            title={tab.disabled ? t('repositories.detail.tabs.contractOnly', { defaultValue: 'File không phải hợp đồng' }) : undefined}
          >
            {loading ? <span className="inline-block rounded" style={{ backgroundColor: '#e5e7eb' }} ></span> : tab.label}
          </CommonTab>
        ))}
      </TabList>
    </Tabs>
  );
};

