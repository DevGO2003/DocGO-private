import React from 'react';
import { CommonFont } from '../Font/CommonFont';

export interface CommonIconProps {
  name: 'file' | 'folder' | 'info' | 'warning' | 'user' | 'success' | 'star' | 'smile' | 'chevron-right' | 'chevron-left' | 'chevron-up' | 'chevron-down' | 'close' | 'edit' | 'delete' | 'download' | 'upload' | 'search' | 'settings' | 'home';
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
  'chevron-right': <span role="img" aria-label="chevron-right">›</span>,
  'chevron-left': <span role="img" aria-label="chevron-left">‹</span>,
  'chevron-up': <span role="img" aria-label="chevron-up">^</span>,
  'chevron-down': <span role="img" aria-label="chevron-down">v</span>,
  close: <span role="img" aria-label="close">✕</span>,
  edit: <span role="img" aria-label="edit">✏️</span>,
  delete: <span role="img" aria-label="delete">🗑️</span>,
  download: <span role="img" aria-label="download">⬇️</span>,
  upload: <span role="img" aria-label="upload">⬆️</span>,
  search: <span role="img" aria-label="search">🔍</span>,
  settings: <span role="img" aria-label="settings">⚙️</span>,
  home: <span role="img" aria-label="home">🏠</span>,
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



