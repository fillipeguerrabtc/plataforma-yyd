/**
 * YYD Platform Constants
 */

export const BRAND = {
  name: 'Yes, You Deserve',
  shortName: 'YYD',
  tagline: 'No Crowds. No Stress. Just You and Sintra.',
  founder: 'Daniel Ponce',
  location: 'Sintra & Cascais, Portugal',
} as const;

export const COLORS = {
  // Primary brand colors
  black: '#1A1A1A',
  white: '#FFFFFF',
  // Accent colors
  turquoise: '#37C8C4',
  gold: '#E9C46A',
  bordeaux: '#7E3231',
} as const;

export const CONTACT = {
  whatsapp: {
    link: 'http://wa.link/y0m3y9',
    phone: '+351 123 456 789',
    priority: 1,
  },
  facebook: {
    link: 'https://www.m.me/1566043420168290',
    pageId: '1566043420168290',
    priority: 2,
  },
  email: {
    address: 'info@yesyoudeserve.tours',
    priority: 3,
  },
} as const;

export const STATS = {
  happyClients: 600,
  yearsOfExpertise: 10,
  fiveStarReviews: 257,
} as const;

export const AWARDS = [
  {
    title: 'Most Unique Tuk Tuk Tour Company 2024 – Portugal',
    organization: 'Lux Life Digital',
    year: 2024,
  },
  {
    title: 'Best Private Tour Company in Portugal of 2025',
    organization: 'Evergreen Awards',
    year: 2025,
  },
  {
    title: 'Featured on ABC Good Morning America',
    organization: 'ABC',
    year: 2024,
  },
] as const;

export const BOOKING_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SUCCEEDED: 'succeeded',
  FAILED: 'failed',
  REFUNDED: 'refunded',
} as const;

export const MESSAGE_DIRECTION = {
  INBOUND: 'inbound',
  OUTBOUND: 'outbound',
} as const;

export const MESSAGE_CHANNEL = {
  WHATSAPP: 'whatsapp',
  FACEBOOK: 'facebook',
  EMAIL: 'email',
  INTERNAL: 'internal',
} as const;

export const MAX_GROUP_SIZE = 36;
export const DEFAULT_CURRENCY = 'BRL'; // Changed from EUR to match Brazilian Stripe test accounts

/**
 * Seasonal periods
 */
export const SEASONS = {
  low: {
    name: 'Low Season',
    months: [11, 12, 1, 2, 3, 4], // Nov-Apr
    label: 'November to April',
  },
  high: {
    name: 'High Season',
    months: [5, 6, 7, 8, 9, 10], // May-Oct
    label: 'May to October',
  },
} as const;

/**
 * Tour slugs
 */
export const TOUR_SLUGS = {
  HALF_DAY: 'personalized-half-day-tour',
  FULL_DAY: 'personalized-full-day-tour',
  ALL_INCLUSIVE: 'all-inclusive-experience',
} as const;
