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
  position: 'relative',
  background: tokens.colors.white,
  borderRadius: '24px',
  overflow: 'hidden',
  boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
  border: `2px solid ${tokens.colors.grayLight}`,
  transition: 'all 0.3s ease',
  ':hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0 8px 32px rgba(95, 188, 188, 0.2)',
    borderColor: tokens.colors.turquoise,
  },
});

export const bestChoiceBadge = style({
  position: 'absolute',
  top: tokens.spacing.md,
  right: tokens.spacing.md,
  padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
  backgroundColor: tokens.colors.gold,
  color: tokens.colors.black,
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.xs,
  fontWeight: tokens.fontWeights.semiBold,
  borderRadius: tokens.radii.full,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  zIndex: 10,
});

export const popularBadge = style({
  position: 'absolute',
  top: tokens.spacing.md,
  right: tokens.spacing.md,
  padding: `${tokens.spacing.xs} ${tokens.spacing.md}`,
  backgroundColor: tokens.colors.turquoise,
  color: tokens.colors.white,
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.xs,
  fontWeight: tokens.fontWeights.semiBold,
  borderRadius: tokens.radii.full,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  zIndex: 10,
});

export const tourCategory = style({
  color: tokens.colors.turquoise,
  fontWeight: tokens.fontWeights.semiBold,
  fontSize: tokens.fontSizes.xs,
  marginBottom: tokens.spacing.sm,
  textTransform: 'uppercase',
  letterSpacing: '1px',
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

export const tourMeta = style({
  display: 'flex',
  gap: tokens.spacing.lg,
  marginBottom: tokens.spacing.lg,
  paddingTop: tokens.spacing.md,
  borderTop: `1px solid ${tokens.colors.grayLight}`,
});

export const tourMetaItem = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.xs,
});

export const tourMetaIcon = style({
  fontSize: tokens.fontSizes.md,
});

export const tourMetaText = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.gray,
  fontWeight: tokens.fontWeights.regular,
});

export const tourPriceSection = style({
  paddingTop: tokens.spacing.md,
  marginBottom: tokens.spacing.lg,
  borderTop: `1px solid ${tokens.colors.grayLight}`,
});

export const tourPriceWrapper = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing.xs,
});

export const tourPriceLabel = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.xs,
  color: tokens.colors.gray,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
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
  background: tokens.colors.turquoise,
  color: tokens.colors.white,
  padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
  fontSize: tokens.fontSizes.md,
  fontWeight: tokens.fontWeights.semiBold,
  borderRadius: tokens.radii.full,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 12px rgba(95, 188, 188, 0.3)',
  ':hover': {
    background: tokens.colors.turquoiseDark,
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(95, 188, 188, 0.4)',
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

// Tours Section
export const toursSection = style({
  padding: `${tokens.spacing['4xl']} ${tokens.spacing.lg}`,
  backgroundColor: tokens.colors.white,
  '@media': {
    '(max-width: 768px)': {
      padding: `${tokens.spacing['2xl']} ${tokens.spacing.md}`,
    },
  },
});

export const toursSectionHeader = style({
  textAlign: 'center',
  marginBottom: tokens.spacing['3xl'],
});

export const toursSectionTitle = style({
  fontFamily: tokens.fonts.heading,
  fontSize: tokens.fontSizes['3xl'],
  fontWeight: tokens.fontWeights.bold,
  color: tokens.colors.black,
  marginBottom: tokens.spacing.lg,
  '@media': {
    '(max-width: 768px)': {
      fontSize: tokens.fontSizes.xl,
    },
  },
});

export const toursSectionSubtitle = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.lg,
  color: tokens.colors.gray,
  maxWidth: '800px',
  margin: '0 auto',
  lineHeight: 1.6,
  '@media': {
    '(max-width: 768px)': {
      fontSize: tokens.fontSizes.md,
    },
  },
});

// Footer enhancements
export const footerContent = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: tokens.spacing.xl,
  marginBottom: tokens.spacing.xl,
  textAlign: 'left',
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
      textAlign: 'center',
    },
  },
});

export const footerBrand = style({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
  gap: tokens.spacing.sm,
  '@media': {
    '(max-width: 768px)': {
      alignItems: 'center',
    },
  },
});

export const footerLogo = style({
  width: '60px',
  height: '60px',
  borderRadius: tokens.radii.full,
  background: tokens.colors.white,
  padding: tokens.spacing.xs,
});

export const footerTagline = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.grayDark,
  lineHeight: 1.4,
});

export const footerLinks = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing.sm,
});

export const footerLink = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.white,
  textDecoration: 'none',
  transition: 'color 0.3s ease',
  ':hover': {
    color: tokens.colors.turquoise,
  },
});

export const footerSocial = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing.sm,
});

export const socialLink = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.white,
  textDecoration: 'none',
  transition: 'color 0.3s ease',
  ':hover': {
    color: tokens.colors.gold,
  },
});

export const footerBottom = style({
  paddingTop: tokens.spacing.xl,
  borderTop: `1px solid rgba(255, 255, 255, 0.1)`,
  textAlign: 'center',
});

export const footerCopyright = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.white,
  marginBottom: tokens.spacing.sm,
});
