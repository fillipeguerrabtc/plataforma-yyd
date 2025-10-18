import { style } from '@vanilla-extract/css';
import { tokens } from './tokens.css';

export const whatsappButton = style({
  position: 'fixed',
  bottom: tokens.spacing['2xl'],
  left: tokens.spacing.lg,
  display: 'flex',
  alignItems: 'center',
  gap: tokens.spacing.md,
  padding: `${tokens.spacing.md} ${tokens.spacing.xl}`,
  backgroundColor: tokens.colors.whatsapp,
  color: tokens.colors.white,
  border: 'none',
  borderRadius: tokens.radii.full,
  boxShadow: '0 4px 20px rgba(37, 211, 102, 0.4)',
  cursor: 'pointer',
  fontSize: tokens.fontSizes.md,
  fontWeight: tokens.fontWeights.semiBold,
  fontFamily: tokens.fonts.body,
  zIndex: 1000,
  transition: 'all 0.2s ease',
  
  '@media': {
    '(max-width: 768px)': {
      bottom: tokens.spacing.lg,
      left: '50%',
      transform: 'translateX(-50%)',
      padding: `${tokens.spacing.sm} ${tokens.spacing.lg}`,
      fontSize: tokens.fontSizes.sm,
    },
  },

  selectors: {
    '&:hover': {
      boxShadow: '0 6px 24px rgba(37, 211, 102, 0.5)',
    },
  },
});

export const whatsappIcon = style({
  width: '24px',
  height: '24px',
  flexShrink: 0,

  '@media': {
    '(max-width: 768px)': {
      width: '20px',
      height: '20px',
    },
  },
});

export const whatsappText = style({
  '@media': {
    '(max-width: 480px)': {
      display: 'none',
    },
  },
});
