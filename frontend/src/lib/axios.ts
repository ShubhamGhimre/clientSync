import axios, { AxiosError, AxiosResponse } from 'axios';
import { getAuthToken, removeAuthToken } from './auth';

// Dynamically get subdomain and set API base URL
const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
const subdomain = hostname.split('.')[0];
const apiBase = `http://${subdomain}.localhost:5000`;

export const api = axios.create({
  baseURL: apiBase,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    // Add auth token to requests
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log successful responses in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url}`, response.data);
    }

    return response;
  },
  (error: AxiosError) => {
    // Handle different types of errors
    if (error.response) {
      const { status, data } = error.response;

      // Handle authentication errors
      if (status === 401) {
        removeAuthToken();
        // Redirect to login page
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/login';
        }
      }

      // Handle forbidden errors
      if (status === 403) {
        console.error('Access forbidden');
      }

      // Handle server errors
      if (status >= 500) {
        console.error('Server error:', data);
      }

      // Log error in development
      if (process.env.NODE_ENV === 'development') {
        console.error(`❌ API Error: ${error.config?.method?.toUpperCase()} ${error.config?.url}`, data);
      }
    } else if (error.request) {
      console.error('Network error:', error.message);
    } else {
      console.error('Request setup error:', error.message);
    }

    return Promise.reject(error);
  }
);

// Helper function to get subdomain from URL or localStorage
function getSubdomain(): string | null {
  if (typeof window === 'undefined') return null;
  
  // Try to get from URL subdomain
  const hostname = window.location.hostname;
  const parts = hostname.split('.');
  
  if (parts.length > 2 && parts[0] !== 'www') {
    return parts[0];
  }
  
  // Fallback to localStorage
  return localStorage.getItem('subdomain');
}

// Helper function to set subdomain
export const setSubdomain = (subdomain: string): void => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('subdomain', subdomain);
  }
};

// Helper function to remove subdomain
export const removeSubdomain = (): void => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('subdomain');
  }
};

export default api;