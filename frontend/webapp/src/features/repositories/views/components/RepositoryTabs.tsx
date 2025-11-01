import React from 'react';
import { useTranslation } from 'react-i18next';
import { User, Building2, Globe } from 'lucide-react';
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
      icon: User,
    },
    {
      id: 'ORGANIZATION' as RepositoryType,
      label: t('repositories.tabs.organization.label'),
      count: organizationCount,
      description: t('repositories.tabs.organization.description'),
      icon: Building2,
    },
    {
      id: 'PUBLIC' as RepositoryType,
      label: t('repositories.tabs.public.label'),
      count: publicCount,
      description: t('repositories.tabs.public.description'),
      icon: Globe,
    },
  ];

  return (
    <div className="border-b border-gray-200 bg-white">
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`
                group relative flex flex-1 flex-col items-center justify-center
                px-6 py-4 text-sm font-medium transition-all duration-200
                border-b-2 hover:bg-gray-50
                ${
                  isActive
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }
              `}
            >
              {/* Icon + Label + Count */}
              <div className="flex items-center gap-2 mb-1">
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'}`} />
                <span className={`font-semibold ${isActive ? 'text-blue-700' : 'text-gray-700'}`}>
                  {tab.label}
                </span>
                {tab.count > 0 && (
                  <span
                    className={`
                      inline-flex items-center justify-center min-w-[20px] h-5 px-2 
                      rounded-full text-xs font-bold transition-colors
                      ${
                        isActive
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                      }
                    `}
                  >
                    {tab.count}
                  </span>
                )}
              </div>
              
              {/* Description */}
              <p className={`text-xs ${isActive ? 'text-blue-600' : 'text-gray-500'}`}>
                {tab.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
};
