import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Users, Activity, Settings } from 'lucide-react';

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
      id: 'files',
      label: t('repositories.detail.tabs.files'),
      icon: FileText,
    },
    {
      id: 'members',
      label: t('repositories.detail.tabs.members'),
      icon: Users,
    },
    {
      id: 'activity',
      label: t('repositories.detail.tabs.activity'),
      icon: Activity,
    },
    {
      id: 'settings',
      label: t('repositories.detail.tabs.settings'),
      icon: Settings,
    },
  ];

  return (
    <div className="border-b border-gray-200 bg-white mb-6">
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                group relative flex items-center gap-2
                px-6 py-3 text-sm font-medium transition-all duration-200
                border-b-2 hover:bg-gray-50
                ${
                  isActive
                    ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                }
              `}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
              <span className={`font-semibold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
