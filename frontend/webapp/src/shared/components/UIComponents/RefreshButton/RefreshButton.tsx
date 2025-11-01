import React from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '../Button';

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
      <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      Làm mới
    </Button>
  );
};

