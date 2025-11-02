import React from 'react';
import { useTranslation } from 'react-i18next';
import { CommonIcon } from '@shared/components/UIComponents/Icon/CommonIcon';
import { Tabs, TabList, CommonTab } from '@shared/components/UIComponents/Tabs/CommonTabs';
import { RepositoryType } from '@features/repositories/models/types/repository.types';

interface RepositoryTabsProps {
  activeTab: RepositoryType;
  onTabChange: (tab: RepositoryType) => void;
  personalCount?: number;
  organizationCount?: number;
  publicCount?: number;
}

export const RepositoryTabs: React.FC<RepositoryTabsProps> = ({
  activeTab,
  onTabChange,
  personalCount = 0,
  organizationCount = 0,
  publicCount = 0,
}) => {
  const { t } = useTranslation();
  
  const tabs = [
    {
      id: 'PERSONAL' as RepositoryType,
      label: t('repositories.tabs.personal.label'),
      count: personalCount,
      description: t('repositories.tabs.personal.description'),
      icon: 'user',
    },
    {
      id: 'ORGANIZATION' as RepositoryType,
      label: t('repositories.tabs.organization.label'),
      count: organizationCount,
      description: t('repositories.tabs.organization.description'),
      icon: 'building',
    },
    {
      id: 'PUBLIC' as RepositoryType,
      label: t('repositories.tabs.public.label'),
      count: publicCount,
      description: t('repositories.tabs.public.description'),
      icon: 'building',
    },
  ];

  return (
    <Tabs>
      <TabList className="border-b border-gray-200 bg-white">
        {tabs.map((tab) => {
          return (
            <CommonTab
              key={tab.id}
              value={tab.id}
              activeValue={activeTab}
              onSelect={(v) => onTabChange(v as RepositoryType)}
              className="flex flex-1 flex-col items-center justify-center px-6 py-4"
            >
              <div className="flex items-center gap-2 mb-1">
                <CommonIcon name={tab.icon as any} size={16} />
                <span className="font-semibold">{tab.label}</span>
                {tab.count > 0 && (
                  <span className="inline-flex items-center justify-center min-w-[20px] h-5 px-2 rounded-full text-xs font-bold bg-indigo-100 text-indigo-700">
                    {tab.count}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500">{tab.description}</p>
            </CommonTab>
          );
        })}
      </TabList>
    </Tabs>
  );
};
