import { style } from '@vanilla-extract/css';
import { tokens } from './tokens.css';

export const formSection = style({
  padding: `${tokens.spacing['4xl']} ${tokens.spacing.lg}`,
  backgroundColor: tokens.colors.white,
  '@media': {
    '(max-width: 768px)': {
      padding: `${tokens.spacing['2xl']} ${tokens.spacing.md}`,
    },
  },
});

export const container = style({
  maxWidth: '900px',
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

export const sectionSubtitle = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.lg,
  color: tokens.colors.gray,
  lineHeight: 1.6,
});

export const form = style({
  background: tokens.colors.grayLight,
  padding: tokens.spacing['2xl'],
  borderRadius: tokens.radii.lg,
  boxShadow: tokens.shadows.md,
  '@media': {
    '(max-width: 768px)': {
      padding: tokens.spacing.lg,
    },
  },
});

export const formGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: tokens.spacing.lg,
  marginBottom: tokens.spacing.lg,
  '@media': {
    '(max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
});

export const formGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing.xs,
});

export const label = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  fontWeight: tokens.fontWeights.semiBold,
  color: tokens.colors.black,
});

export const required = style({
  color: tokens.colors.turquoise,
});

export const optional = style({
  color: tokens.colors.gray,
  fontWeight: tokens.fontWeights.regular,
  fontSize: tokens.fontSizes.xs,
});

export const input = style({
  padding: tokens.spacing.md,
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.black,
  backgroundColor: tokens.colors.white,
  border: `2px solid ${tokens.colors.grayLight}`,
  borderRadius: tokens.radii.sm,
  transition: 'border-color 0.3s ease',
  ':focus': {
    outline: 'none',
    borderColor: tokens.colors.turquoise,
  },
});

export const select = style({
  padding: tokens.spacing.md,
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.black,
  backgroundColor: tokens.colors.white,
  border: `2px solid ${tokens.colors.grayLight}`,
  borderRadius: tokens.radii.sm,
  cursor: 'pointer',
  transition: 'border-color 0.3s ease',
  ':focus': {
    outline: 'none',
    borderColor: tokens.colors.turquoise,
  },
});

export const checkboxGroup = style({
  display: 'flex',
  alignItems: 'flex-start',
  gap: tokens.spacing.sm,
  marginBottom: tokens.spacing.xl,
});

export const checkbox = style({
  marginTop: '4px',
  width: '20px',
  height: '20px',
  cursor: 'pointer',
  accentColor: tokens.colors.turquoise,
});

export const checkboxLabel = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.gray,
  lineHeight: 1.5,
});

export const link = style({
  color: tokens.colors.turquoise,
  textDecoration: 'underline',
  ':hover': {
    color: tokens.colors.turquoiseDark,
  },
});

export const submitButton = style({
  width: '100%',
  padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
  backgroundColor: tokens.colors.turquoise,
  color: tokens.colors.white,
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.md,
  fontWeight: tokens.fontWeights.semiBold,
  borderRadius: tokens.radii.sm,
  border: 'none',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 16px rgba(95, 188, 188, 0.3)',
  ':hover': {
    backgroundColor: tokens.colors.turquoiseDark,
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 24px rgba(95, 188, 188, 0.4)',
  },
});

export const successMessage = style({
  padding: tokens.spacing.lg,
  backgroundColor: tokens.colors.turquoise,
  color: tokens.colors.white,
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.md,
  fontWeight: tokens.fontWeights.semiBold,
  borderRadius: tokens.radii.sm,
  textAlign: 'center',
});

export const disclaimer = style({
  marginTop: tokens.spacing.md,
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.xs,
  color: tokens.colors.gray,
  textAlign: 'center',
  fontStyle: 'italic',
});
