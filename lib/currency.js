const inrFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a numeric amount as Indian Rupees (e.g. ₹1,234.56). */
export function formatINR(value) {
  const n = Number(value);
  if (Number.isNaN(n)) return inrFormatter.format(0);
  return inrFormatter.format(n);
}
