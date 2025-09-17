/**
 * Currency conversion utilities
 */

// Примерный курс доллара к суму (можно обновлять через API)
const USD_TO_UZS_RATE = 12500

/**
 * Convert USD to UZS
 */
export function convertUsdToUzs(usdAmount: number): number {
  return Math.round(usdAmount * USD_TO_UZS_RATE)
}

/**
 * Format UZS amount with proper formatting
 */
export function formatUzs(amount: number): string {
  return new Intl.NumberFormat('uz-UZ', {
    style: 'currency',
    currency: 'UZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

/**
 * Format UZS amount with spaces for thousands
 */
export function formatUzsWithSpaces(amount: number): string {
  return amount.toLocaleString('uz-UZ') + ' so\'m'
}

/**
 * Get currency symbol
 */
export function getCurrencySymbol(): string {
  return 'so\'m'
}
