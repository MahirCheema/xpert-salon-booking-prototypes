import { useState, useEffect, useMemo, useCallback } from 'react';
import { I18nProvider } from '@/i18n/I18nContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ConfirmDialogProvider } from '@/components/ui/Dialog';
import { ResponsiveAppShell } from '@/components/layout/ResponsiveAppShell';
import type { NavTabId } from '@/components/layout/Sidebar';
import { DashboardOverviewView } from '@/components/views/DashboardOverviewView';
import { AppointmentsView } from '@/components/views/AppointmentsView';
import { ScheduleTimelineView } from '@/components/views/ScheduleTimelineView';
import { ClientsView } from '@/components/views/ClientsView';
import { PetsView } from '@/components/views/PetsView';
import { CoursesView } from '@/components/views/CoursesView';
import { WalkInView } from '@/components/views/WalkInView';
import { ServicesCatalogView } from '@/components/views/ServicesCatalogView';
import { HoursSettingsView } from '@/components/views/HoursSettingsView';
import { ProfileView } from '@/components/views/ProfileView';
import { CustomerPortalView } from '@/components/views/CustomerPortalView';
import { CustomerDashboardView } from '@/components/views/CustomerDashboardView';
import { SkeletonDashboard } from '@/components/dashboard/SkeletonDashboard';
import { SkeletonAppointments } from '@/components/appointments/SkeletonAppointments';
import { RouteGuard } from '@/components/auth/RouteGuard';
import { useUIStore } from '@/store';
import { createSalonStore, type SalonDataStore } from '@/core/data-store';
import { CLIENT_CONFIGS, CLIENT_SLUGS } from '@/client-configs.js';

interface AppProps {
  initialSlug?: string;
  isStandalone?: boolean;
}

