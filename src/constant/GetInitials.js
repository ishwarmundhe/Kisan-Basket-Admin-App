export const getInitials = (name = '') => {
    const parts = name.trim().split(' ');
    return parts.map(p => p[0]?.toUpperCase()).join('');
  };
  