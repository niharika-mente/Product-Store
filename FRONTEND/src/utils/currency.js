const SYMBOLS = { USD: '$', EUR: '€', INR: '₹' };

export function formatPrice(usdPrice, currency, rates) {
  const symbol = SYMBOLS[currency] ?? '$';
  const rate = rates?.[currency] ?? 1;
  const converted = (Number(usdPrice) || 0) * rate;

  if (currency === 'INR') {
    return `${symbol}${converted.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  return `${symbol}${converted.toFixed(2)}`;
}

export const CURRENCY_SYMBOLS = SYMBOLS;