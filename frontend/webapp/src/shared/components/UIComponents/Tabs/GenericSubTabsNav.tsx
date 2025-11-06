import React from 'react';
import { Tabs, TabList, CommonTab } from './CommonTabs';
import { CommonIcon } from '../Icon/CommonIcon';

export interface SubTabConfig {
  id: string;
  label: string;
  icon?: string;
  disabled?: boolean;
}

export interface GenericSubTabsNavProps {
  subTabsMap: Record<string, SubTabConfig[]>;
  activeMainTab: string;
  activeSubTab: string;
  onSubTabChange: (tabId: string) => void;
  loading?: boolean;
}

export const GenericSubTabsNav: React.FC<GenericSubTabsNavProps> = ({ 
  subTabsMap, 
  activeMainTab, 
  activeSubTab, 
  onSubTabChange, 
  loading = false 
}) => {
  const subTabs = subTabsMap[activeMainTab] ?? [];

  if (subTabs.length === 0) {
    return null;
  }

  return (
    <Tabs className="border-b mb-4" style={{ borderColor: '#e5e7eb' }}>
      <TabList>
        {subTabs.map(tab => (
          <CommonTab
            key={tab.id}
            value={tab.id}
            activeValue={activeSubTab}
            onSelect={() => !tab.disabled && !loading && onSubTabChange(tab.id)}
            disabled={tab.disabled || loading}
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
