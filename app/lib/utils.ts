/**
 * Formats a date string to a consistent format in local time
 * @param dateString - ISO string or any date format parseable by Date constructor
 * @param options - Whether to include time (default true)
 * @returns Formatted date string
 */
export const formatDateTime = (dateString: string, { includeTime = true }: { includeTime?: boolean } = {}) => {
  if (!dateString) return '';
  
  try {
    // Create a Date object and check if it's valid
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.error('Invalid date:', dateString);
      return 'Invalid date';
    }
    
    // Use a consistent locale and timezone to avoid hydration mismatches
    const options: Intl.DateTimeFormatOptions = includeTime
      ? {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'UTC' // Use UTC to avoid timezone mismatches
        }
      : {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          timeZone: 'UTC' // Use UTC to avoid timezone mismatches
        };
    
    // Use en-US locale to ensure consistent formatting between server and client
    return date.toLocaleString('en-US', options);
  } catch (error) {
    console.error('Date formatting error:', error);
    return 'Invalid date'; // Return a consistent string if parsing fails
  }
};

export const processMatchPercent = (matchPercent: number) => {
  if (!matchPercent) {
    return 50;
  }
  return Math.min(Math.round(matchPercent * 100) + 15, 100);
}