import React from 'react';
import { CommonFont } from '../Font/CommonFont';

export interface CommonIconProps {
  name: 'file' | 'folder' | 'info' | 'warning' | 'user' | 'success' | 'star' | 'smile';
  size?: number;
  color?: string;
  className?: string;
  fontFamily?: string;
}

// Demo icon map - replace with your own SVGs or font icons, or even emoji for Hand UI
const iconMap: Record<string, React.ReactNode> = {
  file: <span role="img" aria-label="file">📄</span>,
  folder: <span role="img" aria-label="folder">📁</span>,
  info: <span role="img" aria-label="info">ℹ️</span>,
  warning: <span role="img" aria-label="warning">⚠️</span>,
  user: <span role="img" aria-label="user">👤</span>,
  success: <span role="img" aria-label="check">✔️</span>,
  star: <span role="img" aria-label="star">⭐</span>,
  smile: <span role="img" aria-label="smile">😊</span>,
};

export const CommonIcon: React.FC<CommonIconProps> = ({ name, size = 22, color = '#333', className, fontFamily }) => {
  return (
    <CommonFont
      style={{ fontSize: size, color, display: 'inline-block', fontFamily: fontFamily }}
      className={className}
    >
      {iconMap[name] || iconMap['file']}
    </CommonFont>
  );
};



