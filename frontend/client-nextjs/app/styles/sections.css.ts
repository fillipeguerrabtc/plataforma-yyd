import { style } from '@vanilla-extract/css';
import { tokens } from './tokens.css';

export const section = style({
  padding: `${tokens.spacing['4xl']} ${tokens.spacing.lg}`,
  '@media': {
    '(max-width: 768px)': {
      padding: `${tokens.spacing['2xl']} ${tokens.spacing.md}`,
    },
  },
});

export const sectionGray = style({
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

export const sectionTitle = style({
  fontFamily: tokens.fonts.heading,
  fontSize: tokens.fontSizes['3xl'],
  fontWeight: tokens.fontWeights.bold,
  color: tokens.colors.black,
  marginBottom: tokens.spacing.lg,
  lineHeight: 1.3,
  '@media': {
    '(max-width: 768px)': {
      fontSize: tokens.fontSizes.xl,
    },
  },
});

export const sectionText = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.lg,
  fontWeight: tokens.fontWeights.regular,
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

// Awards Section
export const awardsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
  gap: tokens.spacing.xl,
  marginTop: tokens.spacing['2xl'],
});

export const awardCard = style({
  padding: tokens.spacing.xl,
  backgroundColor: tokens.colors.white,
  borderRadius: tokens.radii.lg,
  boxShadow: tokens.shadows.md,
  textAlign: 'center',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  ':hover': {
    transform: 'translateY(-4px)',
    boxShadow: tokens.shadows.lg,
  },
});

export const awardIcon = style({
  fontSize: '4rem',
  marginBottom: tokens.spacing.lg,
});

export const awardTitle = style({
  fontFamily: tokens.fonts.heading,
  fontSize: tokens.fontSizes.xl,
  fontWeight: tokens.fontWeights.semiBold,
  color: tokens.colors.black,
  marginBottom: tokens.spacing.sm,
});

export const awardSubtitle = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.lg,
  fontWeight: tokens.fontWeights.semiBold,
  color: tokens.colors.turquoise,
  marginBottom: tokens.spacing.xs,
});

export const awardOrg = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.sm,
  color: tokens.colors.gray,
});

// Features Section
export const featuresGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
  gap: tokens.spacing.xl,
  marginTop: tokens.spacing['2xl'],
});

export const featureCard = style({
  padding: tokens.spacing.xl,
  textAlign: 'center',
});

export const featureIcon = style({
  fontSize: '3rem',
  marginBottom: tokens.spacing.lg,
});

export const featureTitle = style({
  fontFamily: tokens.fonts.heading,
  fontSize: tokens.fontSizes.xl,
  fontWeight: tokens.fontWeights.semiBold,
  color: tokens.colors.black,
  marginBottom: tokens.spacing.md,
});

export const featureDescription = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.md,
  color: tokens.colors.gray,
  lineHeight: 1.6,
});

// Stats Section
export const statsSection = style({
  padding: `${tokens.spacing['4xl']} ${tokens.spacing.lg}`,
  backgroundColor: tokens.colors.white,
  '@media': {
    '(max-width: 768px)': {
      padding: `${tokens.spacing['2xl']} ${tokens.spacing.md}`,
    },
  },
});

export const statsIntro = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.lg,
  color: tokens.colors.gray,
  marginBottom: tokens.spacing['2xl'],
});

export const statsGrid = style({
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
  gap: tokens.spacing.xl,
});

export const statCard = style({
  textAlign: 'center',
  padding: tokens.spacing.lg,
});

export const statNumber = style({
  fontFamily: tokens.fonts.heading,
  fontSize: tokens.fontSizes['4xl'],
  fontWeight: tokens.fontWeights.bold,
  color: tokens.colors.turquoise,
  marginBottom: tokens.spacing.sm,
  '@media': {
    '(max-width: 768px)': {
      fontSize: tokens.fontSizes['2xl'],
    },
  },
});

export const statLabel = style({
  fontFamily: tokens.fonts.body,
  fontSize: tokens.fontSizes.md,
  color: tokens.colors.gray,
  textTransform: 'lowercase',
});
