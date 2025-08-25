import axios, { AxiosError, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import { setCookie } from 'cookies-next/client';



declare module 'axios' {
  export interface InternalAxiosRequestConfig {
    metadata?: {
      startTime: number;
    };
  }
}

interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}

// Enhanced token management
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  try {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  } catch {
    return null;
  }
};

export const setAuthToken = (token: string, remember: boolean = false): void => {
  if (typeof window === 'undefined') return;

  const storage = remember ? localStorage : sessionStorage;
  
  try {
   
    
    storage.setItem('token', token);
    
    // Clear from the other storage
    const otherStorage = remember ? sessionStorage : localStorage;
    otherStorage.removeItem('token');

    // store the token in the cookie as well
    setCookie('token', token, { maxAge: remember ? 30 * 24 * 60 * 60 : undefined });

  } catch (error) {
    console.error('❌ Failed to store auth token:', error);
  }
};

export const clearAuthToken = (): void => {
  if (typeof window === 'undefined') return;

  try {
    
    localStorage.removeItem('token');
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('dev_subdomain');
  } catch (error) {
    console.error('❌ Failed to clear auth token:', error);
  }
};

// Subdomain detection
export const getSubdomain = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  const hostname = window.location.hostname;
  
  // Method 1: Real subdomain (acme.localhost:3000)
  if (hostname.includes('.localhost') || hostname.includes('.127.0.0.1')) {
    const parts = hostname.split('.');
    const subdomain = parts[0];
    sessionStorage.setItem('dev_subdomain', subdomain);
    return subdomain;
  }
  
  // Method 2: Check session storage
  const storedSubdomain = sessionStorage.getItem('dev_subdomain');
  if (storedSubdomain) {
    return storedSubdomain;
  }
  
  // Method 3: Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const subdomainParam = urlParams.get('subdomain');
  if (subdomainParam) {
    sessionStorage.setItem('dev_subdomain', subdomainParam);
    return subdomainParam;
  }
  
  // Method 4: Production subdomain
  if (!hostname.includes('localhost') && !hostname.includes('127.0.0.1')) {
    const parts = hostname.split('.');
    if (parts.length >= 3 && parts[0] !== 'www') {
      return parts[0];
    }
  }
  
  return null;
};

// Build API URL with subdomain
const getBaseURL = (): string => {
  const subdomain = getSubdomain();
  const basePort = process.env.NEXT_PUBLIC_API_PORT || '5000';
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  
  if (typeof window === 'undefined') {
    return apiUrl || `http://localhost:${basePort}`;
  }
  
  const hostname = window.location.hostname;
  
  // For local development
  if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('.localhost')) {
    if (subdomain) {
      return `http://${subdomain}.localhost:${basePort}`;
    }
    return `http://localhost:${basePort}`;
  }
  
  // For production
  if (subdomain) {
    return `https://${subdomain}.${process.env.NEXT_PUBLIC_API_DOMAIN || 'api.clientsync.com'}`;
  }
  
  return apiUrl || `https://api.clientsync.com`;
};

export const setSubdomain = (subdomain: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('dev_subdomain', subdomain);
  }
};

// Create axios instance
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get dynamic base URL for each request
    const dynamicBaseURL = getBaseURL();
    config.baseURL = dynamicBaseURL;
    
    // Add auth token
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.log('❌ No token available for request');
    }
    
    // Add subdomain as header
    const subdomain = getSubdomain();
    if (subdomain) {
      config.headers['X-Tenant'] = subdomain;
    }
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      config.metadata = { startTime: Date.now() };
     
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    if (process.env.NODE_ENV === 'development' && response.config.metadata) {
      const duration = Date.now() - response.config.metadata.startTime;
     
    }
    
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      clearAuthToken();
      
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;

        if (!currentPath.includes('/auth/login') && !currentPath.includes('/auth/register')) {
          window.location.href = '/auth/login';
        }
      }
      
      return Promise.reject(error);
    }
    
    if (error.response) {
      const apiError: ApiError = {
        message: (error.response.data as any)?.message || 'An error occurred',
        errors: (error.response.data as any)?.errors,
        status: error.response.status,
      };
      
      return Promise.reject(apiError);
    }
    
    return Promise.reject(error);
  }
);

export default api;