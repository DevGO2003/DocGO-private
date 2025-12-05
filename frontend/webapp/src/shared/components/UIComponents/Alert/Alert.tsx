import React from 'react';

interface AlertProps {
  variant?: 'error' | 'warning' | 'success' | 'info';
  children: React.ReactNode;
  className?: string;
  centered?: boolean;
}

const variantStyles = {
  error: {
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
    color: '#b91c1c',
  },
  warning: {
    borderColor: '#fef08a',
    backgroundColor: '#fefce8',
    color: '#b45309',
  },
  success: {
    borderColor: '#bbf7d0',
    backgroundColor: '#f0fdf4',
    color: '#166534',
  },
  info: {
    borderColor: '#bfdbfe',
    backgroundColor: '#eff6ff',
    color: '#1d4ed8',
  },
};

export const Alert: React.FC<AlertProps> = ({
  variant = 'error',
  children,
  className = '',
  centered = true,
}) => {
  const styles = variantStyles[variant];

  return (
    <div
      className={`
        px-4 py-3 rounded-lg border
        ${centered ? 'text-center' : ''}
        ${className}
      `}
      style={{
        borderColor: styles.borderColor,
        backgroundColor: styles.backgroundColor,
        color: styles.color,
      }}
      role="alert"
    >
      {children}
    </div>
  );
};

export default Alert;
