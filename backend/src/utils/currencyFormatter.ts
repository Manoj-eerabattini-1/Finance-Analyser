/**
 * Currency Formatting Utility
 * Centralized system to format numbers with currency symbols
 * Supports: INR (₹) and USD ($)
 */

export type CurrencyType = 'INR' | 'USD';

export interface CurrencyConfig {
  symbol: string;
  code: string;
  locale: string;
  decimalPlaces: number;
}

export const CURRENCY_CONFIG: Record<CurrencyType, CurrencyConfig> = {
  INR: {
    symbol: '₹',
    code: 'INR',
    locale: 'en-IN',
    decimalPlaces: 0,
  },
  USD: {
    symbol: '$',
    code: 'USD',
    locale: 'en-US',
    decimalPlaces: 2,
  },
};

/**
 * Format a number with currency symbol
 * @param amount - The numeric value to format
 * @param currency - Currency type (INR or USD)
 * @returns Formatted string with currency symbol and proper locale formatting
 * 
 * @example
 * formatCurrency(500000, 'INR') // ₹5,00,000
 * formatCurrency(500000, 'USD') // $500,000.00
 */
export function formatCurrency(amount: number, currency: CurrencyType = 'INR'): string {
  const config = CURRENCY_CONFIG[currency];
  const formatted = amount.toLocaleString(config.locale, {
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  });
  return `${config.symbol}${formatted}`;
}

/**
 * Format a number for display without currency symbol
 * Useful for calculations and data display
 * @param amount - The numeric value to format
 * @param currency - Currency type (INR or USD)
 * @returns Formatted string with proper locale formatting (no symbol)
 */
export function formatNumber(amount: number, currency: CurrencyType = 'INR'): string {
  const config = CURRENCY_CONFIG[currency];
  return amount.toLocaleString(config.locale, {
    minimumFractionDigits: config.decimalPlaces,
    maximumFractionDigits: config.decimalPlaces,
  });
}

/**
 * Get currency symbol
 * @param currency - Currency type
 * @returns Currency symbol (₹ or $)
 */
export function getCurrencySymbol(currency: CurrencyType = 'INR'): string {
  return CURRENCY_CONFIG[currency].symbol;
}

/**
 * Get currency code
 * @param currency - Currency type
 * @returns Currency code (INR or USD)
 */
export function getCurrencyCode(currency: CurrencyType = 'INR'): string {
  return CURRENCY_CONFIG[currency].code;
}

/**
 * Get locale for the currency
 * @param currency - Currency type
 * @returns Locale string for toLocaleString()
 */
export function getCurrencyLocale(currency: CurrencyType = 'INR'): string {
  return CURRENCY_CONFIG[currency].locale;
}

/**
 * Convert between currencies (simple exchange rate)
 * NOTE: Uses fixed rate for demo. In production, use real exchange rates API
 * Current rate: 1 USD = 83 INR (example)
 * @param amount - Amount to convert
 * @param fromCurrency - Source currency
 * @param toCurrency - Target currency
 * @returns Converted amount
 */
export function convertCurrency(
  amount: number,
  fromCurrency: CurrencyType,
  toCurrency: CurrencyType
): number {
  if (fromCurrency === toCurrency) return amount;

  const EXCHANGE_RATES: Record<string, number> = {
    'INR_to_USD': 1 / 83,
    'USD_to_INR': 83,
  };

  const key = `${fromCurrency}_to_${toCurrency}`;
  const rate = EXCHANGE_RATES[key];

  if (!rate) {
    throw new Error(`Conversion rate not found for ${fromCurrency} to ${toCurrency}`);
  }

  return amount * rate;
}

/**
 * Parse currency string to number
 * Removes currency symbols and formatting
 * @param currencyString - Formatted currency string (e.g., "₹5,00,000" or "$500,000.00")
 * @returns Numeric value
 * 
 * @example
 * parseCurrency('₹5,00,000') // 500000
 * parseCurrency('$500,000.00') // 500000
 */
export function parseCurrency(currencyString: string): number {
  // Remove currency symbols and commas
  const cleaned = currencyString.replace(/[₹$,]/g, '').trim();
  return parseFloat(cleaned);
}

/**
 * Check if a currency is valid
 * @param currency - Currency to validate
 * @returns true if currency is valid
 */
export function isValidCurrency(currency: string): currency is CurrencyType {
  return currency === 'INR' || currency === 'USD';
}

/**
 * Get default currency (fallback)
 * @returns Default currency type
 */
export function getDefaultCurrency(): CurrencyType {
  return 'INR';
}
