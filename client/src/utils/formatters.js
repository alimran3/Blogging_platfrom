export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const formatReadTime = (minutes) => {
  if (minutes < 1) return 'Less than a minute';
  if (minutes === 1) return '1 min read';
  return `${minutes} min read`;
};

export const truncateText = (text, maxLength) => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
};

export const slugify = (text) => {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};

export const capitalizeFirst = (text) => {
  return text.charAt(0).toUpperCase() + text.slice(1);
};