import React from 'react';
import { useTranslation } from 'react-i18next';
import { Info, FileText, Users, Activity } from 'lucide-react';
import { Tabs, TabList, CommonTab } from '@shared/components/UIComponents/Tabs/CommonTabs';

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
      icon: Info,
      disabled: false,
    },
    {
      id: 'files',
      label: t('repositories.detail.tabs.files'),
      icon: FileText,
      disabled: false,
    },
    {
      id: 'members',
      label: t('repositories.detail.tabs.members'),
      icon: Users,
      disabled: false,
    },
    {
      id: 'activity',
      label: t('repositories.detail.tabs.activity'),
      icon: Activity,
      disabled: true,
      tooltip: 'Tạm thời chưa có, tương lai các phiên bản kế tiếp sẽ có',
    },
  ];

  return (
    <Tabs>
      <TabList className="border-b border-gray-200 bg-white mb-6">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const tabContent = (
            <CommonTab
              key={tab.id}
              value={tab.id}
              activeValue={activeTab}
              onSelect={(value) => !tab.disabled && onTabChange(value)}
              disabled={tab.disabled}
              className="flex items-center gap-2 px-6 py-3"
            >
              <Icon className="w-4 h-4" />
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
