export const setTestSubdomain = (subdomain: string): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('dev_subdomain', subdomain);
  }
};

export const clearTestSubdomain = (): void => {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('dev_subdomain');
  }
};

export const getCurrentSubdomain = (): string | null => {
  if (typeof window !== 'undefined') {
    return sessionStorage.getItem('dev_subdomain');
  }
  return null;
};