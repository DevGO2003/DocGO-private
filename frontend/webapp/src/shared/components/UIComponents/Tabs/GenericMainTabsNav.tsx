import React from 'react';
import { Tabs, TabList, CommonTab } from './CommonTabs';
import { CommonIcon } from '../Icon/CommonIcon';

export interface TabConfig {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
  disabledTooltip?: string;
}

export interface GenericMainTabsNavProps {
  tabs: TabConfig[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
  loading?: boolean;
}

export const GenericMainTabsNav: React.FC<GenericMainTabsNavProps> = ({ 
  tabs, 
  activeTab, 
  onTabChange, 
  loading = false 
}) => {
  return (
    <Tabs className="border-b" style={{ borderColor: '#e5e7eb' }}>
      <TabList>
        {tabs.map(tab => (
          <CommonTab
            key={tab.id}
            value={tab.id}
            activeValue={activeTab}
            onSelect={() => !tab.disabled && !loading && onTabChange(tab.id)}
            disabled={tab.disabled || loading}
            title={tab.disabled ? tab.disabledTooltip : undefined}
          >
            <div className="flex items-center gap-2">
              {tab.icon && (
                <CommonIcon name={tab.icon as any} size={16} />
              )}
              {loading ? (
                <span className="inline-block w-16 h-4 rounded" style={{ backgroundColor: '#e5e7eb' }}></span>
              ) : (
                tab.label
              )}
            </div>
          </CommonTab>
        ))}
      </TabList>
    </Tabs>
  );
};
