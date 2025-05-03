// API base URL
export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost';

// Image URL
export const getImageUrl = (path) => {
  if (!path) return null;
  
  // If the path is already a full URL
  if (path.startsWith('http')) {
    return path;
  }
  
  // Otherwise, construct the URL
  return `${API_URL}${path}`;
};

// Default pagination
export const DEFAULT_PAGE_SIZE = 20;