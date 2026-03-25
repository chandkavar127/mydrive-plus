import dayjs from 'dayjs';

export const formatBytes = (bytes = 0) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / 1024 ** index).toFixed(1)} ${units[index]}`;
};

export const formatDate = (value) => (value ? dayjs(value).format('MMM D, YYYY HH:mm') : '—');

export const fileTypeLabel = (type = '') => {
  if (type.startsWith('image/')) return 'Image';
  if (type === 'application/pdf') return 'PDF';
  if (type.startsWith('video/')) return 'Video';
  if (type.includes('zip')) return 'Archive';
  return 'Document';
};
