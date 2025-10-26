import { forwardRef } from 'react';
import { cn } from '@shared/lib/utils';
import { InputProps } from './Input.types';
import { inputStyles } from './Input.styles';

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, helperText, type = 'text', ...props }, ref) => {
    return (
      <div className={inputStyles.wrapper}>
        {label && (
          <label htmlFor={props.id} className={inputStyles.label}>
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(inputStyles.input, error && inputStyles.error, className)}
          ref={ref}
          {...props}
        />
        {error && <p className={inputStyles.errorText}>{error}</p>}
        {helperText && !error && <p className={inputStyles.helperText}>{helperText}</p>}
      </div>
    );
  }
);

Input.displayName = 'Input';
