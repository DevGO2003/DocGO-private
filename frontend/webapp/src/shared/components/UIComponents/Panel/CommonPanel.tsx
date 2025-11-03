import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../Card';

interface CommonPanelProps {
  title?: string;
  children: React.ReactNode;
  className?: string;
  headerActions?: React.ReactNode;
  footer?: React.ReactNode;
  loading?: boolean;
}

export const CommonPanel: React.FC<CommonPanelProps> = ({
  title,
  children,
  className = '',
  headerActions,
  footer,
  loading = false,
}) => {
  return (
    <Card className={className}>
      {(title || headerActions) && (
        <CardHeader>
          <div className="flex items-center justify-between">
            {title && <CardTitle>{title}</CardTitle>}
            {headerActions && <div className="flex items-center gap-2">{headerActions}</div>}
          </div>
        </CardHeader>
      )}
      <CardContent>
        {loading ? (
          <div className="py-6" style={{ color: '#6b7280' }} >Đang tải...</div>
        ) : (
          children
        )}
      </CardContent>
      {footer && <div className="px-6 py-4 border-t">{footer}</div>}
    </Card>
  );
};

export default CommonPanel;
