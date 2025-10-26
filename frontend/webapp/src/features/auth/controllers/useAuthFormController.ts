import { useState, ChangeEvent, FormEvent } from 'react';
import { validateEmail, validatePassword } from '@utils';

interface FormErrors {
  [key: string]: string;
}

export const useAuthFormController = <T extends Record<string, any>>(initialValues: T) => {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: ChangeEvent<HTMLInputElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    validateField(name, values[name]);
  };

  const validateField = (name: string, value: any) => {
    let error = '';

    if (name === 'email') {
      error = validateEmail(value) || '';
    } else if (name === 'password') {
      // Pass username to allow bypass for admin/123456
      const username = (values as any).username || '';
      error = validatePassword(value, username) || '';
    } else if (name === 'confirmPassword' && 'password' in values) {
      error = value !== values.password ? 'Passwords do not match' : '';
    } else if (!value) {
      error = 'This field is required';
    }

    setErrors((prev) => ({ ...prev, [name]: error }));
    return !error;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    Object.keys(values).forEach((key) => {
      if (!validateField(key, values[key])) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSubmit = (onSubmit: (values: T) => void) => (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(values);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
  };

  return {
    values,
    errors,
    touched,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
    setValues,
    setErrors,
  };
};
