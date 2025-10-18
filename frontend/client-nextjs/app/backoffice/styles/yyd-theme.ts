export const yydTheme = {
  colors: {
    primary: '#00B5CC',
    primaryHover: '#33C5DD',
    secondary: '#33C5DD',
    whatsapp: '#25D366',
    accentRed: '#FF2E2E',
    textDark: '#222222',
    textLight: '#5C5C5C',
    bgLight: '#FAFAFA',
    divider: '#E4E4E4',
    white: '#FFFFFF',
    gold: '#FFD700',
  },
  
  gradients: {
    primary: 'linear-gradient(180deg, #33C5DD 0%, #00B5CC 100%)',
    sidebar: 'linear-gradient(135deg, #00B5CC 0%, #33C5DD 100%)',
  },
  
  fonts: {
    decorative: "'Playball', cursive",
    heading: "'Poppins', sans-serif",
    body: "'Open Sans', sans-serif",
  },
  
  shadows: {
    soft: '0 3px 10px rgba(0,0,0,0.08)',
    medium: '0 6px 18px rgba(0,0,0,0.12)',
    strong: '0 10px 25px rgba(0,0,0,0.15)',
    primary: '0 3px 8px rgba(0,181,204,0.25)',
    whatsapp: '0 2px 6px rgba(37,211,102,0.4)',
  },
  
  spacing: {
    xs: '8px',
    sm: '16px',
    md: '24px',
    lg: '32px',
    xl: '48px',
    xxl: '64px',
    section: '80px',
  },
  
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    pill: '24px',
  },
};

export const buttonStyles = {
  primary: {
    backgroundColor: yydTheme.colors.primary,
    color: yydTheme.colors.white,
    fontFamily: yydTheme.fonts.heading,
    fontWeight: 600,
    borderRadius: yydTheme.borderRadius.md,
    padding: '12px 28px',
    boxShadow: yydTheme.shadows.primary,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    fontSize: '16px',
  },
  
  whatsapp: {
    backgroundColor: yydTheme.colors.whatsapp,
    color: yydTheme.colors.white,
    fontFamily: yydTheme.fonts.heading,
    fontWeight: 600,
    borderRadius: yydTheme.borderRadius.pill,
    padding: '10px 22px',
    boxShadow: yydTheme.shadows.whatsapp,
    border: 'none',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    fontSize: '16px',
  },
  
  secondary: {
    backgroundColor: yydTheme.colors.white,
    color: yydTheme.colors.primary,
    fontFamily: yydTheme.fonts.heading,
    fontWeight: 600,
    borderRadius: yydTheme.borderRadius.md,
    padding: '12px 28px',
    border: `2px solid ${yydTheme.colors.primary}`,
    cursor: 'pointer',
    transition: 'all 0.3s ease-in-out',
    fontSize: '16px',
  },
};

export const cardStyles = {
  base: {
    backgroundColor: yydTheme.colors.white,
    borderRadius: yydTheme.borderRadius.lg,
    padding: yydTheme.spacing.md,
    boxShadow: yydTheme.shadows.soft,
    border: `1px solid ${yydTheme.colors.divider}`,
  },
};
