// API configuration utility
const getApiUrl = () => {
  // In production, use the environment variable
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return process.env.NEXT_PUBLIC_API_URL || 'https://your-backend-url.vercel.app';
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