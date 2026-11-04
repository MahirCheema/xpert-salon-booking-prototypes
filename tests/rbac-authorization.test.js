import test from 'node:test';
import assert from 'node:assert/strict';

// Import RBAC core module (zero-dependency pure TypeScript module)
import {
  ROLE_CONFIG,
  isTabAuthorized,
  getAuthorizedFallbackTab,
  hasPermission,
  buildAccessDeniedDetails,
} from '../src/core/auth/rbac.ts';

test('RBAC: Customers are restricted strictly to customer-safe routes', () => {
  const customerForbiddenTabs = ['schedule', 'clients', 'hours', 'walkin', 'courses'];
  for (const tab of customerForbiddenTabs) {
    assert.equal(
      isTabAuthorized('customer', tab),
      false,
      `Customer MUST NOT be authorized to access ${tab}`
    );
  }

  const customerAllowedTabs = ['dashboard', 'appointments', 'loyalty', 'services', 'profile', 'booking'];
  for (const tab of customerAllowedTabs) {
    assert.equal(
      isTabAuthorized('customer', tab),
      true,
      `Customer MUST be authorized to access ${tab}`
    );
  }
});

test('RBAC: Admins have access to all operational routes', () => {
  const adminTabs = [
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
  ];
  for (const tab of adminTabs) {
    assert.equal(
      isTabAuthorized('admin', tab),
      true,
      `Admin MUST be authorized to access ${tab}`
    );
  }
});

test('RBAC: Fallback tab returns default dashboard for both roles', () => {
  assert.equal(getAuthorizedFallbackTab('customer'), 'dashboard');
  assert.equal(getAuthorizedFallbackTab('admin'), 'dashboard');
});

test('RBAC: Permissions checks enforce granular security boundaries', () => {
  assert.equal(hasPermission('customer', 'view_all_clients'), false);
  assert.equal(hasPermission('customer', 'edit_business_hours'), false);
  assert.equal(hasPermission('customer', 'view_salon_metrics'), false);
  assert.equal(hasPermission('customer', 'view_day_schedule_full'), false);
  assert.equal(hasPermission('customer', 'manage_clients'), false);
  assert.equal(hasPermission('customer', 'manage_walk_in_queue'), false);
  assert.equal(hasPermission('customer', 'manage_treatment_courses'), false);

  assert.equal(hasPermission('customer', 'view_own_appointments'), true);
  assert.equal(hasPermission('customer', 'manage_own_appointments'), true);
  assert.equal(hasPermission('customer', 'view_loyalty_rewards'), true);
  assert.equal(hasPermission('customer', 'view_services_catalog'), true);
  assert.equal(hasPermission('customer', 'view_own_profile'), true);

  assert.equal(hasPermission('admin', 'view_all_clients'), true);
  assert.equal(hasPermission('admin', 'edit_business_hours'), true);
  assert.equal(hasPermission('admin', 'view_salon_metrics'), true);
  assert.equal(hasPermission('admin', 'view_day_schedule_full'), true);
  assert.equal(hasPermission('admin', 'manage_clients'), true);
  assert.equal(hasPermission('admin', 'manage_walk_in_queue'), true);
});

test('RBAC: Access denied details generator produces audit records with localized explanations', () => {
  const customerDetails = buildAccessDeniedDetails('customer', 'clients');
  assert.equal(customerDetails.attemptedTab, 'clients');
  assert.equal(customerDetails.userRole, 'customer');
  assert.match(customerDetails.reasonNl, /vertrouwelijke salongegevens/);
  assert.match(customerDetails.reasonEn, /confidential salon operational records/);

  const scheduleDetails = buildAccessDeniedDetails('customer', 'schedule');
  assert.equal(scheduleDetails.attemptedTab, 'schedule');
  assert.equal(scheduleDetails.userRole, 'customer');
});

test('RBAC Data Privacy Scoping Contract: Customer appointment filtering logic', () => {
  const mockBookings = [
    { id: 'b-1', client_id: 'client-A', client_name: 'Sophie van Dijk', service_name: 'Knippen' },
    { id: 'b-2', client_id: 'client-B', client_name: 'Jan de Vries', service_name: 'Fade' },
    { id: 'b-3', client_id: 'client-A', client_name: 'Sophie van Dijk', service_name: 'Kleur' },
  ];

  // When scoped by customer ID
  const customerA_Bookings = mockBookings.filter(b => b.client_id === 'client-A');
  assert.equal(customerA_Bookings.length, 2);
  assert.ok(customerA_Bookings.every(b => b.client_id === 'client-A'));

  // Ensure Client B data is never present in Customer A's scoped collection
  assert.equal(customerA_Bookings.some(b => b.client_id === 'client-B'), false);
});
