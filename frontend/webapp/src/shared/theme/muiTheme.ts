/**
 * Material UI Theme Configuration (Optional - Secondary UI)
 * For complex components like DataGrid, DatePicker, etc.
 */

export const muiTheme = {
  palette: {
    mode: 'light' as const,
    primary: {
      main: '#4A90E2',
      light: '#6BA3E8',
      dark: '#357ABD',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#7B68EE',
      light: '#9580F3',
      dark: '#5E4FBF',
      contrastText: '#FFFFFF',
    },
    error: {
      main: '#FF6B6B',
      light: '#FF8787',
      dark: '#E54F4F',
    },
    warning: {
      main: '#FFA94D',
      light: '#FFB969',
      dark: '#E69139',
    },
    info: {
      main: '#4A90E2',
      light: '#6BA3E8',
      dark: '#357ABD',
    },
    success: {
      main: '#51CF66',
      light: '#6DD882',
      dark: '#3BB04F',
    },
    grey: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
    },
    background: {
      default: '#FFFFFF',
      paper: '#F9FAFB',
    },
  },
  
  typography: {
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: 14,
    h1: {
      fontSize: '2.25rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '1.875rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    h3: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4,
    },
    h4: {
      fontSize: '1.25rem',
      fontWeight: 500,
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.5,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
  },
  
  shape: {
    borderRadius: 8,
  },
  
  shadows: [
    'none',
    '0 1px 2px rgba(0, 0, 0, 0.05)',
    '0 4px 6px rgba(0, 0, 0, 0.1)',
    '0 10px 15px rgba(0, 0, 0, 0.1)',
    '0 20px 25px rgba(0, 0, 0, 0.1)',
    // Add more shadows as needed
  ],
  
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none' as const,
          fontWeight: 500,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        },
      },
    },
  },
} as const;

export type MuiTheme = typeof muiTheme;
