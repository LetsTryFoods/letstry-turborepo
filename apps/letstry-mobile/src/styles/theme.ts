export const theme = {
  colors: {
    primary: '#E8A020',
    primaryDark: '#C8881A',
    secondary: '#F2D377',
    background: '#FFFFFF',
    surface: '#F5F5F5',
    text: {
      primary: '#222222',
      secondary: '#666666',
      muted: '#9E9E9E',
      inverse: '#FFFFFF',
    },
    border: '#E0E0E0',
    error: '#D32F2F',
    success: '#388E3C',
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  borderRadius: {
    sm: 6,
    md: 12,
    lg: 20,
    full: 9999,
  },
  fontSize: {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 18,
    xl: 22,
    xxl: 28,
  },
  fontWeight: {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },
};

export type Theme = typeof theme;
