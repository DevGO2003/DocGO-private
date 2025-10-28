import { ButtonHTMLAttributes, ReactNode } from 'react';
import { VariantProps } from 'class-variance-authority';
import { buttonVariants } from './Button.styles';

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode;
  isLoading?: boolean;
  asChild?: boolean;
}
