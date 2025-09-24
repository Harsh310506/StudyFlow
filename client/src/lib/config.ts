// Environment configuration
export const config = {
  API_BASE_URL: import.meta.env.VITE_API_URL || (
    import.meta.env.MODE === 'development' 
      ? 'http://localhost:5000'  // Updated to match server port
      : 'https://studenttasker-backend.onrender.com'
  ),
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

// API base URL function with automatic detection
export function getApiUrl(): string {
  if (typeof window !== 'undefined') {
    // Client-side detection
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:5000';
    }
    // For production, use the environment variable or default
    return import.meta.env.VITE_API_URL || 'https://studenttasker-backend.onrender.com';
  }
  
  // Server-side fallback
  return config.API_BASE_URL;
}

export default config;