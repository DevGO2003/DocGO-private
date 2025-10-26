import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to merge Tailwind classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// NOTE: Rough.js utilities moved to roughUtils.ts
// Import from '@shared/lib/roughUtils' instead
