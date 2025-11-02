import { InputHTMLAttributes } from 'react';

export interface CommonInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
