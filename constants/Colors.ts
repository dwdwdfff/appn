// Color palette based on the main page design
export const Colors = {
  // Primary colors (from main page)
  primary: '#3B82F6',      // Blue - main action color
  primaryLight: '#EBF4FF', // Light blue background
  primaryDark: '#1E40AF',  // Dark blue for emphasis
  
  // Secondary colors
  secondary: '#10B981',    // Green - success/money
  secondaryLight: '#F0FDF4', // Light green background
  secondaryDark: '#059669', // Dark green
  
  // Accent colors
  accent: '#8B5CF6',       // Purple - special features
  accentLight: '#F3E8FF',  // Light purple
  accentDark: '#7C3AED',   // Dark purple
  
  // Warning/Alert colors
  warning: '#F59E0B',      // Orange/Yellow
  warningLight: '#FEF3C7', // Light yellow
  error: '#EF4444',        // Red
  errorLight: '#FEF2F2',   // Light red
  
  // Neutral colors
  background: '#F8FAFC',   // Main background
  surface: '#FFFFFF',      // Card/surface background
  surfaceSecondary: '#F1F5F9', // Secondary surface
  
  // Text colors
  textPrimary: '#1E293B',  // Main text
  textSecondary: '#64748B', // Secondary text
  textTertiary: '#9CA3AF', // Tertiary text/placeholders
  
  // Border colors
  border: '#E2E8F0',       // Main border
  borderLight: '#F1F5F9',  // Light border
  borderDark: '#CBD5E1',   // Dark border
  
  // Status colors
  success: '#10B981',
  info: '#3B82F6',
  
  // Gradient colors
  gradientStart: '#3B82F6',
  gradientEnd: '#8B5CF6',
};

// Theme object for easy access
export const Theme = {
  colors: Colors,
  
  // Common styles
  shadow: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  shadowLarge: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 8,
  },
  
  // Border radius
  borderRadius: {
    small: 8,
    medium: 12,
    large: 16,
    xl: 20,
  },
  
  // Spacing
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
  },
  
  // Typography
  typography: {
    h1: {
      fontSize: 28,
      fontWeight: '700' as const,
      color: Colors.textPrimary,
    },
    h2: {
      fontSize: 24,
      fontWeight: '700' as const,
      color: Colors.textPrimary,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600' as const,
      color: Colors.textPrimary,
    },
    h4: {
      fontSize: 18,
      fontWeight: '600' as const,
      color: Colors.textPrimary,
    },
    body: {
      fontSize: 16,
      fontWeight: '400' as const,
      color: Colors.textPrimary,
    },
    bodySecondary: {
      fontSize: 14,
      fontWeight: '400' as const,
      color: Colors.textSecondary,
    },
    caption: {
      fontSize: 12,
      fontWeight: '400' as const,
      color: Colors.textTertiary,
    },
  },
};

export default Colors;