import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { Tabs, TabList, CommonTab } from '@shared/components';
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
    },
    {
      id: 'ORGANIZATION' as RepositoryType,
      label: t('repositories.tabs.organization.label'),
      count: organizationCount,
      description: t('repositories.tabs.organization.description'),
    },
    {
      id: 'PUBLIC' as RepositoryType,
      label: t('repositories.tabs.public.label'),
      count: publicCount,
      description: t('repositories.tabs.public.description'),
    },
  ];

  return (
    <Tabs className="border-b border-gray-200">
      <TabList className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <CommonTab
            key={tab.id}
            value={tab.id}
            activeValue={activeTab}
            onSelect={() => onTabChange(tab.id)}
            className="group relative min-w-0 flex-1 overflow-hidden py-4 px-6 text-center"
          >
            <div className="flex items-center justify-center space-x-2">
              <span className="font-medium">{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`
                    inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    transition-colors duration-200
                    ${
                      activeTab === tab.id
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800 group-hover:bg-gray-200'
                    }
                  `}
                >
                  {tab.count}
                </span>
              )}
            </div>
            
            <p className="mt-1 text-xs text-gray-500">
              {tab.description}
            </p>

            {/* Active tab indicator */}
            {activeTab === tab.id && (
              <motion.div
                layoutId="activeTab"
                className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600"
                initial={false}
                transition={{
                  type: "spring",
                  stiffness: 500,
                  damping: 30
                }}
              />
            )}
          </CommonTab>
        ))}
      </TabList>
    </Tabs>
  );
};
