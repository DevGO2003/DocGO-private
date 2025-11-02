import { InputHTMLAttributes } from 'react';

export interface CommonSwitchProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  description?: string;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
}
