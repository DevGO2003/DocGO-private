import React from 'react';
import { useTranslation } from 'react-i18next';
import { FileText, Users, Activity, Info } from 'lucide-react';

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
      id: 'info',
      label: 'Thông tin',
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
    <div className="border-b border-gray-200 bg-white mb-6">
      <div className="flex space-x-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          const isDisabled = tab.disabled;
          
          return (
            <div key={tab.id} className="relative group/tab">
              <button
                onClick={() => !isDisabled && onTabChange(tab.id)}
                disabled={isDisabled}
                className={`
                  relative flex items-center gap-2
                  px-6 py-3 text-sm font-medium transition-all duration-200
                  border-b-2
                  ${
                    isDisabled
                      ? 'border-transparent text-gray-400 cursor-not-allowed opacity-50'
                      : isActive
                      ? 'border-blue-600 text-blue-600 bg-blue-50/50'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50'
                  }
                `}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : isDisabled ? 'text-gray-400' : 'text-gray-400 group-hover/tab:text-gray-600'}`} />
                <span className={`font-semibold ${isActive ? 'text-blue-700' : isDisabled ? 'text-gray-400' : 'text-gray-700'}`}>
                  {tab.label}
                </span>
              </button>
              
              {/* Tooltip for disabled tabs */}
              {isDisabled && tab.tooltip && (
                <div className="hidden group-hover/tab:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 z-50">
                  <div className="bg-gray-900 text-white text-xs rounded-lg py-2 px-3 whitespace-nowrap">
                    {tab.tooltip}
                    <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
                      <div className="border-4 border-transparent border-t-gray-900"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
