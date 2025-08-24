import { DisplayUser, RawStoredUser } from '@/types/display';

export function extractDisplayUser(rawUser: any): DisplayUser | null {
  try {
    // Check if it's the nested structure
    if (rawUser?.data?.user && rawUser?.data?.organization) {
      const userData = rawUser.data.user;
      const orgData = rawUser.data.organization;
      
      return {
        id: userData.id,
        firstName: userData.firstName,
        lastName: userData.lastName,
        name: `${userData.firstName} ${userData.lastName}`,
        email: userData.email,
        role: userData.role || 'AGENT', // Default to AGENT as per your schema
        organization: {
          id: orgData.id,
          name: orgData.companyName,
          subdomain: orgData.subdomain,
        }
      };
    }
    
    // Check if it's already in the correct format (from your working login)
    if (rawUser?.id && rawUser?.name) {
      return {
        id: rawUser.id,
        firstName: rawUser.firstName || '',
        lastName: rawUser.lastName || '',
        name: rawUser.name,
        email: rawUser.email,
        role: rawUser.role || 'AGENT',
        organization: rawUser.organization ? {
          id: rawUser.organization.id,
          name: rawUser.organization.name,
          subdomain: rawUser.organization.subdomain,
        } : undefined
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting display user:', error);
    return null;
  }
}

export function getUserInitials(name: string): string {
  if (!name) return 'U';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

export function formatRole(role: string): string {
  if (!role) return 'Agent';
  
  switch (role) {
    case 'ADMIN':
      return 'Administrator';
    case 'AGENT':
      return 'Agent';
    case 'VIEWER':
      return 'Viewer';
    default:
      return 'Agent';
  }
}

export function getPlan(role: string): string {
  if (!role) return 'Standard';
  
  switch (role) {
    case 'ADMIN':
      return 'Pro';
    case 'AGENT':
      return 'Business';
    case 'VIEWER':
      return 'Basic';
    default:
      return 'Standard';
  }
}

export function getRoleColor(role: string): string {
  switch (role) {
    case 'ADMIN':
      return 'text-red-600 bg-red-50 border-red-200';
    case 'AGENT':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'VIEWER':
      return 'text-gray-600 bg-gray-50 border-gray-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getRoleIcon(role: string): string {
  switch (role) {
    case 'ADMIN':
      return '👑'; // Crown for admin
    case 'AGENT':
      return '🎧'; // Headset for agent
    case 'VIEWER':
      return '👁️'; // Eye for viewer
    default:
      return '👤'; // Default user icon
  }
}

export function getRolePermissions(role: string): string[] {
  switch (role) {
    case 'ADMIN':
      return [
        'Full system access',
        'User management',
        'Organization settings',
        'Billing & plans',
        'All ticket access',
        'Bot management',
        'Analytics & reports'
      ];
    case 'AGENT':
      return [
        'Ticket management',
        'Customer support',
        'Bot interactions',
        'Basic analytics',
        'Knowledge base access'
      ];
    case 'VIEWER':
      return [
        'View tickets',
        'View analytics',
        'Read-only access',
        'Basic reporting'
      ];
    default:
      return ['Limited access'];
  }
}