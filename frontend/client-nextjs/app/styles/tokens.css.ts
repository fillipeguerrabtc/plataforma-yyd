import { createGlobalTheme } from '@vanilla-extract/css';

export const tokens = createGlobalTheme(':root', {
  colors: {
    turquoise: '#37C8C4',
    turquoiseDark: '#2aa8a4',
    gold: '#E9C46A',
    goldDark: '#d4a84f',
    black: '#1A1A1A',
    white: '#FFFFFF',
    grayLight: '#F5F5F5',
    gray: '#666666',
    grayDark: '#999999',
  },
  fonts: {
    heading: "'Montserrat', sans-serif",
    body: "'Lato', sans-serif",
  },
  fontWeights: {
    light: '300',
    regular: '400',
    semiBold: '600',
    bold: '700',
    extraBold: '800',
  },
  fontSizes: {
    xs: '0.875rem',
    sm: '1rem',
    md: '1.125rem',
    lg: '1.25rem',
    xl: '1.5rem',
    '2xl': '1.75rem',
    '3xl': '2rem',
    '4xl': '2.5rem',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
    '3xl': '64px',
    '4xl': '80px',
  },
  radii: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    full: '9999px',
  },
  shadows: {
    sm: '0 4px 12px rgba(0,0,0,0.1)',
    md: '0 8px 24px rgba(0,0,0,0.1)',
    lg: '0 12px 32px rgba(55, 200, 196, 0.2)',
    brand: '0 4px 20px rgba(55, 200, 196, 0.3)',
  },
});
