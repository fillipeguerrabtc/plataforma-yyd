import { style } from '@vanilla-extract/css';
import { tokens } from './tokens.css';

export const contactSection = style({
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
  marginBottom: tokens.spacing['2xl'],
});

export const contactTitle = style({
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

export const contactSubtitle = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.lg,
  color: tokens.colors.gray,
  maxWidth: '700px',
  margin: '0 auto',
  lineHeight: 1.6,
});

export const contactGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: tokens.spacing.xl,
  marginTop: tokens.spacing['2xl'],
});

export const contactCard = style({
  position: 'relative',
  padding: tokens.spacing.xl,
  backgroundColor: tokens.colors.white,
  borderRadius: tokens.radii.lg,
  boxShadow: tokens.shadows.md,
  textAlign: 'center',
  textDecoration: 'none',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  ':hover': {
    transform: 'translateY(-4px)',
    boxShadow: tokens.shadows.lg,
  },
});

export const recommendedBadge = style({
  position: 'absolute',
  top: tokens.spacing.md,
  right: tokens.spacing.md,
  padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
  backgroundColor: tokens.colors.gold,
  color: tokens.colors.black,
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.xs,
  fontWeight: tokens.fontWeights.semiBold,
  borderRadius: tokens.radii.sm,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

export const lastOptionBadge = style({
  position: 'absolute',
  top: tokens.spacing.md,
  right: tokens.spacing.md,
  padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
  backgroundColor: tokens.colors.grayLight,
  color: tokens.colors.gray,
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.xs,
  fontWeight: tokens.fontWeights.semiBold,
  borderRadius: tokens.radii.sm,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
});

export const contactIcon = style({
  fontSize: '3rem',
  marginBottom: tokens.spacing.lg,
});

export const contactMethod = style({
  fontFamily: tokens.fonts.heading,
  fontSize: tokens.fontSizes.xl,
  fontWeight: tokens.fontWeights.semiBold,
  color: tokens.colors.black,
  marginBottom: tokens.spacing.sm,
});

export const contactDescription = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.md,
  color: tokens.colors.gray,
  marginBottom: tokens.spacing.lg,
  lineHeight: 1.6,
});

export const contactButton = style({
  padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
  backgroundColor: tokens.colors.turquoise,
  color: tokens.colors.white,
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  fontWeight: tokens.fontWeights.semiBold,
  borderRadius: tokens.radii.sm,
  transition: 'background-color 0.3s ease',
});
