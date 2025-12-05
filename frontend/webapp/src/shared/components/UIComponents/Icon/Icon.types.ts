export type IconName = 
  | 'file' | 'folder' | 'info' | 'warning' | 'user' | 'success' | 'star' | 'star-outline' | 'smile' 
  | 'chevron-right' | 'chevron-left' | 'chevron-up' | 'chevron-down' 
  | 'close' | 'edit' | 'delete' | 'download' | 'upload' | 'search' | 'settings' | 'home'
  | 'arrow-left' | 'arrow-right'
  | 'loading' | 'refresh' | 'refresh-cw' | 'bell' | 'check' | 'building' | 'clock' | 'eye'
  | 'x'
  | 'save'
  | 'send'
  | 'copy'
  | 'message'
  | 'tag'
  | 'grid'
  | 'list'
  | 'filter'
  | 'rotate-cw'
  | 'users' | 'chart' | 'file-text' | 'edit-2' | 'grip'
  | 'menu' | 'logout' 
  | 'user-plus' | 'user-check' | 'user-cog' | 'trash' | 'plus' | 'minus'
  | 'mail' | 'lock' | 'shield' | 'alert-circle' | 'calendar' | 'crown'
  | 'eye-off' | 'more-vertical' | 'scale' | 'dollar-sign' | 'briefcase'
  | 'folder-open' | 'file-search' | 'phone';

export interface CommonIconProps {
  name: IconName;
  size?: number;
  color?: string;
  className?: string;
  fontFamily?: string;
}
