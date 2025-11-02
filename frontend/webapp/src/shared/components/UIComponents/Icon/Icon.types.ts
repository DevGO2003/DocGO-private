export type IconName = 'file' | 'folder' | 'info' | 'warning' | 'user' | 'success' | 'star' | 'smile' | 'chevron-right' | 'chevron-left' | 'chevron-up' | 'chevron-down' | 'close' | 'edit' | 'delete' | 'download' | 'upload' | 'search' | 'settings' | 'home' | 'arrow-left';

export interface CommonIconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
  fontFamily?: string;
}
