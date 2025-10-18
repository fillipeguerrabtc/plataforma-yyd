import { style } from '@vanilla-extract/css';
import { tokens } from './tokens.css';

export const socialProofSection = style({
  padding: `${tokens.spacing['4xl']} 0`,
  backgroundColor: tokens.colors.white,
});

export const container = style({
  maxWidth: '1200px',
  margin: '0 auto',
  padding: `0 ${tokens.spacing.lg}`,
});

export const content = style({
  textAlign: 'center',
});

export const tagline = style({
  fontSize: tokens.fontSizes.xl,
  fontFamily: tokens.fonts.body,
  fontStyle: 'italic',
  color: tokens.colors.gray,
  marginBottom: tokens.spacing['3xl'],
  lineHeight: '1.6',
  maxWidth: '800px',
  margin: '0 auto',
  marginBottom: tokens.spacing['3xl'],
});

export const statsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: tokens.spacing.xl,
  marginBottom: tokens.spacing['3xl'],

  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
      gap: tokens.spacing.lg,
    },
  },
});

export const statCard = style({
  textAlign: 'center',
});

export const statNumber = style({
  fontSize: tokens.fontSizes['4xl'],
  fontFamily: tokens.fonts.heading,
  fontWeight: tokens.fontWeights.bold,
  color: tokens.colors.turquoise,
  marginBottom: tokens.spacing.sm,
  lineHeight: '1.2',

  '@media': {
    '(max-width: 768px)': {
      fontSize: tokens.fontSizes['3xl'],
    },
  },
});

export const statLabel = style({
  fontSize: tokens.fontSizes.sm,
  fontFamily: tokens.fonts.body,
  color: tokens.colors.gray,
  textTransform: 'lowercase',
});

export const badges = style({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  gap: tokens.spacing['2xl'],
  flexWrap: 'wrap',
  marginTop: tokens.spacing['2xl'],
});

export const badge = style({
  padding: tokens.spacing.xl,
  backgroundColor: tokens.colors.grayLight,
  borderRadius: tokens.radii.md,
});

export const googleBadge = style({
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.md,
});

export const googleIcon = style({
  width: '48px',
  height: '48px',
});

export const rating = style({
  fontSize: tokens.fontSizes['2xl'],
  fontWeight: tokens.fontWeights.bold,
  color: tokens.colors.black,
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.xs,
});

export const ratingText = style({
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.gray,
  marginTop: tokens.spacing.xs,
});

export const abcBadge = style({
  padding: tokens.spacing.xl,
  backgroundColor: '#FFC107',
  borderRadius: '50%',
  width: '180px',
  height: '180px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
});

export const abcText = style({
  fontSize: tokens.fontSizes.xs,
  fontWeight: tokens.fontWeights.semiBold,
  color: tokens.colors.black,
  marginBottom: tokens.spacing.xs,
});

export const abcLogo = style({
  fontSize: tokens.fontSizes.lg,
  fontWeight: tokens.fontWeights.extraBold,
  color: tokens.colors.black,
  fontFamily: tokens.fonts.heading,
  lineHeight: '1.2',
  marginBottom: tokens.spacing.xs,
});

export const abcSubtext = style({
  fontSize: tokens.fontSizes.xs,
  color: tokens.colors.black,
});
