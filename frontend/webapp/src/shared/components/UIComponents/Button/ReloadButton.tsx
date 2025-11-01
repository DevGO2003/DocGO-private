import React from 'react';
import { RotateCw } from 'lucide-react';
import { Button } from './CommonButton';
import { ButtonProps } from './Button.types';

interface ReloadButtonProps extends Omit<ButtonProps, 'isLoading' | 'children'> {
  loading?: boolean;
  label?: string;
  showLabel?: boolean;
}

/**
 * ReloadButton Component
 * 
 * Specialized button for reload/refresh actions with:
 * - Rotating icon (RotateCw from lucide-react)
 * - Spinner animation when loading
 * - Optional label text
 * - Inherits all CommonButton features (rough canvas, variants, etc.)
 * 
 * Usage:
 * ```tsx
 * <ReloadButton 
 *   loading={isRefreshing} 
 *   onClick={handleRefresh}
 *   label="Làm mới"
 *   showLabel={true}
 * />
 * ```
 */
export const ReloadButton: React.FC<ReloadButtonProps> = ({
  loading = false,
  label = 'Làm mới',
  showLabel = true,
  variant = 'outline',
  size = 'default',
  className = '',
  onClick,
  disabled,
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={`inline-flex items-center gap-2 ${className}`}
      {...props}
    >
      <RotateCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
      {showLabel && <span>{label}</span>}
    </Button>
  );
};

ReloadButton.displayName = 'ReloadButton';

