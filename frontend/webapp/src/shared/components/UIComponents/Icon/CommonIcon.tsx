import React from 'react';
import { CommonFont } from '../Font/CommonFont';

import { CommonIconProps } from './Icon.types';

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
  'x': '✕',
  'save': '💾',
  'send': '📤',
  'copy': '📋',
  'message': '💬',
  'upload': '⬆️',
  'tag': '🏷️',
  'grid': '▦',
  'list': '☰',
  'filter': '⚙️',
  edit: <span role="img" aria-label="edit">✏️</span>,
  delete: <span role="img" aria-label="delete">🗑️</span>,
  download: <span role="img" aria-label="download">⬇️</span>,
  search: <span role="img" aria-label="search">🔍</span>,
  settings: <span role="img" aria-label="settings">⚙️</span>,
  home: <span role="img" aria-label="home">🏠</span>,
  'arrow-left': <span role="img" aria-label="arrow-left">←</span>,
  'arrow-right': <span role="img" aria-label="arrow-right">→</span>,
  loading: <span role="img" aria-label="loading">⏳</span>,
  refresh: <span role="img" aria-label="refresh">↻</span>,
  'rotate-cw': <span role="img" aria-label="rotate-cw">↻</span>,
  bell: <span role="img" aria-label="bell">🔔</span>,
  check: <span role="img" aria-label="check">✓</span>,
  building: <span role="img" aria-label="building">🏢</span>,
  clock: <span role="img" aria-label="clock">🕐</span>,
  users: <span role="img" aria-label="users">👥</span>,
  chart: <span role="img" aria-label="chart">📊</span>,
  'file-text': <span role="img" aria-label="file-text">📃</span>,
  'edit-2': <span role="img" aria-label="edit-2">✏️</span>,
  grip: <span role="img" aria-label="grip">☰</span>,
  menu: <span role="img" aria-label="menu">☰</span>,
  logout: <span role="img" aria-label="logout">🚪</span>,
  grid: <span role="img" aria-label="grid">⊞</span>,
  'user-plus': <span role="img" aria-label="user-plus">👤+</span>,
  'user-check': <span role="img" aria-label="user-check">✓👤</span>,
  'user-cog': <span role="img" aria-label="user-cog">⚙️👤</span>,
  trash: <span role="img" aria-label="trash">🗑️</span>,
  plus: <span role="img" aria-label="plus">+</span>,
  minus: <span role="img" aria-label="minus">−</span>,
  mail: <span role="img" aria-label="mail">✉️</span>,
  lock: <span role="img" aria-label="lock">🔒</span>,
  shield: <span role="img" aria-label="shield">🛡️</span>,
  'alert-circle': <span role="img" aria-label="alert-circle">⚠️</span>,
  calendar: <span role="img" aria-label="calendar">📅</span>,
  crown: <span role="img" aria-label="crown">👑</span>,
  'eye-off': <span role="img" aria-label="eye-off">🙈</span>,
  'more-vertical': <span role="img" aria-label="more-vertical">⋮</span>,
  scale: <span role="img" aria-label="scale">⚖️</span>,
  'dollar-sign': <span role="img" aria-label="dollar-sign">💲</span>,
  briefcase: <span role="img" aria-label="briefcase">💼</span>,
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



