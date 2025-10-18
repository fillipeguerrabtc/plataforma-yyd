import { style } from '@vanilla-extract/css';
import { tokens } from './tokens.css';

export const testimonialsSection = style({
  padding: `${tokens.spacing['4xl']} ${tokens.spacing.lg}`,
  backgroundColor: tokens.colors.grayLight,
  '@media': {
    '(max-width: 768px)': {
      padding: `${tokens.spacing['2xl']} ${tokens.spacing.md}`,
    },
  },
});

export const container = style({
  maxWidth: '1200px',
  margin: '0 auto',
});

export const textCenter = style({
  textAlign: 'center',
  marginBottom: tokens.spacing['3xl'],
});

export const sectionTitle = style({
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

export const sectionSubtitle = style({
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

export const testimonialsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: tokens.spacing.xl,
  marginBottom: tokens.spacing['3xl'],
});

export const testimonialCard = style({
  padding: tokens.spacing.xl,
  backgroundColor: tokens.colors.white,
  borderRadius: tokens.radii.lg,
  boxShadow: tokens.shadows.md,
  position: 'relative',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  ':hover': {
    transform: 'translateY(-4px)',
    boxShadow: tokens.shadows.lg,
  },
});

export const quoteIcon = style({
  fontFamily: tokens.fonts.heading,
  fontSize: '4rem',
  color: tokens.colors.turquoise,
  lineHeight: 0.8,
  marginBottom: tokens.spacing.md,
  opacity: 0.2,
});

export const quote = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.md,
  color: tokens.colors.black,
  lineHeight: 1.6,
  marginBottom: tokens.spacing.lg,
  fontStyle: 'italic',
});

export const author = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.md,
  paddingTop: tokens.spacing.md,
  borderTop: `1px solid ${tokens.colors.grayLight}`,
});

export const avatar = style({
  width: '48px',
  height: '48px',
  borderRadius: tokens.radii.full,
  backgroundColor: tokens.colors.grayLight,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: '1.5rem',
});

export const authorName = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  fontWeight: tokens.fontWeights.semiBold,
  color: tokens.colors.black,
});

export const authorLocation = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.xs,
  color: tokens.colors.gray,
});

export const ctaContainer = style({
  textAlign: 'center',
});

export const ctaButton = style({
  display: 'inline-block',
  padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
  backgroundColor: tokens.colors.turquoise,
  color: tokens.colors.white,
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.md,
  fontWeight: tokens.fontWeights.semiBold,
  borderRadius: tokens.radii.sm,
  textDecoration: 'none',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 16px rgba(95, 188, 188, 0.3)',
  ':hover': {
    backgroundColor: tokens.colors.turquoiseDark,
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(95, 188, 188, 0.4)',
  },
});
