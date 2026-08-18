import axios from 'axios';

// Detect the exact base URL of the environment the browser is running on
const getBaseURL = (): string => {
  // If running in a browser environment, deduce paths dynamically
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    
    // Check if the current URL is a local development instance
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      return 'http://localhost:5000/api'; // Fallback to your local dev backend port
    }
    
    // If running live on production (GitHub Pages / Vercel), point directly to its relative api gateway
    return `${origin}/api`;
  }
  
  return '/api'; // Standard static fallback
};

const apiClient = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to securely append the authorization token
apiClient.interceptors.request.use(
  (config) => {
    // Explicitly cast window configuration to avoid strict TypeScript metadata blocks
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
    
    if (token && config.url) {
      // Guardrail: Detect absolute URLs to untrusted third-party domains
      const isInternal = !config.url.startsWith('http://') && !config.url.startsWith('https://');
      const isExplicitBase = config.baseURL && config.url.startsWith(config.baseURL);

      // Securely append the bearer token only if it matches your application's domain environment
      if (isInternal || isExplicitBase) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle 401 Unauthorized responses gracefully
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      if (typeof window !== 'undefined') {
        // Clear the expired or invalid token
        localStorage.removeItem('auth_token');
        
        // Redirect to the login page
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;