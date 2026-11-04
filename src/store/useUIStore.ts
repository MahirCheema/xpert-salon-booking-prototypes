import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import type { NavTabId } from '@/components/layout/Sidebar';
import { isTabAuthorized, getAuthorizedFallbackTab, type UserRole } from '@/core/auth/rbac';

export interface UIState {
  activeTab: NavTabId;
  userRole: UserRole;
  isDark: boolean;
  isMobileMenuOpen: boolean;
  isBookingModalOpen: boolean;
  isTransitioning: boolean;
  selectedCustomerId: string;
}

export interface UIActions {
  setActiveTab: (tab: NavTabId) => void;
  setUserRole: (role: UserRole) => void;
  toggleRole: () => void;
  setIsDark: (dark: boolean) => void;
  toggleDark: () => void;
  setMobileMenuOpen: (open: boolean) => void;
  setBookingModalOpen: (open: boolean) => void;
  setTransitioning: (transitioning: boolean) => void;
  setSelectedCustomerId: (id: string) => void;
}

export type UIStore = UIState & UIActions;

export const useUIStore = create<UIStore>()(
  subscribeWithSelector((set, get) => {
    const initialRole: UserRole = (() => {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('xpert_user_role');
        if (stored === 'customer' || stored === 'admin') return stored;
      }
      return 'admin';
    })();

    const initialTab: NavTabId = 'dashboard';
    const safeInitialTab = isTabAuthorized(initialRole, initialTab)
      ? initialTab
      : getAuthorizedFallbackTab(initialRole);

    return {
      activeTab: safeInitialTab,
      userRole: initialRole,
      isDark: (() => {
        if (typeof window !== 'undefined') {
          const stored = localStorage.getItem('xpert_theme_mode');
          if (stored === 'dark') return true;
          if (stored === 'light') return false;
        }
        return false;
      })(),
      isMobileMenuOpen: false,
      isBookingModalOpen: false,
      isTransitioning: false,
      selectedCustomerId: 'client-sample-1',

      setActiveTab: (tab) => {
        const currentRole = get().userRole;
        if (!isTabAuthorized(currentRole, tab)) {
          console.warn(`[RBAC] Access denied: Role "${currentRole}" cannot access tab "${tab}". Redirecting.`);
          set({ activeTab: getAuthorizedFallbackTab(currentRole) });
          return;
        }
        set({ activeTab: tab });
      },

      setUserRole: (role) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('xpert_user_role', role);
        }
        const currentTab = get().activeTab;
        const safeTab = isTabAuthorized(role, currentTab)
          ? currentTab
          : getAuthorizedFallbackTab(role);
        set({ userRole: role, activeTab: safeTab });
      },

      toggleRole: () => {
        const nextRole: UserRole = get().userRole === 'admin' ? 'customer' : 'admin';
        get().setUserRole(nextRole);
      },

      setIsDark: (dark) => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('xpert_theme_mode', dark ? 'dark' : 'light');
        }
        set({ isDark: dark });
      },

      toggleDark: () => {
        get().setIsDark(!get().isDark);
      },

      setMobileMenuOpen: (open) => set({ isMobileMenuOpen: open }),
      setBookingModalOpen: (open) => set({ isBookingModalOpen: open }),
      setTransitioning: (transitioning) => set({ isTransitioning: transitioning }),
      setSelectedCustomerId: (id) => set({ selectedCustomerId: id }),
    };
  })
);


