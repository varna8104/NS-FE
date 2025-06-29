// API configuration utility
const getApiUrl = () => {
  // Always use the production backend URL in production
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return 'https://ns-be.onrender.com';
  }
  // In development, use localhost
  return 'http://localhost:8000';
};

export const API_BASE_URL = getApiUrl();

export const apiCall = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
  
  if (!response.ok) {
    throw new Error(`API call failed: ${response.status}`);
  }
  
  return response.json();
}; 