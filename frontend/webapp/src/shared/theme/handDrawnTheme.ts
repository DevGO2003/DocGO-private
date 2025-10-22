/**
 * Hand-Drawn Theme Configuration
 * Theme settings for rough.js and hand-drawn UI components
 */

export const handDrawnTheme = {
  // Rough.js settings
  roughness: {
    low: 0.5,
    medium: 1.5,
    high: 2.5,
  },
  strokeWidth: {
    thin: 1,
    normal: 2,
    thick: 3,
    bold: 4,
  },
  fillWeight: {
    light: 1,
    normal: 3,
    heavy: 5,
  },
  
  // Colors
  colors: {
    primary: '#4A90E2',
    primaryDark: '#357ABD',
    primaryLight: '#6BA3E8',
    
    secondary: '#7B68EE',
    secondaryDark: '#5E4FBF',
    secondaryLight: '#9580F3',
    
    accent: '#FF6B6B',
    accentDark: '#E54F4F',
    accentLight: '#FF8787',
    
    success: '#51CF66',
    warning: '#FFA94D',
    error: '#FF6B6B',
    info: '#4A90E2',
    
    gray: {
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
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    },
  },
  
  // Spacing
  spacing: {
    xs: '0.25rem',  // 4px
    sm: '0.5rem',   // 8px
    md: '1rem',     // 16px
    lg: '1.5rem',   // 24px
    xl: '2rem',     // 32px
    '2xl': '3rem',  // 48px
  },
  
  // Border radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',
    md: '0.5rem',
    lg: '0.75rem',
    full: '9999px',
  },
  
  // Shadows (subtle for hand-drawn style)
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.1)',
    xl: '0 20px 25px rgba(0, 0, 0, 0.1)',
  },
  
  // Typography
  typography: {
    fontFamily: {
      primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      heading: 'Georgia, Cambria, "Times New Roman", Times, serif',
      mono: 'Monaco, Consolas, "Courier New", monospace',
    },
    fontSize: {
      xs: '0.75rem',    // 12px
      sm: '0.875rem',   // 14px
      base: '1rem',     // 16px
      lg: '1.125rem',   // 18px
      xl: '1.25rem',    // 20px
      '2xl': '1.5rem',  // 24px
      '3xl': '1.875rem',// 30px
      '4xl': '2.25rem', // 36px
    },
    fontWeight: {
      light: 300,
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
  },
  
  // Animations
  animations: {
    duration: {
      fast: 150,
      normal: 300,
      slow: 500,
    },
    easing: {
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  
  // Z-index layers
  zIndex: {
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
} as const;

export type HandDrawnTheme = typeof handDrawnTheme;