export function AppContent({ initialSlug = 'kapsalon-issa', isStandalone = false }: AppProps) {
  // Determine initial slug from URL query param if present
  const configs = CLIENT_CONFIGS as Record<string, any>;

  const getInitialSlug = () => {
    if (isStandalone && initialSlug) return initialSlug;
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const paramSlug = urlParams.get('client');
      if (paramSlug && configs[paramSlug]) {
        return paramSlug;
      }
    }
    return initialSlug;
  };

  const [currentSlug, setCurrentSlug] = useState<string>(getInitialSlug);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [appointmentsNavKey, setAppointmentsNavKey] = useState<number>(0);

  // Global Client UI State from Zustand Store
  const activeTab = useUIStore((s) => s.activeTab);
  const setActiveTab = useUIStore((s) => s.setActiveTab);
  const userRole = useUIStore((s) => s.userRole);
  const setUserRole = useUIStore((s) => s.setUserRole);
  const isDark = useUIStore((s) => s.isDark);
  const toggleDark = useUIStore((s) => s.toggleDark);
  const isTransitioning = useUIStore((s) => s.isTransitioning);
  const setTransitioning = useUIStore((s) => s.setTransitioning);
  const openNewBookingModal = useUIStore((s) => s.isBookingModalOpen);
  const setOpenNewBookingModal = useUIStore((s) => s.setBookingModalOpen);
  const selectedCustomerId = useUIStore((s) => s.selectedCustomerId);
  const setSelectedCustomerId = useUIStore((s) => s.setSelectedCustomerId);

  const handleSelectTab = useCallback((tab: NavTabId) => {
    setActiveTab(tab);
    setOpenNewBookingModal(false);
    if (tab === 'appointments') {
      setAppointmentsNavKey((k) => k + 1);
    }
  }, [setActiveTab, setOpenNewBookingModal]);

  const handleOpenNewBooking = useCallback(() => {
    setActiveTab('appointments');
    setOpenNewBookingModal(true);
  }, [setActiveTab, setOpenNewBookingModal]);

  // Store instance for active client
  const store: SalonDataStore = useMemo(() => {
    return createSalonStore(currentSlug);
  }, [currentSlug]);

  // Subscribe to store updates to trigger re-renders
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setRefreshKey((k) => k + 1);
    });
    return unsubscribe;
  }, [store]);

  // Apply salon branding colors in Light Mode, and GLOWBOARD dark palette in Dark Mode
  useEffect(() => {
    const config = configs[currentSlug];
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        root.style.setProperty('--primary', '#7c3aed');
        root.style.setProperty('--accent', '#a855f7');
        root.style.setProperty('--surface', '#181820');
        root.style.setProperty('--background', '#0e0e13');
        root.style.setProperty('--text', '#f8fafc');
        root.style.setProperty('--border', '#272733');
        document.body.style.backgroundColor = '#0e0e13';
      } else {
        root.classList.remove('dark');
        const theme = config?.theme;
        const brandPrimary = theme?.primary || '#2563eb';
        const brandAccent = theme?.accent || '#f59e0b';
        const brandBg = theme?.background || '#f8fafc';
        const brandText = theme?.text || '#0f172a';
        root.style.setProperty('--primary', brandPrimary);
        root.style.setProperty('--accent', brandAccent);
        root.style.setProperty('--surface', '#ffffff');
        root.style.setProperty('--background', brandBg);
        root.style.setProperty('--text', brandText);
        root.style.setProperty('--border', '#e2e8f0');
        document.body.style.backgroundColor = brandBg;
      }
    }
  }, [currentSlug, isDark]);

  const handleSelectClient = useCallback((slug: string) => {
    if (!configs[slug]) return;
    setTransitioning(true);
    setCurrentSlug(slug);
    const timer = setTimeout(() => {
      setTransitioning(false);
    }, 150);
    if (typeof window !== 'undefined' && !isStandalone) {
      const url = new URL(window.location.href);
      url.searchParams.set('client', slug);
      window.history.replaceState({}, '', url.toString());
    }
    return () => clearTimeout(timer);
  }, [isStandalone, configs, setTransitioning]);

  const selectedCustomer = useMemo(() => {
    return (
      store.state.clients.find((c) => c.id === selectedCustomerId) ||
      store.state.clients[0] || {
        id: 'client-sample-1',
        name: 'Sophie van Dijk',
        phone: '06-12345678',
        email: 'sophie.vandijk@example.nl',
        loyalty_points: 380,
        loyalty_tier: 'silver',
        total_spent_eur: 245.0,
        redeemed_rewards: ['Luxe verzorgende shampoo'],
      }
    );
  }, [store.state.clients, selectedCustomerId]);

  return (
    <ResponsiveAppShell
      store={store}
      currentSlug={currentSlug}
      onSelectClient={handleSelectClient}
      activeTab={activeTab}
      onSelectTab={handleSelectTab}
      onNewBookingClick={handleOpenNewBooking}
      isStandalone={isStandalone}
      isDark={isDark}
      onToggleDark={toggleDark}
      userRole={userRole}
      onToggleRole={setUserRole}
      selectedCustomer={selectedCustomer}
    >
      {/* Dynamic View rendering based on active sidebar tab & userRole */}
      {isTransitioning ? (
        activeTab === 'appointments' || activeTab === 'booking' ? (
          <SkeletonAppointments isDark={isDark} />
        ) : (
          <SkeletonDashboard isDark={isDark} />
        )
      ) : (
        <RouteGuard
          currentRole={userRole}
          activeTab={activeTab}
          onRedirectToFallback={handleSelectTab}
          isDark={isDark}
        >
          {activeTab === 'dashboard' && (
            userRole === 'customer' ? (
              <CustomerDashboardView
                key={`${currentSlug}-${refreshKey}-cust-dash`}
                store={store}
                onSelectTab={handleSelectTab}
                onNewBookingClick={handleOpenNewBooking}
                isDark={isDark}
                selectedCustomerId={selectedCustomerId}
                onSelectCustomer={setSelectedCustomerId}
              />
            ) : (
              <DashboardOverviewView
                key={`${currentSlug}-${refreshKey}`}
                store={store}
                onSelectTab={handleSelectTab}
                onNewBookingClick={handleOpenNewBooking}
                isDark={isDark}
                onToggleDark={toggleDark}
              />
            )
          )}

          {activeTab === 'appointments' && (
            <AppointmentsView
              key={`${currentSlug}-${refreshKey}-${appointmentsNavKey}-${userRole}`}
              store={store}
              openNewBookingInitially={openNewBookingModal}
              onCloseNewBookingModal={() => setOpenNewBookingModal(false)}
              isDark={isDark}
              onNewBookingClick={() => setOpenNewBookingModal(true)}
              customerMode={userRole === 'customer'}
              customerClientId={selectedCustomer.id}
              customerName={selectedCustomer.name}
            />
          )}

          {activeTab === 'loyalty' && (
            <CustomerPortalView
              key={`${currentSlug}-${refreshKey}-loyalty`}
              store={store}
              currentSlug={currentSlug}
              onSwitchRole={setUserRole}
              isDark={isDark}
            />
          )}

          {activeTab === 'schedule' && (
            <ScheduleTimelineView
              key={`${currentSlug}-${refreshKey}`}
              store={store}
              isDark={isDark}
              onNewBookingClick={handleOpenNewBooking}
              onSelectTab={handleSelectTab}
            />
          )}

          {activeTab === 'clients' && (
            <ClientsView
              key={`${currentSlug}-${refreshKey}`}
              store={store}
              onBookForClient={handleOpenNewBooking}
            />
          )}

          {activeTab === 'pets' && (
            <PetsView
              key={`${currentSlug}-${refreshKey}-${userRole}`}
              store={store}
              onBookForPet={handleOpenNewBooking}
              customerMode={userRole === 'customer'}
              customerClientId={selectedCustomer.id}
              customerName={selectedCustomer.name}
            />
          )}

          {activeTab === 'courses' && (
            <CoursesView
              key={`${currentSlug}-${refreshKey}`}
              store={store}
            />
          )}

          {activeTab === 'walkin' && (
            <WalkInView
              key={`${currentSlug}-${refreshKey}`}
              store={store}
            />
          )}

          {activeTab === 'booking' && (
            <AppointmentsView
              key={`${currentSlug}-${refreshKey}-booking`}
              store={store}
              openNewBookingInitially={true}
              isDark={isDark}
              customerMode={userRole === 'customer'}
              customerClientId={selectedCustomer.id}
              customerName={selectedCustomer.name}
            />
          )}

          {activeTab === 'services' && (
            <ServicesCatalogView
              key={`${currentSlug}-${refreshKey}`}
              store={store}
              onBookService={handleOpenNewBooking}
            />
          )}

          {activeTab === 'hours' && (
            <HoursSettingsView
              key={`${currentSlug}-${refreshKey}`}
              store={store}
            />
          )}

          {activeTab === 'profile' && (
            <ProfileView
              key={`${currentSlug}-${refreshKey}-profile-${userRole}`}
              store={store}
              currentSlug={currentSlug}
              isDark={isDark}
              onSelectTab={handleSelectTab}
              userRole={userRole}
              selectedCustomer={selectedCustomer}
            />
          )}
        </RouteGuard>
      )}
    </ResponsiveAppShell>
  );
}

export function App(props: AppProps) {
  return (
    <I18nProvider>
      <ToastProvider>
        <ConfirmDialogProvider>
          <AppContent {...props} />
        </ConfirmDialogProvider>
      </ToastProvider>
    </I18nProvider>
  );
}

export default App;
