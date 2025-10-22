export const formatDate = (date: string | Date): string => {
  return new Date(date).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const formatDateTime = (date: string | Date): string => {
  return new Date(date).toLocaleString('vi-VN');
};

export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString('vi-VN');
};
