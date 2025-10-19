/**
 * YYD Pricing Engine
 * Handles seasonal pricing, party size tiers, and multi-currency support
 */

export type Season = 'low' | 'high';
export type PricingTier = {
  season: Season;
  tier: string;
  minPeople: number;
  maxPeople: number | null;
  priceEur: number;
  pricePerPerson: boolean;
};

/**
 * Determines the season based on month and date
 * @param date - Date to check
 * @returns 'low' (Nov-Apr except Dec 23-Jan 1) or 'high' (May-Oct + Dec 23-Jan 1)
 */
export function getSeason(date: Date): Season {
  const month = date.getMonth() + 1; // 1-12
  const day = date.getDate();

  // High season: Dec 23 - Jan 1
  if ((month === 12 && day >= 23) || (month === 1 && day <= 1)) {
    return 'high';
  }

  // High season: May-Oct (months 5-10)
  if (month >= 5 && month <= 10) {
    return 'high';
  }

  // Low season: Nov-Apr (except Dec 23-Jan 1)
  return 'low';
}

/**
 * Calculates total price based on party size, season, and date
 * @param tiers - Available pricing tiers (must include season)
 * @param numberOfPeople - Party size
 * @param date - Booking date (determines season)
 * @returns Total price in EUR or null if no matching tier
 */
export function calculatePrice(
  tiers: PricingTier[],
  numberOfPeople: number,
  date: Date
): number | null {
  const season = getSeason(date);

  // Filter tiers by season first
  const seasonTiers = tiers.filter((tier) => tier.season === season);

  // Find matching tier by party size
  const matchingTier = seasonTiers.find(
    (tier) =>
      numberOfPeople >= tier.minPeople &&
      (tier.maxPeople === null || numberOfPeople <= tier.maxPeople)
  );

  if (!matchingTier) {
    return null;
  }

  if (matchingTier.pricePerPerson) {
    return matchingTier.priceEur * numberOfPeople;
  }

  return matchingTier.priceEur;
}

/**
 * Get season-specific price range for a product
 * @param tiers - All pricing tiers for a product
 * @param season - Specific season to filter
 * @returns { min: number, max: number } or null
 */
export function getPriceRangeBySeason(
  tiers: PricingTier[],
  season: Season
): { min: number; max: number } | null {
  const seasonTiers = tiers.filter((tier) => tier.season === season);
  
  if (seasonTiers.length === 0) return null;

  const prices = seasonTiers.map((tier) => tier.priceEur);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/**
 * Format price for display
 * @param priceEur - Price in EUR
 * @param currency - Currency code (default: EUR)
 * @param locale - Locale for formatting (default: en-US)
 * @returns Formatted price string
 */
export function formatPrice(
  priceEur: number,
  currency: string = 'EUR',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(priceEur);
}

/**
 * Get price range for a product (all seasons)
 * @param tiers - All pricing tiers for a product
 * @returns { min: number, max: number } or null
 */
export function getPriceRange(tiers: PricingTier[]): {
  min: number;
  max: number;
} | null {
  if (tiers.length === 0) return null;

  const prices = tiers.map((tier) => tier.priceEur);
  return {
    min: Math.min(...prices),
    max: Math.max(...prices),
  };
}

/**
 * Calculate per-person price for display
 * @param totalPrice - Total price
 * @param numberOfPeople - Party size
 * @returns Per-person price
 */
export function calculatePerPersonPrice(
  totalPrice: number,
  numberOfPeople: number
): number {
  return totalPrice / numberOfPeople;
}

/**
 * Get current season based on today's date
 * @returns Current season
 */
export function getCurrentSeason(): Season {
  return getSeason(new Date());
}

/**
 * Check if date is in high season
 * @param date - Date to check
 * @returns true if high season, false otherwise
 */
export function isHighSeason(date: Date): boolean {
  return getSeason(date) === 'high';
}
