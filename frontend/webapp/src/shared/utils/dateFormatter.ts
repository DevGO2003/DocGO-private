/**
 * Format date to Vietnamese locale
 * @param date - Date string, Date object, or timestamp
 * @returns Formatted date string or 'N/A' if invalid
 */
export const formatDate = (date: string | Date | number | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    
    // Check if date is valid
    if (isNaN(dateObj.getTime())) {
      console.warn('Invalid date:', date);
      return 'N/A';
    }
    
    // Check if date is Unix epoch (1970-01-01)
    if (dateObj.getTime() === 0 || dateObj.getFullYear() === 1970) {
      console.warn('Date is Unix epoch:', date);
      return 'N/A';
    }
    
    return dateObj.toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting date:', date, error);
    return 'N/A';
  }
};

/**
 * Format date with time to Vietnamese locale
 */
export const formatDateTime = (date: string | Date | number | null | undefined): string => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = new Date(date);
    
    if (isNaN(dateObj.getTime()) || dateObj.getTime() === 0) {
      return 'N/A';
    }
    
    return dateObj.toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (error) {
    console.error('Error formatting datetime:', date, error);
    return 'N/A';
  }
};
