import React from 'react';

interface Crumb {
  label: string;
  href?: string;
  current?: boolean;
}

export const DetailHeader: React.FC<{
  title: string;
  subtitle?: string;
  breadcrumbs?: Crumb[];
  right?: React.ReactNode;
}> = ({ title, subtitle, breadcrumbs = [], right }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-xl font-semibold text-gray-900 truncate" title={title}>{title}</h1>
          {subtitle && <div className="text-sm text-gray-600 mt-1">{subtitle}</div>}
        </div>
        {right}
      </div>
      {breadcrumbs.length > 0 && (
        <nav className="text-sm text-gray-500">
          <ol className="flex items-center gap-2">
            {breadcrumbs.map((c, idx) => (
              <li key={idx} className={c.current ? 'text-gray-900' : ''}>
                {c.href ? (
                  <a href={c.href} className="hover:underline">{c.label}</a>
                ) : (
                  <span>{c.label}</span>
                )}
                {idx < breadcrumbs.length - 1 && <span className="mx-1 text-gray-300">/</span>}
              </li>
            ))}
          </ol>
        </nav>
      )}
    </div>
  );
}
