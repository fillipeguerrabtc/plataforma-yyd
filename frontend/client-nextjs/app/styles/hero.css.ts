import { style } from '@vanilla-extract/css';
import { tokens } from './tokens.css';

export const hero = style({
  position: 'relative',
  minHeight: '85vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: `linear-gradient(135deg, ${tokens.colors.turquoise} 0%, ${tokens.colors.turquoiseDark} 100%)`,
  overflow: 'hidden',
  '@media': {
    '(max-width: 768px)': {
      minHeight: '70vh',
    },
  },
});

export const heroOverlay = style({
  position: 'absolute',
  inset: 0,
  backgroundImage: 'url("https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1920&q=80")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  opacity: 0.15,
  zIndex: 0,
});

export const heroContent = style({
  position: 'relative',
  zIndex: 1,
  maxWidth: '1200px',
  margin: '0 auto',
  padding: `${tokens.spacing['3xl']} ${tokens.spacing.lg}`,
  textAlign: 'center',
});

export const heroTextContainer = style({
  maxWidth: '900px',
  margin: '0 auto',
});

export const heroTitle = style({
  fontFamily: tokens.fonts.heading,
  fontSize: tokens.fontSizes['4xl'],
  fontWeight: tokens.fontWeights.bold,
  color: tokens.colors.white,
  marginBottom: tokens.spacing.lg,
  lineHeight: 1.2,
  '@media': {
    '(max-width: 768px)': {
      fontSize: tokens.fontSizes['2xl'],
    },
  },
});

export const heroTitleHighlight = style({
  color: tokens.colors.gold,
  display: 'block',
  marginTop: tokens.spacing.sm,
});

export const heroSubtitle = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.lg,
  fontWeight: tokens.fontWeights.regular,
  color: tokens.colors.white,
  marginBottom: tokens.spacing['2xl'],
  lineHeight: 1.6,
  opacity: 0.95,
  '@media': {
    '(max-width: 768px)': {
      fontSize: tokens.fontSizes.md,
    },
  },
});

export const heroButtons = style({
  display: 'flex',
  gap: tokens.spacing.md,
  justifyContent: 'center',
  marginBottom: tokens.spacing['2xl'],
  '@media': {
    '(max-width: 768px)': {
      flexDirection: 'column',
      alignItems: 'center',
    },
  },
});

export const heroCTA = style({
  display: 'inline-block',
  padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
  backgroundColor: tokens.colors.gold,
  color: tokens.colors.black,
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.md,
  fontWeight: tokens.fontWeights.semiBold,
  borderRadius: tokens.radii.sm,
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 16px rgba(233, 196, 106, 0.3)',
  ':hover': {
    backgroundColor: tokens.colors.goldDark,
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(233, 196, 106, 0.4)',
  },
});

export const heroCTASecondary = style({
  display: 'inline-block',
  padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
  backgroundColor: 'transparent',
  color: tokens.colors.white,
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.md,
  fontWeight: tokens.fontWeights.semiBold,
  borderRadius: tokens.radii.sm,
  textDecoration: 'none',
  border: `2px solid ${tokens.colors.white}`,
  transition: 'all 0.3s ease',
  ':hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    transform: 'translateY(-2px)',
  },
});

export const trustBadge = style({
  display: 'inline-flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: tokens.spacing.md,
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: tokens.radii.md,
  marginBottom: tokens.spacing.lg,
  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
});

export const trustStars = style({
  fontSize: tokens.fontSizes.lg,
  marginBottom: tokens.spacing.xs,
});

export const trustText = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.black,
});

export const mediaFeature = style({
  marginTop: tokens.spacing.lg,
});

export const asSeenOn = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.white,
  marginBottom: tokens.spacing.xs,
  textTransform: 'uppercase',
  letterSpacing: '1px',
});

export const abcBadge = style({
  display: 'inline-block',
  padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  color: tokens.colors.white,
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.md,
  fontWeight: tokens.fontWeights.semiBold,
  borderRadius: tokens.radii.sm,
  backdropFilter: 'blur(10px)',
});
