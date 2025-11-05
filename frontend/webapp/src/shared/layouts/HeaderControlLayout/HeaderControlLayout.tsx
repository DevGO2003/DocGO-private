import React from 'react';
import type { HeaderControlLayoutProps, Breadcrumb } from './types';
import { CommonFont } from '@shared/components';
import { GenericMainTabsNav } from '@shared/components/UIComponents/Tabs/GenericMainTabsNav';
import { GenericSubTabsNav } from '@shared/components/UIComponents/Tabs/GenericSubTabsNav';

function Breadcrumbs({ items, onRefresh }: { items?: Breadcrumb[]; onRefresh?: () => void }) {

  if (!items || items.length === 0) return null;

  const handleCurrentClick = () => {
    // Use onRefresh if provided, otherwise fallback to window.location.reload()
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm">
      <ol className="flex items-center gap-2">
        {items.map((b, idx) => (
          <li key={idx} className="flex items-center">
            {idx > 0 && <span className="mx-1 text-gray-400">›</span>}
            {b.href ? (
              <a href={b.href} className="text-indigo-600 hover:text-indigo-700 font-medium">
                {b.label}
              </a>
            ) : (
              <button
                onClick={handleCurrentClick}
                className={`font-medium cursor-pointer hover:text-indigo-600 transition-colors ${
                  b.current ? 'text-gray-500' : 'text-gray-900'
                }`}
                aria-label={`Reload ${b.label}`}
              >
                {b.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export const HeaderControlLayout: React.FC<HeaderControlLayoutProps> = ({
  title,
  description,
  breadcrumbs,
  rightActions,
  tabsConfig,
  primaryTabs,
  secondaryTabs,
  headerChildren,
  children,
  className,
  onRefresh,
}) => {
  return (
    <CommonFont className={`w-full rounded-2xl border bg-white ${className || ''}`}>
      <div className="px-6 py-4 border-b">
        {/* Top row: Left (breadcrumbs + title + subtitle) | Right (headerChildren + rightActions) */}
        <div className="flex items-start gap-4 mb-3">
          <div className="min-w-0 flex-none max-w-[40%]">
            <div className="mb-2">
              <Breadcrumbs items={breadcrumbs} onRefresh={onRefresh} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {title}
            </h1>
            <p className="text-sm text-gray-600 mt-1">{description}</p>
          </div>
          <div className="min-w-0 flex-1 flex items-start justify-end gap-2">
            {headerChildren && (
              <div className="flex items-center gap-2 flex-1">{headerChildren}</div>
            )}
            {rightActions && (
              <div className="flex items-center gap-2 flex-shrink-0">{rightActions}</div>
            )}
          </div>
        </div>

        {/* Tabs row: Below subtitle */}
        {tabsConfig ? (
          <>
            {tabsConfig.mainTabs && tabsConfig.mainTabs.length > 0 && (
              <div className="mt-3">
                <GenericMainTabsNav
                  tabs={tabsConfig.mainTabs}
                  activeTab={tabsConfig.activeMainTab || ''}
                  onTabChange={tabsConfig.onMainTabChange || (() => {})}
                  loading={tabsConfig.loading}
                />
              </div>
            )}
            {tabsConfig.subTabsMap && tabsConfig.activeMainTab && (
              <div className="mt-1">
                <GenericSubTabsNav
                  subTabsMap={tabsConfig.subTabsMap}
                  activeMainTab={tabsConfig.activeMainTab}
                  activeSubTab={tabsConfig.activeSubTab || ''}
                  onSubTabChange={tabsConfig.onSubTabChange || (() => {})}
                  loading={tabsConfig.loading}
                />
              </div>
            )}
          </>
        ) : (
          <>
            {primaryTabs && (
              <div className="mt-3">
                {primaryTabs}
              </div>
            )}
            {secondaryTabs && (
              <div className="mt-1">
                {secondaryTabs}
              </div>
            )}
          </>
        )}
      </div>

      {children && <div className="px-6 py-4">{children}</div>}
    </CommonFont>
  );
};
