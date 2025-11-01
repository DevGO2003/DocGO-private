import React from 'react';
import { useNavigate } from 'react-router-dom'; // Replaced next/navigation
import type { HeaderControlLayoutProps, Breadcrumb } from './types';
import { CommonFont } from '@shared/components';

function Breadcrumbs({ items, onRefresh }: { items?: Breadcrumb[]; onRefresh?: () => void }) {
  const navigate = useNavigate(); // React Router equivalent

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
  subtitle,
  breadcrumbs,
  rightActions,
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
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0 flex-1">
            <div className="mb-2">
              <Breadcrumbs items={breadcrumbs} onRefresh={onRefresh} />
            </div>
            <h1 className="text-2xl font-semibold text-gray-900">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
            )}
          </div>
          <div className="flex items-start gap-2 flex-shrink-0">
            {headerChildren && (
              <div className="flex items-center gap-2">{headerChildren}</div>
            )}
            {rightActions && (
              <div className="flex items-center gap-2">{rightActions}</div>
            )}
          </div>
        </div>

        {/* Tabs row: Below subtitle */}
        {secondaryTabs && (
          <div className="mt-3">
            {secondaryTabs}
          </div>
        )}
        {primaryTabs && (
          <div className="mt-3">
            {primaryTabs}
          </div>
        )}
      </div>

      {children && <div className="px-6 py-4">{children}</div>}
    </CommonFont>
  );
};
