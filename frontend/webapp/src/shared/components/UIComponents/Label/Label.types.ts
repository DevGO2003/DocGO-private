import { LabelHTMLAttributes } from 'react';

export interface CommonLabelProps extends LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  error?: boolean;
  icon?: string;
}
