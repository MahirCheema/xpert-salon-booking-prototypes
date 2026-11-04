import { useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils/cn';
import { X } from 'lucide-react';
import { Sidebar, type NavTabId } from './Sidebar';
import { Topbar } from './Topbar';
import type { SalonDataStore, ClientRecord } from '@/core/data-store';

export interface ResponsiveAppShellProps {
  store: SalonDataStore;
  currentSlug: string;
  onSelectClient: (slug: string) => void;
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  onNewBookingClick?: () => void;
  children: ReactNode;
  isStandalone?: boolean;
  isDark?: boolean;
  onToggleDark?: () => void;
  userRole?: 'admin' | 'customer';
  onToggleRole?: (role: 'admin' | 'customer') => void;
  selectedCustomer?: ClientRecord;
}

export function ResponsiveAppShell({
  store,
  currentSlug,
  onSelectClient,
  activeTab,
  onSelectTab,
  onNewBookingClick,
  children,
  isStandalone = false,
  isDark = false,
  onToggleDark,
  userRole = 'admin',
  onToggleRole,
  selectedCustomer,
}: ResponsiveAppShellProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className={cn(
      "min-h-screen flex flex-col transition-colors duration-200 selection:bg-purple-500 selection:text-white",
      isDark ? "dark bg-[#0e0e13] text-slate-100" : "bg-(--background,#f8fafc)] text-secondary-900"
    )}>
      {/* Desktop & Tablet Fixed Sidebar - Always visible for width >= 768px */}
      <div className="hidden md:fixed md:inset-y-0 md:left-0 md:z-40 md:flex md:w-64 md:flex-col md:h-screen">
        <Sidebar
          store={store}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          isDark={isDark}
          userRole={userRole}
          selectedCustomer={selectedCustomer}
        />
      </div>

      {/* Mobile Drawer (< 768px) */}
      {mobileOpen && (
        <div className="relative z-50 md:hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-secondary-900/60 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileOpen(false)}
          />

          <div className="fixed inset-0 flex">
            <div className="relative mr-16 flex w-full max-w-xs flex-1">
              {/* Close button */}
              <div className="absolute top-0 right-0 -mr-12 pt-2">
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="ml-1 flex h-10 w-10 items-center justify-center rounded-full text-white focus:outline-none focus:ring-2 focus:ring-white"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              {/* Sidebar Content */}
              <Sidebar
                store={store}
                activeTab={activeTab}
                onSelectTab={onSelectTab}
                onCloseMobile={() => setMobileOpen(false)}
                className="w-full"
                isDark={isDark}
                userRole={userRole}
                selectedCustomer={selectedCustomer}
              />
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        <Topbar
          store={store}
          currentSlug={currentSlug}
          onSelectClient={onSelectClient}
          activeTab={activeTab}
          onSelectTab={onSelectTab}
          onNewBookingClick={onNewBookingClick}
          onToggleMobileMenu={() => setMobileOpen(true)}
          isStandalone={isStandalone}
          isDark={isDark}
          onToggleDark={onToggleDark}
          userRole={userRole}
          onToggleRole={onToggleRole}
        />

        <main className="flex-1 pb-24">
          {children}
        </main>
      </div>
    </div>
  );
}

