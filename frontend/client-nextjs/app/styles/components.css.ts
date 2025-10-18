import { style } from '@vanilla-extract/css';
import { tokens } from './tokens.css';

export const container = style({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: `0 ${tokens.spacing.lg}`,
});

export const header = style({
  background: `linear-gradient(135deg, ${tokens.colors.turquoise} 0%, ${tokens.colors.turquoiseDark} 100%)`,
  color: tokens.colors.white,
  padding: `${tokens.spacing.lg} 0`,
  boxShadow: tokens.shadows.brand,
});

export const headerContent = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.lg,
  '@media': {
    '(max-width: 768px)': {
      flexDirection: 'column',
      textAlign: 'center',
    },
  },
});

export const headerLogo = style({
  width: '80px',
  height: '80px',
  borderRadius: tokens.radii.full,
  background: tokens.colors.white,
  padding: tokens.spacing.xs,
  boxShadow: tokens.shadows.sm,
});

export const headerTitle = style({
  fontSize: tokens.fontSizes['4xl'],
  fontWeight: tokens.fontWeights.extraBold,
  marginBottom: tokens.spacing.sm,
  textShadow: '2px 2px 4px rgba(0,0,0,0.1)',
  '@media': {
    '(max-width: 768px)': {
      fontSize: tokens.fontSizes['2xl'],
    },
  },
});

export const headerSubtitle = style({
  fontSize: tokens.fontSizes.lg,
  fontWeight: tokens.fontWeights.light,
  opacity: 0.95,
  '@media': {
    '(max-width: 768px)': {
      fontSize: tokens.fontSizes.sm,
    },
  },
});

export const main = style({
  flex: 1,
  padding: `${tokens.spacing['3xl']} 0`,
});

export const heroSection = style({
  textAlign: 'center',
  marginBottom: tokens.spacing['3xl'],
});

export const heroTitle = style({
  fontSize: tokens.fontSizes['4xl'],
  color: tokens.colors.black,
  marginBottom: tokens.spacing.md,
  '@media': {
    '(max-width: 768px)': {
      fontSize: tokens.fontSizes['2xl'],
    },
  },
});

export const heroSubtitle = style({
  fontSize: tokens.fontSizes.lg,
  color: tokens.colors.gray,
  maxWidth: '800px',
  margin: '0 auto',
});

export const toursGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
  gap: tokens.spacing.xl,
  marginTop: tokens.spacing['2xl'],
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
      gap: tokens.spacing.lg,
    },
  },
});

export const tourCard = style({
  background: tokens.colors.white,
  borderRadius: tokens.radii.lg,
  overflow: 'hidden',
  boxShadow: tokens.shadows.md,
  border: `3px solid ${tokens.colors.gold}`,
  transition: 'all 0.3s ease',
  ':hover': {
    transform: 'translateY(-8px)',
    boxShadow: tokens.shadows.lg,
    borderColor: tokens.colors.turquoise,
  },
});

export const tourCardContent = style({
  padding: tokens.spacing.xl,
});

export const tourTitle = style({
  fontSize: tokens.fontSizes['2xl'],
  color: tokens.colors.black,
  marginBottom: tokens.spacing.md,
  fontWeight: tokens.fontWeights.extraBold,
});

export const tourCity = style({
  color: tokens.colors.turquoise,
  fontWeight: tokens.fontWeights.semiBold,
  fontSize: tokens.fontSizes.sm,
  marginBottom: tokens.spacing.md,
  textTransform: 'uppercase',
  letterSpacing: '1px',
});

export const tourDescription = style({
  color: tokens.colors.gray,
  marginBottom: tokens.spacing.lg,
  lineHeight: 1.8,
  fontSize: tokens.fontSizes.sm,
});

export const tourDetails = style({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: tokens.spacing.lg,
  paddingTop: tokens.spacing.lg,
  borderTop: `2px solid ${tokens.colors.grayLight}`,
});

export const tourPrice = style({
  fontSize: tokens.fontSizes['3xl'],
  fontWeight: tokens.fontWeights.extraBold,
  color: tokens.colors.turquoise,
  fontFamily: tokens.fonts.heading,
});

export const tourDuration = style({
  color: tokens.colors.gray,
  fontWeight: tokens.fontWeights.semiBold,
});

export const bookButton = style({
  width: '100%',
  background: `linear-gradient(135deg, ${tokens.colors.gold} 0%, ${tokens.colors.goldDark} 100%)`,
  color: tokens.colors.white,
  padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
  fontSize: tokens.fontSizes.md,
  fontWeight: tokens.fontWeights.bold,
  borderRadius: tokens.radii.md,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  ':hover': {
    background: `linear-gradient(135deg, ${tokens.colors.turquoise} 0%, ${tokens.colors.turquoiseDark} 100%)`,
  },
});

export const footer = style({
  background: tokens.colors.black,
  color: tokens.colors.white,
  padding: `${tokens.spacing['2xl']} 0`,
  marginTop: tokens.spacing['4xl'],
  textAlign: 'center',
});

export const footerText = style({
  fontSize: tokens.fontSizes.md,
  marginBottom: tokens.spacing.sm,
});

export const footerCities = style({
  fontSize: tokens.fontSizes.xs,
  color: tokens.colors.grayDark,
  marginTop: tokens.spacing.md,
});

export const loading = style({
  textAlign: 'center',
  padding: `${tokens.spacing['4xl']} ${tokens.spacing.lg}`,
});

export const loadingText = style({
  fontSize: tokens.fontSizes.xl,
  color: tokens.colors.turquoise,
  fontWeight: tokens.fontWeights.semiBold,
});
