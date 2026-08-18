import axios, { AxiosInstance, AxiosRequestConfig, CreateAxiosDefaults } from 'axios';

/**
 * Configuration for the API client factory.
 */
const DEFAULT_CONFIG: CreateAxiosDefaults = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
};

/**
 * Creates a centralized Axios instance with pre-configured interceptors.
 * 
 * @param config - Optional Axios configuration to override defaults.
 * @returns A configured AxiosInstance.
 */
export const createApiClient = (config: CreateAxiosDefaults = {}): AxiosInstance => {
  const instance = axios.create({
    ...DEFAULT_CONFIG,
    ...config,
  });

  // Request Interceptor: Authentication
  instance.interceptors.request.use(
    (config) => {
      // In a browser environment, retrieve the token from storage
      if (typeof window !== 'undefined') {
        const token = localStorage.getItem('auth_token');
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Error Handling & Data Transformation
  instance.interceptors.response.use(
    (response) => {
      // Return the data directly or the full response based on preference
      return response;
    },
    async (error) => {
      const originalRequest = error.config;

      // Handle specific HTTP status codes
      if (error.response) {
        const { status, data } = error.response;

        switch (status) {
          case 401:
            // Logic for unauthorized access (e.g., token refresh or logout)
            console.error('Unauthorized access. Please log in again.');
            if (typeof window !== 'undefined') {
              // Optional: localStorage.removeItem('auth_token');
              // Optional: window.location.href = '/login';
            }
            break;

          case 403:
            console.error('Forbidden: You do not have permission to perform this action.');
            break;

          case 404:
            console.error('Resource not found.');
            break;

          case 422:
            console.error('Validation error:', data.errors || data.message);
            break;

          case 500:
            console.error('Internal server error. Please try again later.');
            break;

          default:
            console.error(`API Error (${status}):`, data.message || error.message);
        }
      } else if (error.request) {
        // The request was made but no response was received
        console.error('Network error: No response received from server.');
      } else {
        // Something happened in setting up the request
        console.error('Request setup error:', error.message);
      }

      return Promise.reject(error);
    }
  );

  return instance;
};

/**
 * Default API client instance for general use throughout the application.
 */
const apiClient = createApiClient();

export default apiClient;