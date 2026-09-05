/**
 * Formats a numeric value as Indian Rupee (INR) currency.
 * @param {number} value
 * @returns {string}
 */
export const formatCurrency = (value) => {
  const num = Number(value) || 0;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(num);
};

/**
 * Formats an ISO date string to a human-readable Indian ledger date.
 * @param {string|null} value
 * @returns {string}
 */
export const formatDate = (value) => {
  if (!value) return 'No previous record';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

/**
 * Formats a date with time for receipts and logs.
 * @param {string} isoString
 * @returns {string}
 */
export const formatDateTime = (isoString) => {
  if (!isoString) return '';
  const parsed = new Date(isoString);
  if (Number.isNaN(parsed.getTime())) return isoString;
  return parsed.toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
};

/**
 * Formats a weight with unit.
 * @param {number} weight
 * @param {string} unit
 * @returns {string}
 */
export const formatWeight = (weight, unit = 'kg') => {
  const num = Number(weight) || 0;
  return `${num.toFixed(1)} ${unit}`;
};

/**
 * Formats an Indian phone number with space separation for readability.
 * @param {string} phone
 * @returns {string}
 */
export const formatPhone = (phone) => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};
