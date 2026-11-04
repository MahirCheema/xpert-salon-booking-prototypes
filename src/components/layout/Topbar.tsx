import { useState, useMemo } from 'react';
import {
  Menu,
  Moon,
  Sun,
  Bell,
  Sparkles,
  ShieldCheck,
  User,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import type { SalonDataStore, ClientRecord } from '@/core/data-store';
import type { NavTabId } from './Sidebar';

import { SalonSelectorDropdown } from './header/SalonSelectorDropdown';
import { ProblemSolvedModal } from './header/ProblemSolvedModal';
import { NotificationDrawer } from './header/NotificationDrawer';
import { SpecialistProfileModal } from './header/SpecialistProfileModal';
import { UserProfileDropdown } from './header/UserProfileDropdown';
import { LanguageToggle } from './header/LanguageToggle';

export interface TopbarProps {
  store: SalonDataStore;
  currentSlug: string;
  onSelectClient: (slug: string) => void;
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  onNewBookingClick?: () => void;
  onToggleMobileMenu: () => void;
  isStandalone?: boolean;
  isDark?: boolean;
  onToggleDark?: () => void;
  userRole?: 'admin' | 'customer';
  onToggleRole?: (role: 'admin' | 'customer') => void;
  selectedCustomer?: ClientRecord;
}

export function Topbar({
  store,
  currentSlug,
  onSelectClient,
  activeTab,
  onSelectTab,
  onNewBookingClick,
  onToggleMobileMenu,
  isStandalone = false,
  isDark = false,
  onToggleDark,
  userRole = 'admin',
  onToggleRole,
  selectedCustomer,
}: TopbarProps) {
  const { locale } = useI18n();
  const cfg = store.config;

  const [problemModalOpen, setProblemModalOpen] = useState(false);
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  // Specialist manager defaults for active salon
  const defaultManager = useMemo(() => {
    switch (currentSlug) {
      case 'de-kleinste-kapsalon':
        return { name: 'Osman', role: 'Eigenaar & Meesterkapper', email: 'osman@dekleinstekapsalon.nl', phone: '010-4123891', cert: 'Kapper diploma KOC / Meester', chair: 'Stoel 1 (Hoofdwerkplek)', kvk: '24398102' };
      case 'violettas-dog-grooming':
        return { name: 'Violetta', role: 'Gediplomeerd Hondentrimmer', email: 'violetta@trimsalonzuidhorn.nl', phone: '0594-502189', cert: 'ABHB Vakdiploma Hondentoiletteren', chair: 'Trimtafel 1 (Hydraulisch)', kvk: '01128491' };
      case 'kapsalon-issa':
        return { name: 'Issa', role: 'Zaakvoerder & Hoofdkapper', email: 'contact@kapsalon-issa.nl', phone: '010-4658231', cert: 'ANVR / KOC Erkend Kapper', chair: 'Stoel 1 (Inloop & Styling)', kvk: '51298412' };
      case 'salonyourbeauty':
        return { name: 'Tamara', role: 'Klinisch Huidspecialist & Eigenaar', email: 'info@salonyourbeauty.nl', phone: '020-6712398', cert: 'Cidesco / ANBOS Dermatologie', chair: 'Behandelkamer A (Klinisch)', kvk: '34198210' };
      case 'feel-smooth':
        return { name: 'Sarah', role: 'Lasertherapeut & Salonmanager', email: 'afspraak@feelsmooth.nl', phone: '030-2345678', cert: 'Gecertificeerd Diode Laser Specialist', chair: 'Lasercabine 1 (Diode 808nm)', kvk: '30248192' };
      case 'polat-beauty':
        return { name: 'Derya Polat', role: 'Schoonheidsspecialiste & Eigenaar', email: 'info@polatbeauty.nl', phone: '010-8451290', cert: 'ANBOS Allround Schoonheidsspecialist', chair: 'Kamer 1 (Gezichtsbehandeling)', kvk: '55198204' };
      case 'hondentrimsalon-finn':
        return { name: 'Marloes', role: 'Allround Trimsalonspecialist', email: 'marloes@hondentrimsalonfinn.nl', phone: '06-12345678', cert: 'Rijksgediplomeerd Trimmer & Puppy Coach', chair: 'Trimstation Finn (Groot & Klein)', kvk: '61298401' };
      case 'trimsalon-limbo':
        return { name: 'Anita', role: 'Solo Kattentrimmer & Groomer', email: 'anita@trimsalonlimbo.nl', phone: '043-3219876', cert: 'Kattengedragskunde & Vachtverzorging', chair: 'Enkele Salonagenda (Solo)', kvk: '14109284' };
      case 'trimsalon-het-hofje':
        return { name: 'Chantal', role: 'Hoofd Dierverzorging', email: 'chantal@trimsalonhethofje.nl', phone: '023-5312345', cert: 'VBN Erkend Trimbeheerder', chair: 'Trimruimte & Kattenzone', kvk: '34281920' };
      case 'kapsalon-faya':
        return { name: 'Faya', role: 'Krullen- & Stijlspecialist', email: 'info@kapsalonfaya.nl', phone: '020-7891234', cert: 'Curly Girl Method & Texture Expert', chair: 'Stoel 2 (Krullenstation)', kvk: '54289102' };
      case 'kapsalon-van-haaren':
        return { name: 'Dhr. Van Haaren', role: 'Directeur & Stylist', email: 'service@kapsalonvanhaaren.nl', phone: '073-6123456', cert: 'Kappersbond Nederland Meester', chair: 'Stoel 1 (Directie)', kvk: '17129840' };
      case 'kapsalon-headline':
        return { name: 'Mark', role: 'Senior Stylist & Salonbeheerder', email: 'mark@kapsalonheadline.nl', phone: '010-5012345', cert: 'L\'Oréal Professionnel Colour Expert', chair: 'Stoel 1 (Kleurspecialist)', kvk: '24189204' };
      default:
        return { name: cfg.staff?.[0]?.name || 'Beheerder', role: 'Salon Manager', email: `admin@${cfg.slug}.nl`, phone: '06-20000000', cert: 'Geregistreerd Vakspecialist', chair: 'Hoofdwerkplek', kvk: '12345678' };
    }
  }, [currentSlug, cfg.staff, cfg.slug]);

  // Dynamic user details depending on role
  const activeCust = selectedCustomer || store.state.clients[0] || {
    name: 'Sample Klant A',
    email: 'voorbeeld.a@example.com',
    loyalty_points: 380,
    loyalty_tier: 'silver',
  };

  const displayName = userRole === 'customer' ? activeCust.name : defaultManager.name;
  const displayRole = userRole === 'customer'
    ? `${(activeCust.loyalty_tier || 'Silver').toUpperCase()} VIP (${activeCust.loyalty_points || 380} pts)`
    : defaultManager.role.split('&')[0].trim();
  const displayEmail = userRole === 'customer' ? (activeCust.email || 'klant@salon.nl') : defaultManager.email;

  const pendingCount = userRole === 'customer'
    ? store.state.bookings.filter(
        (b) =>
          (b.client_id === activeCust.id ||
            b.client_name.toLowerCase().includes((activeCust.name || '').toLowerCase().split(' ')[0])) &&
          b.status === 'confirmed'
      ).length
    : store.state.bookings.filter((b) => b.status === 'confirmed').length;

  return (
    <header className={cn(
      "sticky top-0 z-30 flex h-16 shrink-0 items-center border-b backdrop-blur-md px-4 sm:px-6 transition-colors duration-200",
      isDark
        ? "border-[#22222d] bg-[#121217]/95 text-white"
        : "border-secondary-200 bg-white/95 text-secondary-900"
    )}>
      <div className="flex w-full items-center justify-between gap-4">
        {/* Left: Mobile menu toggle & Salon Switcher */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden -ml-1.5 p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 focus:outline-none cursor-pointer"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <SalonSelectorDropdown
            currentSlug={currentSlug}
            onSelectClient={onSelectClient}
            isDark={isDark}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
          {/* Problem Solved info chip */}
          <button
            type="button"
            onClick={() => setProblemModalOpen(true)}
            className="hidden md:inline-flex items-center gap-1.5 rounded-lg border border-amber-300 bg-amber-50/80 px-2.5 py-1 text-xs font-semibold text-amber-900 hover:bg-amber-100 transition-colors shadow-2xs cursor-pointer"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span className="truncate max-w-45">{locale === 'nl' ? 'Probleemanalyse' : 'Problem Solved'}</span>
          </button>

          {/* Theme Toggle: Dark / Light */}
          {onToggleDark && (
            <button
              type="button"
              onClick={onToggleDark}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-bold shadow-2xs transition-colors cursor-pointer",
                isDark
                  ? "border-[#323244] bg-[#1a1a24] text-amber-300 hover:bg-[#232330]"
                  : "border-secondary-300 bg-white text-secondary-800 hover:bg-secondary-50"
              )}
              title={isDark ? (locale === 'nl' ? 'Wissel naar Light Mode' : 'Switch to Light Mode') : (locale === 'nl' ? 'Wissel naar Dark Mode' : 'Switch to Dark Mode')}
            >
              {isDark ? (
                <>
                  <Sun className="h-3.5 w-3.5 text-amber-400" />
                  <span>Light</span>
                </>
              ) : (
                <>
                  <Moon className="h-3.5 w-3.5 text-purple-600" />
                  <span>Dark</span>
                </>
              )}
            </button>
          )}

          {/* Notification Button */}
          <button
            type="button"
            onClick={() => setNotifModalOpen(true)}
            className="relative p-2 rounded-lg text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900 transition-colors cursor-pointer"
            title={locale === 'nl' ? 'Meldingen' : 'Notifications'}
          >
            <Bell className="h-4 w-4" />
            {pendingCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-600"></span>
              </span>
            )}
          </button>

          {/* Role Switcher Capsule: [ 🛡️ Admin | 👤 Klant ] */}
          {onToggleRole && (
            <div
              className={cn(
                "inline-flex items-center p-0.5 rounded-lg border shadow-2xs select-none transition-colors h-[30px]",
                isDark ? "border-[#323244] bg-[#1a1a24]" : "border-secondary-300 bg-secondary-100/70"
              )}
              role="group"
              aria-label="Role selector"
            >
              <button
                type="button"
                onClick={() => onToggleRole('admin')}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer h-6",
                  userRole === 'admin'
                    ? isDark
                      ? "bg-[#2b2b3a] text-white shadow-2xs border border-white/10"
                      : "bg-white text-secondary-900 shadow-2xs border border-secondary-200/90"
                    : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-secondary-600 hover:text-secondary-900"
                )}
                title={locale === 'nl' ? 'Salon Beheer & Specialist Cockpit' : 'Admin & Specialist Cockpit'}
              >
                <ShieldCheck className="h-3 w-3 text-primary-600" />
                <span>Admin</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleRole('customer')}
                className={cn(
                  "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer h-6",
                  userRole === 'customer'
                    ? isDark
                      ? "bg-[#2b2b3a] text-white shadow-2xs border border-white/10"
                      : "bg-white text-secondary-900 shadow-2xs border border-secondary-200/90"
                    : isDark
                    ? "text-slate-400 hover:text-white"
                    : "text-secondary-600 hover:text-secondary-900"
                )}
                title={locale === 'nl' ? 'Klantenportaal & Zelfservice' : 'Customer Self-Service Portal'}
              >
                <User className="h-3 w-3 text-purple-600" />
                <span>{locale === 'nl' ? 'Klant' : 'Customer'}</span>
              </button>
            </div>
          )}

          {/* Harmonized Language Toggle: EN / NL */}
          <LanguageToggle isDark={isDark} />

          {/* User Profile Dropdown Menu */}
          <UserProfileDropdown
            isOpen={profileDropdownOpen}
            onOpenChange={setProfileDropdownOpen}
            displayName={displayName}
            displayRole={displayRole}
            displayEmail={displayEmail}
            clientName={cfg.client}
            userRole={userRole}
            onToggleRole={onToggleRole}
            onSelectTab={onSelectTab}
            isDark={isDark}
          />
        </div>
      </div>

      {/* Problem Solved Modal */}
      <ProblemSolvedModal
        open={problemModalOpen}
        onOpenChange={setProblemModalOpen}
        config={cfg}
      />

      {/* Notifications Drawer Modal */}
      <NotificationDrawer
        open={notifModalOpen}
        onOpenChange={setNotifModalOpen}
        bookings={store.state.bookings}
        userRole={userRole}
        customerClientId={activeCust.id}
        customerName={activeCust.name}
      />

      {/* Complete Specialist Profile Modal */}
      <SpecialistProfileModal
        open={profileModalOpen}
        onOpenChange={setProfileModalOpen}
        currentSlug={currentSlug}
        config={cfg}
        defaultManager={defaultManager}
      />
    </header>
  );
}
