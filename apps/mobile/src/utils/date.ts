/**
 * Safely format any date input (string, Date object, timestamp number) into a localized string.
 * Guarantees that a string is returned, never an Object, undefined, or Date instance.
 */
export const formatDateSafe = (
  val: unknown,
  options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  },
  locale: string = 'en-IN'
): string => {
  if (val === null || val === undefined || val === '') {
    return '';
  }

  try {
    if (val instanceof Date) {
      return isNaN(val.getTime()) ? '' : val.toLocaleDateString(locale, options);
    }

    if (typeof val === 'number') {
      const d = new Date(val);
      return isNaN(d.getTime()) ? '' : d.toLocaleDateString(locale, options);
    }

    if (typeof val === 'string') {
      const trimmed = val.trim();
      if (!trimmed) return '';
      const d = new Date(trimmed);
      if (!isNaN(d.getTime())) {
        return d.toLocaleDateString(locale, options);
      }
      return trimmed;
    }

    const str = String(val);
    const d = new Date(str);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(locale, options);
    }
    return str;
  } catch {
    return String(val || '');
  }
};

/**
 * Format any date input to YYYY-MM-DD for date inputs
 */
export const formatDateToYMD = (val: unknown): string => {
  if (!val) return '';
  try {
    const d = val instanceof Date ? val : new Date(typeof val === 'string' || typeof val === 'number' ? val : String(val));
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch {
    return '';
  }
};
