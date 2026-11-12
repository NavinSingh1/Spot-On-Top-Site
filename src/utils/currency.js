export const CURRENCIES = [
  { value: 'INR', label: 'INR' },
  { value: 'USD', label: 'USD' },
];

/**
 * Formats an INR amount in the requested currency (₹1,25,000 or $1,488).
 * `usdRate` is rupees per dollar and comes from GET /settings.
 */
export function formatMoney(amountInr, currency = 'INR', usdRate) {
  if (currency === 'USD' && !usdRate) return '—';
  const value = Math.round(currency === 'USD' ? amountInr / usdRate : amountInr);
  return new Intl.NumberFormat(currency === 'USD' ? 'en-US' : 'en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
}

export function formatPercent(value, digits = 1) {
  return `${(value * 100).toFixed(digits)}%`;
}
