import React, { useEffect } from 'react';
import type { NavTabId } from '@/components/layout/Sidebar';
import { isTabAuthorized, getAuthorizedFallbackTab, type UserRole } from '@/core/auth/rbac';
import { AccessDeniedView } from '@/components/views/AccessDeniedView';

export interface RouteGuardProps {
  currentRole: UserRole;
  activeTab: NavTabId;
  onRedirectToFallback?: (fallbackTab: NavTabId) => void;
  isDark?: boolean;
  children: React.ReactNode;
}

/**
 * RouteGuard ensures unauthorized views are never rendered to unauthorized roles.
 * If a customer attempts to access an owner screen (e.g. via direct link, manipulation of activeTab,
 * or stale state), RouteGuard blocks execution and presents an Access Denied view with
 * immediate safe redirection.
 */
export function RouteGuard({
  currentRole,
  activeTab,
  onRedirectToFallback,
  isDark = false,
  children,
}: RouteGuardProps) {
  const isAuthorized = isTabAuthorized(currentRole, activeTab);

  useEffect(() => {
    if (!isAuthorized) {
      console.warn(
        `[SECURITY AUDIT] Unauthorized route attempt blocked: role="${currentRole}" attempted to access tab="${activeTab}".`
      );
    }
  }, [isAuthorized, currentRole, activeTab]);

  if (!isAuthorized) {
    const fallbackTab = getAuthorizedFallbackTab(currentRole);
    return (
      <AccessDeniedView
        attemptedTab={activeTab}
        userRole={currentRole}
        onRedirectToDashboard={() => {
          if (onRedirectToFallback) {
            onRedirectToFallback(fallbackTab);
          }
        }}
        isDark={isDark}
      />
    );
  }

  return <>{children}</>;
}

