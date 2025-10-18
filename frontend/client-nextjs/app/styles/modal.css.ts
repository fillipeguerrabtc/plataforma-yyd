import { style } from '@vanilla-extract/css';
import { tokens } from './tokens.css';

export const overlay = style({
  position: 'fixed',
  inset: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.7)',
  zIndex: 50,
});

export const content = style({
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  backgroundColor: tokens.colors.white,
  borderRadius: tokens.radii.lg,
  padding: tokens.spacing.xl,
  maxWidth: '600px',
  width: '90%',
  maxHeight: '85vh',
  overflow: 'auto',
  zIndex: 51,
  boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
});

export const title = style({
  fontSize: tokens.fontSizes['3xl'],
  fontWeight: tokens.fontWeights.extraBold,
  color: tokens.colors.black,
  marginBottom: tokens.spacing.sm,
  fontFamily: tokens.fonts.heading,
});

export const description = style({
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.turquoise,
  fontWeight: tokens.fontWeights.semiBold,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  marginBottom: tokens.spacing.lg,
});

export const section = style({
  marginBottom: tokens.spacing.lg,
});

export const sectionTitle = style({
  fontSize: tokens.fontSizes.lg,
  fontWeight: tokens.fontWeights.bold,
  marginBottom: tokens.spacing.md,
  fontFamily: tokens.fonts.heading,
  color: tokens.colors.black,
});

export const sectionText = style({
  color: tokens.colors.gray,
  lineHeight: 1.8,
  fontSize: tokens.fontSizes.sm,
});

export const priceBox = style({
  backgroundColor: tokens.colors.grayLight,
  padding: tokens.spacing.lg,
  borderRadius: tokens.radii.md,
  marginBottom: tokens.spacing.lg,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
});

export const priceLabel = style({
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.gray,
});

export const priceValue = style({
  fontSize: '2.5rem',
  fontWeight: tokens.fontWeights.extraBold,
  color: tokens.colors.turquoise,
  fontFamily: tokens.fonts.heading,
});

export const buttonGroup = style({
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: tokens.spacing.md,
});

export const cancelButton = style({
  padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
  fontSize: tokens.fontSizes.sm,
  fontWeight: tokens.fontWeights.semiBold,
  borderRadius: tokens.radii.md,
  border: `2px solid ${tokens.colors.gold}`,
  backgroundColor: tokens.colors.white,
  color: tokens.colors.gold,
  cursor: 'pointer',
  fontFamily: tokens.fonts.heading,
  transition: 'all 0.3s ease',
  ':hover': {
    backgroundColor: tokens.colors.grayLight,
  },
});

export const confirmButton = style({
  padding: `${tokens.spacing.md} ${tokens.spacing.lg}`,
  fontSize: tokens.fontSizes.sm,
  fontWeight: tokens.fontWeights.bold,
  borderRadius: tokens.radii.md,
  background: `linear-gradient(135deg, ${tokens.colors.gold} 0%, ${tokens.colors.goldDark} 100%)`,
  color: tokens.colors.white,
  border: 'none',
  cursor: 'pointer',
  fontFamily: tokens.fonts.heading,
  textTransform: 'uppercase',
  letterSpacing: '1px',
  transition: 'all 0.3s ease',
  ':hover': {
    background: `linear-gradient(135deg, ${tokens.colors.turquoise} 0%, ${tokens.colors.turquoiseDark} 100%)`,
  },
  ':disabled': {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
});

export const form = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing.md,
});

export const formGroup = style({
  display: 'flex',
  flexDirection: 'column',
  gap: tokens.spacing.xs,
});

export const label = style({
  fontSize: tokens.fontSizes.sm,
  fontWeight: tokens.fontWeights.semiBold,
  color: tokens.colors.black,
  fontFamily: tokens.fonts.body,
});

export const input = style({
  padding: tokens.spacing.md,
  fontSize: tokens.fontSizes.sm,
  borderRadius: tokens.radii.md,
  border: `2px solid ${tokens.colors.grayLight}`,
  fontFamily: tokens.fonts.body,
  transition: 'border-color 0.2s ease',
  ':focus': {
    outline: 'none',
    borderColor: tokens.colors.turquoise,
  },
});

export const error = style({
  padding: tokens.spacing.md,
  backgroundColor: '#fee',
  color: '#c00',
  borderRadius: tokens.radii.md,
  fontSize: tokens.fontSizes.sm,
  fontWeight: tokens.fontWeights.semiBold,
});

export const confirmationBox = style({
  textAlign: 'center',
  padding: tokens.spacing.xl,
});

export const confirmationIcon = style({
  fontSize: '4rem',
  marginBottom: tokens.spacing.md,
});

export const confirmationTitle = style({
  fontSize: tokens.fontSizes['2xl'],
  fontWeight: tokens.fontWeights.extraBold,
  color: tokens.colors.turquoise,
  marginBottom: tokens.spacing.md,
  fontFamily: tokens.fonts.heading,
});

export const confirmationText = style({
  fontSize: tokens.fontSizes.md,
  color: tokens.colors.gray,
  marginBottom: tokens.spacing.lg,
});

export const confirmationDetails = style({
  backgroundColor: tokens.colors.grayLight,
  padding: tokens.spacing.lg,
  borderRadius: tokens.radii.md,
  marginBottom: tokens.spacing.lg,
  textAlign: 'left',
});

export const confirmationNote = style({
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.gray,
  marginBottom: tokens.spacing.lg,
  fontStyle: 'italic',
});
