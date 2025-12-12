import React from 'react';
import { useTranslation } from 'react-i18next';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Tabs, TabList, CommonTab } from '@shared/components/UIComponents/Tabs/CommonTabs';

/**
 * @deprecated Use GenericMainTabsNav with tabsConfig in HeaderControlLayout instead
 * This component will be removed in future versions
 */
interface RepositoryDetailTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export const RepositoryDetailTabs: React.FC<RepositoryDetailTabsProps> = ({
  activeTab,
  onTabChange,
}) => {
  const { t } = useTranslation();
  
  const tabs = [
    {
      id: 'overview',
      label: t('repositories.detail.tabs.overview', { defaultValue: 'Tổng quan' }),
      icon: 'info',
      disabled: false,
    },
    {
      id: 'files',
      label: t('repositories.detail.tabs.files'),
      icon: 'file-text',
      disabled: false,
    },
    {
      id: 'activity',
      label: t('repositories.detail.tabs.activity'),
      icon: 'clock',
      disabled: true,
      tooltip: t('repositories.detail.tabs.activityDisabled'),
    },
  ];

  return (
    <Tabs className="border-b">
      <TabList className="mb-6">
        {tabs.map((tab) => {
          const tabContent = (
            <CommonTab
              key={tab.id}
              value={tab.id}
              activeValue={activeTab}
              onSelect={(value) => !tab.disabled && onTabChange(value)}
              disabled={tab.disabled}
              className="flex items-center gap-2 px-6 py-3"
            >
              <CommonIcon name={tab.icon as any} className="w-4 h-4" />
              <span>{tab.label}</span>
            </CommonTab>
          );
          
          // Wrap disabled tabs with tooltip
          if (tab.disabled && tab.tooltip) {
            return (
              <div key={tab.id} title={tab.tooltip} className="inline-block cursor-not-allowed">
                {tabContent}
              </div>
            );
          }
          
          return tabContent;
        })}
      </TabList>
    </Tabs>
  );
};
