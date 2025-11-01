import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CommonFont } from '@shared/components';
import type { BaseHeaderLayoutProps, BreadcrumbItem } from './BaseHeaderLayout.types';

/**
 * Breadcrumbs Component
 * Displays navigation breadcrumbs with refresh on current item click
 */
function Breadcrumbs({ items, onRefresh }: { items: BreadcrumbItem[]; onRefresh?: () => void }) {
  const navigate = useNavigate();

  if (!items || items.length === 0) return null;

  const handleCurrentClick = () => {
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
  };

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-sm mb-2">
      <ol className="flex items-center gap-2">
        {items.map((item, idx) => (
          <li key={idx} className="flex items-center">
            {idx > 0 && <span className="mx-1 text-gray-400">›</span>}
            {item.icon && <span className="mr-1">{item.icon}</span>}
            {item.href ? (
              <a
                href={item.href}
                className="text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
              >
                {item.label}
              </a>
            ) : (
              <button
                onClick={handleCurrentClick}
                className={`font-medium cursor-pointer hover:text-indigo-600 transition-colors ${
                  item.current ? 'text-gray-500' : 'text-gray-900'
                }`}
                aria-label={`Reload ${item.label}`}
              >
                {item.label}
              </button>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/**
 * BaseHeaderLayout Component
 * 
 * Layout structure:
 * ┌─────────────────────────────┬──────────────────────────────────────────────┐
 * │ LEFT SECTION (40%)          │ RIGHT SECTION (60%)                          │
 * │ - Breadcrumbs               │ - Actions (always)                           │
 * │ - Title                     │ - Secondary Actions (optional)               │
 * │ - Subtitle (optional)       │                                              │
 * │ - Metadata (optional)       │                                              │
 * │ - Stats (optional)          │                                              │
 * │ - Filters (optional)        │                                              │
 * │ - Context Nav (optional)    │                                              │
 * └─────────────────────────────┴──────────────────────────────────────────────┘
 * 
 * Responsive:
 * - Desktop (>1024px): 40/60 split, side-by-side
 * - Tablet (768-1024px): 35/65 split
 * - Mobile (<768px): Stack vertically, full width
 */
export const BaseHeaderLayout: React.FC<BaseHeaderLayoutProps> = ({
  breadcrumbs,
  title,
  subtitle,
  metadata,
  contextNav,
  stats,
  filters,
  actions,
  secondaryActions,
  mode = 'normal',
  onRefresh,
  className = '',
}) => {
  return (
    <CommonFont className={`w-full rounded-2xl border bg-white ${className}`}>
      <div className="px-6 py-4">
        {/* Main Layout: Left (40%) | Right (60%) */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          
          {/* LEFT SECTION (40%) */}
          <div className="flex-1 lg:max-w-[40%] min-w-0">
            {/* Breadcrumbs */}
            <Breadcrumbs items={breadcrumbs} onRefresh={onRefresh} />
            
            {/* Title */}
            <h1 className="text-2xl font-bold text-gray-900 mb-1">
              {title}
            </h1>
            
            {/* Subtitle */}
            {subtitle && (
              <p className="text-sm text-gray-500 mb-3">
                {subtitle}
              </p>
            )}
            
            {/* Metadata */}
            {metadata && (
              <div className="mb-3">
                {metadata}
              </div>
            )}
            
            {/* Stats */}
            {stats && (
              <div className="mb-3">
                {stats}
              </div>
            )}
            
            {/* Filters */}
            {filters && (
              <div className="mb-3">
                {filters}
              </div>
            )}
            
            {/* Context Navigation */}
            {contextNav && (
              <div className="mt-4">
                {contextNav}
              </div>
            )}
          </div>
          
          {/* RIGHT SECTION (60%) */}
          <div className="flex-1 lg:max-w-[60%] flex flex-col items-start lg:items-end gap-3">
            {/* Primary Actions */}
            <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end">
              {actions}
            </div>
            
            {/* Secondary Actions */}
            {secondaryActions && (
              <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto lg:justify-end">
                {secondaryActions}
              </div>
            )}
          </div>
        </div>
      </div>
    </CommonFont>
  );
};

