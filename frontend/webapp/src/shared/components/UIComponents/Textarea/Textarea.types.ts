import { TextareaHTMLAttributes } from 'react';

export interface CommonTextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
}
