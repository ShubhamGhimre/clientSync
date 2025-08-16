import Cookies from 'js-cookie';

const TOKEN_KEY = 'clientsync_token';
const USER_KEY = 'clientsync_user';
const ORG_KEY = 'clientsync_org';

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Organization {
  id: string;
  companyName: string;
  subdomain: string;
  contactEmail: string;
}

export interface AuthData {
  token: string;
  user: User;
  organization: Organization;
}

// Token management
export const getAuthToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return Cookies.get(TOKEN_KEY) || localStorage.getItem(TOKEN_KEY);
};

export const setAuthToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  Cookies.set(TOKEN_KEY, token, { expires: 7, secure: true, sameSite: 'strict' });
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeAuthToken = (): void => {
  if (typeof window === 'undefined') return;
  Cookies.remove(TOKEN_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(ORG_KEY);
};

// User management
export const getUser = (): User | null => {
  if (typeof window === 'undefined') return null;
  const userData = localStorage.getItem(USER_KEY);
  return userData ? JSON.parse(userData) : null;
};

export const setUser = (user: User): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

// Organization management
export const getOrganization = (): Organization | null => {
  if (typeof window === 'undefined') return null;
  const orgData = localStorage.getItem(ORG_KEY);
  return orgData ? JSON.parse(orgData) : null;
};

export const setOrganization = (organization: Organization): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ORG_KEY, JSON.stringify(organization));
};

// Set all auth data
export const setAuthData = (authData: AuthData): void => {
  setAuthToken(authData.token);
  setUser(authData.user);
  setOrganization(authData.organization);
};

// Check if user is authenticated
export const isAuthenticated = (): boolean => {
  return !!getAuthToken();
};

// Clear all auth data
export const clearAuthData = (): void => {
  removeAuthToken();
};