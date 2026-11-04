export type NavTabId =
  | 'dashboard'
  | 'appointments'
  | 'schedule'
  | 'clients'
  | 'pets'
  | 'courses'
  | 'walkin'
  | 'services'
  | 'hours'
  | 'profile'
  | 'loyalty'
  | 'booking';

export type UserRole = 'admin' | 'customer';

export type Permission =
  | 'view_salon_metrics'
  | 'view_all_appointments'
  | 'manage_all_appointments'
  | 'view_day_schedule_full'
  | 'view_clients_directory'
  | 'view_all_clients'
  | 'manage_clients'
  | 'manage_walk_in_queue'
  | 'manage_treatment_courses'
  | 'edit_business_hours'
  | 'view_salon_owner_profile'
  | 'view_own_appointments'
  | 'manage_own_appointments'
  | 'view_loyalty_rewards'
  | 'view_services_catalog'
  | 'view_own_profile'
  | 'manage_own_pets';

/**
 * Strict role-to-route permissions configuration.
 * Customers are granted access ONLY to customer-safe screens and endpoints.
 */
export const ROLE_CONFIG: Record<
  UserRole,
  {
    displayNameNl: string;
    displayNameEn: string;
    allowedTabs: readonly NavTabId[];
    defaultTab: NavTabId;
    permissions: readonly Permission[];
  }
> = {
  customer: {
    displayNameNl: 'Klant',
    displayNameEn: 'Customer',
    allowedTabs: ['dashboard', 'appointments', 'loyalty', 'services', 'profile', 'booking', 'pets'],
    defaultTab: 'dashboard',
    permissions: [
      'view_own_appointments',
      'manage_own_appointments',
      'view_loyalty_rewards',
      'view_services_catalog',
      'view_own_profile',
      'manage_own_pets',
    ],
  },
  admin: {
    displayNameNl: 'Salon Beheerder',
    displayNameEn: 'Salon Owner / Admin',
    allowedTabs: [
      'dashboard',
      'appointments',
      'schedule',
      'clients',
      'pets',
      'courses',
      'walkin',
      'services',
      'hours',
      'profile',
      'booking',
    ],
    defaultTab: 'dashboard',
    permissions: [
      'view_salon_metrics',
      'view_all_appointments',
      'manage_all_appointments',
      'view_day_schedule_full',
      'view_clients_directory',
      'view_all_clients',
      'manage_clients',
      'manage_walk_in_queue',
      'manage_treatment_courses',
      'edit_business_hours',
      'view_salon_owner_profile',
      'view_services_catalog',
    ],
  },
};

/**
 * Checks whether a given role is authorized to view a specific tab/route.
 */
export function isTabAuthorized(role: UserRole, tab: NavTabId): boolean {
  const cfg = ROLE_CONFIG[role];
  if (!cfg) return false;
  return cfg.allowedTabs.includes(tab);
}

/**
 * Returns a guaranteed safe fallback tab for the role if requested tab is forbidden.
 */
export function getAuthorizedFallbackTab(role: UserRole): NavTabId {
  return ROLE_CONFIG[role]?.defaultTab || 'dashboard';
}

/**
 * Checks whether a role has a granular system permission.
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_CONFIG[role]?.permissions.includes(permission) ?? false;
}

/**
 * Security audit metadata for unauthorized route attempts.
 */
export interface AccessDeniedDetails {
  attemptedTab: NavTabId;
  userRole: UserRole;
  timestamp: string;
  reasonNl: string;
  reasonEn: string;
}

export function buildAccessDeniedDetails(role: UserRole, tab: NavTabId): AccessDeniedDetails {
  return {
    attemptedTab: tab,
    userRole: role,
    timestamp: new Date().toISOString(),
    reasonNl:
      role === 'customer'
        ? `Toegang geweigerd: De pagina "${tab}" bevat vertrouwelijke salongegevens en is uitsluitend toegankelijk voor salonbeheerders en medewerkers.`
        : `Toegang geweigerd: De pagina "${tab}" is niet beschikbaar voor uw rol.`,
    reasonEn:
      role === 'customer'
        ? `Access Denied: The "${tab}" screen contains confidential salon operational records and is restricted to salon owners and staff.`
        : `Access Denied: The "${tab}" screen is not authorized for your role.`,
  };
}
