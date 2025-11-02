import React from 'react';
import { Button } from '../Button';
import { CommonIcon } from '../Icon/CommonIcon';

interface RefreshButtonProps {
  onClick?: () => void;
  loading?: boolean;
  className?: string;
}

export const RefreshButton: React.FC<RefreshButtonProps> = ({
  onClick,
  loading = false,
  className = '',
}) => {
  return (
    <Button
      variant="outline"
      onClick={onClick}
      disabled={loading}
      className={`flex items-center gap-2 ${className}`}
    >
      <CommonIcon name="refresh" size={16} className={loading ? 'animate-spin' : ''} />
      Làm mới
    </Button>
  );
};
