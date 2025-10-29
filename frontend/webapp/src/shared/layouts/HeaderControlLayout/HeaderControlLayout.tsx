import React from 'react';
import type { HeaderControlLayoutProps, Breadcrumb } from './types';
import { CommonFont } from '@shared/components';

function Breadcrumbs({ items }: { items?: Breadcrumb[] }) {
  if (!items || items.length === 0) return null;
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
              <span className={`font-medium ${b.current ? 'text-gray-500' : 'text-gray-900'}`}>{b.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export const HeaderControlLayout: React.FC<HeaderControlLayoutProps> = ({
  title,
  subtitle,
  breadcrumbs,
  rightActions,
  primaryTabs,
  secondaryTabs,
  headerChildren,
  children,
  className,
}) => {
  return (
    <CommonFont className={`w-full rounded-2xl border bg-white ${className || ''}`}>
      <div className="px-6 py-4 border-b">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-2">
              <Breadcrumbs items={breadcrumbs} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
            {headerChildren && (
              <div className="mt-2">{headerChildren}</div>
            )}
          </div>
          {rightActions && (
            <div className="flex items-center gap-2">{rightActions}</div>
          )}
        </div>
      </div>

      {(primaryTabs || secondaryTabs) && (
        <div className="px-6 py-3 border-b">
          {primaryTabs}
          {secondaryTabs && <div className="mt-2">{secondaryTabs}</div>}
        </div>
      )}

      {children && <div className="px-6 py-4">{children}</div>}
    </CommonFont>
  );
};
