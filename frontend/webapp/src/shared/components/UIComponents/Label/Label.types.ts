import { LabelHTMLAttributes } from 'react';
import { CommonIconProps } from '../Icon/CommonIcon';

export interface CommonLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
  icon?: CommonIconProps['name'];
  iconSize?: number;
  iconColor?: string;
  noBorder?: boolean;
}
