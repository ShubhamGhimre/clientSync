// Separate types just for displaying data - won't affect existing login logic

export type UserRole = 'ADMIN' | 'AGENT' | 'VIEWER';

export interface DisplayUser {
  id: string;
  firstName: string;
  lastName: string;
  name: string;
  email: string;
  role: UserRole;
  organization?: DisplayOrganization;
}

export interface DisplayOrganization {
  id: string;
  name: string;
  subdomain: string;
}

// Raw stored data structure (what's actually in your store)
export interface RawStoredUser {
  success: boolean;
  data: {
    user: {
      id: string;
      firstName: string;
      lastName: string;
      email: string;
      role?: UserRole;
    };
    organization: {
      id: string;
      companyName: string;
      subdomain: string;
      contactEmail: string;
    };
  };
}