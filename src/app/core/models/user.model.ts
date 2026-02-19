/**
 * User interface for authentication
 * Represents a registered user/team member
 */
export interface User {
  email: string;
  name: string;
  initials: string;
  pw?: string;
  tel?: string;
}

/**
 * Current user stored in localStorage (without password)
 */
export interface CurrentUser {
  email: string;
  name: string;
  initials: string;
  tel?: string;
}

/**
 * Login credentials
 */
export interface LoginCredentials {
  email: string;
  password: string;
}

/**
 * Registration data
 */
export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptPrivacy: boolean;
}

/**
 * Helper to generate initials from a name
 * e.g., "John Doe" => "JD"
 */
export function getInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/**
 * Guest user credentials for demo access
 */
export const GUEST_USER: CurrentUser = {
  email: 'guest',
  name: 'Guest User',
  initials: 'GU'
};
