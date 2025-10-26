import { FormEvent, ChangeEvent, ReactNode } from 'react';

export interface AuthFormProps {
  title: string;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  isLoading?: boolean;
  error?: string | null;
  footer?: ReactNode;
}

export interface AuthFormFieldProps {
  name: string;
  label: string;
  type?: string;
  value: string;
  error?: string;
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}
