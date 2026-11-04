We have identified a critical role-based access control (RBAC) issue in the frontend application.

Problem:
Customers are currently able to see and access Salon Owner dashboard data, screens, widgets, metrics, navigation items, and functionality that should be restricted.

Your task is to perform a complete audit of the frontend authorization and role-based rendering logic.

Objectives:

1. Root Cause Analysis

- Identify why Customer users can access Salon Owner dashboard content.
- Review authentication flow, authorization flow, route guards, middleware, layouts, and role detection logic.
- Check role persistence, Zustand stores, Context Providers, local storage, AsyncStorage, cookies, session management, and API response handling.

2. Route Protection

- Audit all protected routes.
- Ensure Customers can only access Customer-specific routes.
- Ensure Salon Owners can only access Salon Owner routes.
- Prevent URL-based unauthorized access.
- Prevent direct navigation to restricted routes.

3. Layout Protection

- Verify role-specific layouts.
- Ensure Customer users never render Salon Owner layouts, sidebars, navigation menus, components, widgets, statistics, charts, or management screens.

4. Component-Level Authorization

- Audit all conditional rendering.
- Ensure role checks exist before rendering:
  - Dashboard cards
  - Navigation items
  - Sidebar menus
  - Settings pages
  - Reports
  - Analytics
  - Booking management
  - Customer management
  - Staff management

5. State Management Review

- Review Zustand stores and authentication state.
- Validate that roles are loaded correctly.
- Ensure stale authentication data cannot expose another role's UI.
- Verify user role synchronization after login, logout, refresh, and role changes.

6. API Security Validation

- Review frontend API integrations.
- Ensure role-specific queries only request permitted data.
- Avoid loading Salon Owner data for Customer users.
- Ensure dashboard queries are scoped by user role.

7. Dashboard Segregation
   Define clear boundaries:

Customer Dashboard:

- Personal appointments
- Personal bookings
- Personal profile
- Reviews
- Personal notifications

Salon Owner Dashboard:

- Revenue analytics
- Staff management
- Appointment management
- Business settings
- Customer management
- Reports
- Employee management
- Business metrics

8. User Experience

- If a user attempts to access an unauthorized route:
  - Redirect to their authorized dashboard.
  - Display a proper access denied screen if necessary.
- Never render unauthorized content before redirection.

9. Security Verification

- Review the entire frontend for RBAC vulnerabilities.
- Identify all privilege escalation issues.
- Ensure there is no possibility of exposing another role's data through:
  - Route manipulation
  - State manipulation
  - Cached data
  - Layout switching

10. Deliverables
    Provide:

- Root cause analysis
- Files affected
- Security issues identified
- RBAC improvements implemented
- Routes protected
- Components protected
- Remaining risks
- Recommendations

Important:
Treat this as a production-critical security issue.
Do not apply quick fixes. Implement a scalable and maintainable role-based access control architecture following production-grade frontend standards.
