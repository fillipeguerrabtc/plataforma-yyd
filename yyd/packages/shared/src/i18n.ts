/**
 * YYD i18n Utilities
 * Multilingual support for EN, PT, ES
 */

export type Locale = 'en' | 'pt' | 'es';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'pt', 'es'];

export const DEFAULT_LOCALE: Locale = 'en';

/**
 * Validate and normalize locale
 * @param locale - Locale string to validate
 * @returns Valid Locale or default
 */
export function normalizeLocale(locale?: string | null): Locale {
  if (!locale) return DEFAULT_LOCALE;

  const lowerLocale = locale.toLowerCase().split('-')[0];
  if (SUPPORTED_LOCALES.includes(lowerLocale as Locale)) {
    return lowerLocale as Locale;
  }

  return DEFAULT_LOCALE;
}

/**
 * Get translated field from object
 * @param obj - Object with *En, *Pt, *Es fields
 * @param fieldName - Base field name (e.g., 'title')
 * @param locale - Desired locale
 * @returns Translated string or fallback to EN
 */
export function getTranslatedField<T extends Record<string, any>>(
  obj: T,
  fieldName: string,
  locale: Locale
): string {
  const capitalizedLocale =
    locale.charAt(0).toUpperCase() + locale.slice(1);
  const fieldKey = `${fieldName}${capitalizedLocale}` as keyof T;

  const value = obj[fieldKey];
  if (typeof value === 'string' && value.length > 0) {
    return value;
  }

  // Fallback to English
  const fallbackKey = `${fieldName}En` as keyof T;
  return (obj[fallbackKey] as string) || '';
}

/**
 * Common translations
 */
export const translations = {
  // Contact channels
  whatsapp: {
    en: 'WhatsApp',
    pt: 'WhatsApp',
    es: 'WhatsApp',
  },
  messenger: {
    en: 'Messenger',
    pt: 'Messenger',
    es: 'Messenger',
  },
  email: {
    en: 'Email',
    pt: 'Email',
    es: 'Correo',
  },
  // CTAs
  bookNow: {
    en: 'Book Now',
    pt: 'Reservar Agora',
    es: 'Reservar Ahora',
  },
  learnMore: {
    en: 'Learn More',
    pt: 'Saiba Mais',
    es: 'Más Información',
  },
  contactUs: {
    en: 'Contact Us',
    pt: 'Entre em Contato',
    es: 'Contáctenos',
  },
  // Booking flow
  selectTour: {
    en: 'Select Tour',
    pt: 'Selecione o Tour',
    es: 'Seleccionar Tour',
  },
  selectDate: {
    en: 'Select Date',
    pt: 'Selecione a Data',
    es: 'Seleccionar Fecha',
  },
  numberOfPeople: {
    en: 'Number of People',
    pt: 'Número de Pessoas',
    es: 'Número de Personas',
  },
  totalPrice: {
    en: 'Total Price',
    pt: 'Preço Total',
    es: 'Precio Total',
  },
  // Tour details
  duration: {
    en: 'Duration',
    pt: 'Duração',
    es: 'Duración',
  },
  included: {
    en: 'Included',
    pt: 'Incluído',
    es: 'Incluido',
  },
  notIncluded: {
    en: 'Not Included',
    pt: 'Não Incluído',
    es: 'No Incluido',
  },
  // Season labels
  lowSeason: {
    en: 'November to April',
    pt: 'Novembro a Abril',
    es: 'Noviembre a Abril',
  },
  highSeason: {
    en: 'May to October',
    pt: 'Maio a Outubro',
    es: 'Mayo a Octubre',
  },
  // Status
  pending: {
    en: 'Pending',
    pt: 'Pendente',
    es: 'Pendiente',
  },
  confirmed: {
    en: 'Confirmed',
    pt: 'Confirmado',
    es: 'Confirmado',
  },
  completed: {
    en: 'Completed',
    pt: 'Concluído',
    es: 'Completado',
  },
  cancelled: {
    en: 'Cancelled',
    pt: 'Cancelado',
    es: 'Cancelado',
  },
};

/**
 * Get translation for a key
 * @param key - Translation key
 * @param locale - Desired locale
 * @returns Translated string
 */
export function t(
  key: keyof typeof translations,
  locale: Locale = DEFAULT_LOCALE
): string {
  return translations[key][locale] || translations[key].en;
}

/**
 * Format date for locale
 * @param date - Date to format
 * @param locale - Locale
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string
 */
export function formatDate(
  date: Date,
  locale: Locale = DEFAULT_LOCALE,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }
): string {
  const localeMap: Record<Locale, string> = {
    en: 'en-US',
    pt: 'pt-PT',
    es: 'es-ES',
  };

  return new Intl.DateTimeFormat(localeMap[locale], options).format(
    date
  );
}

/**
 * Pluralize words
 * @param count - Number for pluralization
 * @param singular - Singular form
 * @param plural - Plural form (optional, defaults to singular + 's' for EN)
 * @param locale - Locale
 * @returns Pluralized string
 */
export function pluralize(
  count: number,
  singular: string,
  plural?: string,
  locale: Locale = DEFAULT_LOCALE
): string {
  if (count === 1) return singular;

  if (plural) return plural;

  // Simple EN pluralization
  if (locale === 'en') return `${singular}s`;

  // PT/ES often use 's' too
  return `${singular}s`;
}
