import { style } from '@vanilla-extract/css';
import { tokens } from './tokens.css';

export const comparisonSection = style({
  padding: `${tokens.spacing['4xl']} ${tokens.spacing.lg}`,
  backgroundColor: tokens.colors.white,
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

export const tableWrapper = style({
  overflow: 'auto',
  borderRadius: tokens.radii.lg,
  boxShadow: tokens.shadows.md,
});

export const table = style({
  width: '100%',
  borderCollapse: 'collapse',
  backgroundColor: tokens.colors.white,
  '@media': {
    '(max-width: 768px)': {
      fontSize: tokens.fontSizes.sm,
    },
  },
});

export const thFeature = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.md,
  fontWeight: tokens.fontWeights.semiBold,
  color: tokens.colors.black,
  padding: tokens.spacing.lg,
  textAlign: 'left',
  borderBottom: `2px solid ${tokens.colors.grayLight}`,
  backgroundColor: tokens.colors.grayLight,
});

export const thPackage = style({
  fontFamily: tokens.fonts.heading,
  fontSize: tokens.fontSizes.xl,
  fontWeight: tokens.fontWeights.bold,
  color: tokens.colors.black,
  padding: tokens.spacing.lg,
  textAlign: 'center',
  borderBottom: `2px solid ${tokens.colors.grayLight}`,
  backgroundColor: tokens.colors.grayLight,
});

export const packageHeader = style({
  position: 'relative',
});

export const bestChoiceBadge = style({
  display: 'inline-block',
  padding: `${tokens.spacing.xs} ${tokens.spacing.sm}`,
  backgroundColor: tokens.colors.gold,
  color: tokens.colors.black,
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.xs,
  fontWeight: tokens.fontWeights.semiBold,
  borderRadius: tokens.radii.sm,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
  marginBottom: tokens.spacing.xs,
});

export const packageName = style({
  margin: 0,
});

export const tdFeature = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  fontWeight: tokens.fontWeights.regular,
  color: tokens.colors.gray,
  padding: tokens.spacing.md,
  textAlign: 'left',
  borderBottom: `1px solid ${tokens.colors.grayLight}`,
});

export const tdValue = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.md,
  padding: tokens.spacing.md,
  textAlign: 'center',
  borderBottom: `1px solid ${tokens.colors.grayLight}`,
});

export const tdPrice = style({
  fontFamily: tokens.fonts.heading,
  fontSize: tokens.fontSizes.lg,
  fontWeight: tokens.fontWeights.semiBold,
  color: tokens.colors.turquoise,
  padding: tokens.spacing.md,
  textAlign: 'center',
  borderBottom: `1px solid ${tokens.colors.grayLight}`,
});

export const tdNote = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.xs,
  color: tokens.colors.gray,
  padding: tokens.spacing.md,
  textAlign: 'center',
  fontStyle: 'italic',
});

export const checkmark = style({
  color: tokens.colors.turquoise,
  fontSize: tokens.fontSizes.xl,
  fontWeight: tokens.fontWeights.bold,
});

export const cross = style({
  color: tokens.colors.grayDark,
  fontSize: tokens.fontSizes.xl,
});

export const optional = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.gold,
  fontWeight: tokens.fontWeights.semiBold,
});

export const note = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.xs,
  color: tokens.colors.gray,
  marginTop: tokens.spacing.xs,
});
