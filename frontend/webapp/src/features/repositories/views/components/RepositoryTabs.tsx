import React from 'react';
import { motion } from 'framer-motion';
import { RepositoryType } from '@features/repositories/models/types/repository.types';

interface RepositoryTabsProps {
  activeTab: RepositoryType;
  onTabChange: (tab: RepositoryType) => void;
  personalCount?: number;
  organizationCount?: number;
}

export const RepositoryTabs: React.FC<RepositoryTabsProps> = ({
  activeTab,
  onTabChange,
  personalCount = 0,
  organizationCount = 0,
}) => {
  const tabs = [
    {
      id: 'PERSONAL' as RepositoryType,
      label: 'Cá nhân',
      count: personalCount,
      description: 'Kho lưu trữ cá nhân của bạn',
    },
    {
      id: 'ORGANIZATION' as RepositoryType,
      label: 'Tổ chức',
      count: organizationCount,
      description: 'Kho lưu trữ của tổ chức',
    },
  ];

  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`
              group relative min-w-0 flex-1 overflow-hidden py-4 px-6 text-center text-sm font-medium
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
              ${
                activeTab === tab.id
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
              }
            `}
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
          </button>
        ))}
      </nav>
    </div>
  );
};
