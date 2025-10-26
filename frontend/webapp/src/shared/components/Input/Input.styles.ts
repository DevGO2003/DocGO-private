export const inputStyles = {
  wrapper: 'w-full space-y-2',
  label: 'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
  input:
    'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
  error: 'border-destructive focus-visible:ring-destructive',
  errorText: 'text-sm text-destructive',
  helperText: 'text-sm text-muted-foreground',
};
