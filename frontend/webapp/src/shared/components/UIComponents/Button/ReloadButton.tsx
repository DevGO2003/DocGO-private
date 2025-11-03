import React from 'react';
import { Button } from './CommonButton';
import { ButtonProps } from './Button.types';
import { CommonIcon } from '../Icon/CommonIcon';

interface ReloadButtonProps extends Omit<ButtonProps, 'isLoading' | 'children'> {
  loading?: boolean;
  label?: string;
  showLabel?: boolean;
}

/**
 * ReloadButton Component
 * 
 * Specialized button for reload/refresh actions with:
 * - Rotating icon (rotate-cw from CommonIcon)
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
      <CommonIcon name="rotate-cw" size={16} className={loading ? 'animate-spin' : ''} />
      {showLabel && <span>{label}</span>}
    </Button>
  );
};

ReloadButton.displayName = 'ReloadButton';

