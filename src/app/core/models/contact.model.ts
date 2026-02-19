/**
 * Contact interface
 * Represents a contact that can be assigned to tasks
 */
export interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;
}

/**
 * Contact form data for creating/editing contacts
 */
export interface ContactFormData {
  name: string;
  email: string;
  phone: string;
}

/**
 * Available badge colors (15 predefined colors)
 * Color is assigned based on contact name hash
 */
export const BADGE_COLORS = [
  'bgcolor__1',
  'bgcolor__2',
  'bgcolor__3',
  'bgcolor__4',
  'bgcolor__5',
  'bgcolor__6',
  'bgcolor__7',
  'bgcolor__8',
  'bgcolor__9',
  'bgcolor__10',
  'bgcolor__11',
  'bgcolor__12',
  'bgcolor__13',
  'bgcolor__14',
  'bgcolor__15'
];

/**
 * Get badge color class based on contact name
 * Uses a simple hash to consistently assign colors
 */
export function getBadgeColor(name: string): string {
  if (!name) return BADGE_COLORS[0];
  const index = (name.charCodeAt(0) + name.charCodeAt(name.length - 1)) % 15;
  return BADGE_COLORS[index];
}

/**
 * Get initials from contact name
 */
export function getContactInitials(name: string): string {
  if (!name) return '';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}
