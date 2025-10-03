/**
 * Utility functions for formatting numbers, currency, and percentages
 * with proper internationalization and accessibility support
 */

// Currency formatting that matches existing component patterns
export const formatCurrency = (amount: number, showCurrency = true): string => {
  const prefix = showCurrency ? 'EGP ' : '';
  if (amount >= 1000000000) return `${prefix}${(amount / 1000000000).toFixed(2)}B`;
  if (amount >= 1000000) return `${prefix}${(amount / 1000000).toFixed(1)}M`;
  if (amount >= 1000) return `${prefix}${(amount / 1000).toFixed(0)}K`;
  return `${prefix}${amount.toLocaleString()}`;
};

// Compact number formatting for large values
export const formatNumber = (number: number): string => {
  if (number >= 1000000000) return (number / 1000000000).toFixed(1) + 'B';
  if (number >= 1000000) return (number / 1000000).toFixed(1) + 'M';
  if (number >= 1000) return (number / 1000).toFixed(0) + 'K';
  return number.toLocaleString();
};

// Percentage formatting with customizable decimals
export const formatPercentage = (value: number, decimals = 1): string => {
  return value.toFixed(decimals) + '%';
};

// Simple number formatting without abbreviation
export const formatSimpleNumber = (number: number): string => {
  return number.toLocaleString();
};

// Metric card value formatting that handles different formats
export const formatMetricValue = (
  value: number, 
  format: 'number' | 'currency' | 'percentage' | 'simple'
): string => {
  switch (format) {
    case 'number':
      return formatNumber(value);
    case 'currency':
      return value.toFixed(2);
    case 'percentage':
      return formatPercentage(value);
    case 'simple':
      return value.toString();
    default:
      return value.toLocaleString();
  }
};

export const formatDate = (
  date: Date | string | number,
  options?: Intl.DateTimeFormatOptions & { locale?: string }
): string => {
  const { locale = 'en-US', ...formatOptions } = options || {};
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...formatOptions
  };

  try {
    const dateObj = new Date(date);
    return new Intl.DateTimeFormat(locale, defaultOptions).format(dateObj);
  } catch {
    return new Date(date).toLocaleDateString();
  }
};

export const formatDuration = (milliseconds: number): string => {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
};

/**
 * Formats numbers with appropriate suffixes for screen readers
 */
export const formatForScreenReader = (
  value: number,
  type: 'currency' | 'percentage' | 'number' = 'number'
): string => {
  switch (type) {
    case 'currency':
      return `${formatCurrency(value)} Egyptian pounds`;
    case 'percentage':
      return `${formatPercentage(value)} percent`;
    default:
      return `${formatNumber(value)} items`;
  }
};