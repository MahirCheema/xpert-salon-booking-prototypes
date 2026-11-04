import type { ReactNode, ComponentType } from 'react';
import {
  LayoutDashboard,
  CalendarCheck,
  CalendarDays,
  Users,
  Sparkles,
  Clock3,
  Scissors,
  Store,
  ShieldCheck,
  Heart,
  User,
  Gift,
  Award,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import type { SalonDataStore, ClientRecord } from '@/core/data-store';

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

export interface SidebarProps {
  store: SalonDataStore;
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
  className?: string;
  onCloseMobile?: () => void;
  isDark?: boolean;
  userRole?: 'admin' | 'customer';
  selectedCustomer?: ClientRecord;
}

export function Sidebar({
  store,
  activeTab,
  onSelectTab,
  className,
  onCloseMobile,
  isDark = false,
  userRole = 'admin',
  selectedCustomer,
}: SidebarProps) {
  const { t, locale } = useI18n();
  const cfg = store.config;

  const isGrooming = Boolean(cfg.type && (cfg.type.toLowerCase().includes('animal') || cfg.type.toLowerCase().includes('grooming')));
  const isBeauty = Boolean(cfg.type && cfg.type.toLowerCase().includes('beauty'));
  const hasWalkIn = Boolean(cfg.features?.includes('walk_in_queue_view'));
  const hasCourses = Boolean(cfg.features?.includes('treatment_course_tracking'));

  const pendingBookingsCount = store.state.bookings.filter((b) => b.status === 'confirmed').length;
  const walkInCount = store.state.walkInQueue?.filter((w) => w.status === 'waiting').length || 0;
  const coursesCount = store.state.treatmentCourses?.length || 0;
  const petsCount = store.state.pets?.length || 0;
  const clientsCount = store.state.clients?.length || 0;

  // Active customer metrics for customer mode
  const activeCust = selectedCustomer || store.state.clients[0] || {
    id: 'client-sample-1',
    name: 'Sample Klant A',
    loyalty_points: 380,
    loyalty_tier: 'silver',
  };
  const customerPoints = activeCust.loyalty_points ?? 380;
  const customerTier = activeCust.loyalty_tier ?? 'silver';
  const customerBookingsCount = store.state.bookings.filter(
    (b) => b.client_id === activeCust.id || b.client_name.toLowerCase().includes(activeCust.name.toLowerCase().split(' ')[0])
  ).length || 2;

  const customerPetsCount = store.state.pets?.filter(
    (p) => p.client_id === activeCust.id
  ).length || 1;

  const handleNavClick = (tab: NavTabId) => {
    onSelectTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const renderNavItem = (
    tab: NavTabId,
    label: string,
    Icon: ComponentType<{ className?: string }>,
    count?: number,
    iconDefaultColor?: string
  ) => {
    const isActive = activeTab === tab;

    return (
      <button
        key={tab}
        type="button"
        onClick={() => handleNavClick(tab)}
        className={cn(
          'group flex items-center justify-between gap-2.5 rounded-xl px-2.5 py-2 text-xs font-medium transition-all duration-150 text-left w-full cursor-pointer',
          isActive
            ? isDark
              ? 'bg-[#7c3aed] text-white font-bold shadow-md shadow-purple-900/30'
              : 'text-white font-bold shadow-xs'
            : isDark
            ? 'text-slate-400 hover:bg-[#1a1a24] hover:text-white'
            : 'text-secondary-600 hover:bg-secondary-100 hover:text-secondary-900'
        )}
        style={isActive && !isDark ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <Icon
            className={cn(
              'h-4 w-4 shrink-0 transition-colors',
              isActive
                ? 'text-white'
                : isDark
                ? 'text-slate-400 group-hover:text-white'
                : iconDefaultColor || 'text-secondary-500 group-hover:text-secondary-900'
            )}
          />
          <span className="truncate">{label}</span>
        </div>

        {count !== undefined && count > 0 && (
          <span
            className={cn(
              'rounded-full px-1.5 py-0.2 text-[10px] font-bold shrink-0 transition-colors',
              isActive
                ? 'bg-white/20 text-white'
                : isDark
                ? 'bg-[#22222d] text-slate-300'
                : 'bg-secondary-100 text-secondary-600'
            )}
          >
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <aside
      className={cn(
        'flex flex-col h-screen min-h-screen w-full select-none overflow-hidden transition-colors duration-200',
        isDark ? 'bg-[#121217] border-r border-[#22222d]' : 'bg-white border-r border-secondary-200',
        className
      )}
    >
      {/* Sleek, Compact Brand Header */}
      <div
        className={cn(
          'shrink-0 border-b px-3.5 py-3 transition-colors',
          isDark ? 'bg-[#181822] border-[#252535] text-white' : 'border-secondary-200 bg-secondary-50/40 text-secondary-900'
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-white font-bold text-sm shadow-2xs transition-colors"
            style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
          >
            {cfg.client.charAt(0)}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className={cn('truncate text-sm font-bold leading-tight', isDark ? 'text-white' : 'text-secondary-900')}>
              {cfg.client}
            </h2>
            <p className={cn('truncate text-[11px] font-medium', isDark ? 'text-slate-400' : 'text-secondary-500')}>
              {cfg.type.split('-')[0].trim()} • {cfg.city}
            </p>
          </div>
          <span className={cn(
            'rounded px-1.5 py-0.5 text-[9px] font-mono font-bold shrink-0 border',
            userRole === 'customer'
              ? isDark
                ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40'
                : 'bg-emerald-50 text-emerald-800 border-emerald-300'
              : isDark
              ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
              : 'bg-purple-50 text-purple-800 border-purple-200'
          )}>
            {userRole === 'customer' ? 'KLANT' : 'BEHEER'}
          </span>
        </div>
      </div>

      {/* Nav items with NO scrollbar */}
      <nav
        className="flex-1 min-h-0 overflow-y-auto no-scrollbar scrollbar-none px-2.5 py-3 space-y-4"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {userRole === 'customer' ? (
          <>
            {/* Customer Section 1: Mijn Salon Overzicht */}
            <div>
              <p className={cn('mb-1 px-2.5 text-[10px] font-bold uppercase tracking-wider', isDark ? 'text-slate-500' : 'text-secondary-400')}>
                {locale === 'nl' ? 'Mijn Overzicht' : 'My Overview'}
              </p>
              <div className="space-y-0.5">
                {renderNavItem('dashboard', locale === 'nl' ? 'Dashboard' : 'Dashboard', LayoutDashboard, undefined, 'text-primary-600')}
                {renderNavItem('appointments', locale === 'nl' ? 'Mijn Afspraken' : 'My Appointments', CalendarCheck, customerBookingsCount, 'text-emerald-600')}
                {renderNavItem('loyalty', locale === 'nl' ? 'Loyalty & Punten' : 'Loyalty & Perks', Gift, customerPoints, 'text-purple-600')}
                {hasCourses && renderNavItem('courses', locale === 'nl' ? 'Kuurkaarten' : 'Treatment Passes', Sparkles, 1, 'text-amber-500')}
                {isGrooming && renderNavItem('pets', locale === 'nl' ? 'Mijn Huisdieren' : 'My Pets', Heart, customerPetsCount, 'text-rose-500')}
              </div>
            </div>

            {/* Customer Section 2: Salon & Zelfservice */}
            <div>
              <p className={cn('mb-1 px-2.5 text-[10px] font-bold uppercase tracking-wider', isDark ? 'text-slate-500' : 'text-secondary-400')}>
                {locale === 'nl' ? 'Salon & Zelfservice' : 'Salon & Self-Service'}
              </p>
              <div className="space-y-0.5">
                {renderNavItem('services', locale === 'nl' ? 'Behandelingen & Boeken' : 'Services & Rates', Scissors, undefined, 'text-secondary-500')}
                {renderNavItem('profile', locale === 'nl' ? 'Mijn Profiel & Gegevens' : 'My Profile & Data', User, undefined, 'text-primary-600')}
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Admin Section 1: Overview */}
            <div>
              <p className={cn('mb-1 px-2.5 text-[10px] font-bold uppercase tracking-wider', isDark ? 'text-slate-500' : 'text-secondary-400')}>
                {locale === 'nl' ? 'Overzicht' : 'Overview'}
              </p>
              <div className="space-y-0.5">
                {renderNavItem('dashboard', locale === 'nl' ? 'Dashboard' : 'Dashboard', LayoutDashboard, undefined, 'text-primary-600')}
                {renderNavItem('appointments', locale === 'nl' ? 'Alle Boekingen' : 'All Appointments', CalendarCheck, pendingBookingsCount, 'text-emerald-600')}
                {renderNavItem('schedule', locale === 'nl' ? 'Dagindeling' : 'Day Schedule', CalendarDays, undefined, 'text-sky-600')}
                {renderNavItem('clients', locale === 'nl' ? 'Klanten & Dossiers' : 'Clients & Records', Users, clientsCount, 'text-violet-600')}
              </div>
            </div>

            {/* Admin Section 2: Specialized features */}
            {(isGrooming || hasCourses || hasWalkIn) && (
              <div>
                <p className={cn('mb-1 px-2.5 text-[10px] font-bold uppercase tracking-wider', isDark ? 'text-slate-500' : 'text-secondary-400')}>
                  {locale === 'nl' ? 'Specialistisch' : 'Specialized'}
                </p>
                <div className="space-y-0.5">
                  {isGrooming && renderNavItem('pets', locale === 'nl' ? 'Huisdierdossiers' : 'Pet Profiles', Heart, petsCount, 'text-rose-500')}
                  {hasCourses && renderNavItem('courses', locale === 'nl' ? 'Kuurbehandelingen' : 'Treatment Courses', Sparkles, coursesCount, 'text-amber-500')}
                  {hasWalkIn && renderNavItem('walkin', locale === 'nl' ? 'Inloopwachtrij' : 'Walk-in Queue', Clock3, walkInCount, 'text-indigo-500')}
                </div>
              </div>
            )}

            {/* Admin Section 3: Salon Management */}
            <div>
              <p className={cn('mb-1 px-2.5 text-[10px] font-bold uppercase tracking-wider', isDark ? 'text-slate-500' : 'text-secondary-400')}>
                {locale === 'nl' ? 'Salon Beheer' : 'Salon Management'}
              </p>
              <div className="space-y-0.5">
                {renderNavItem('services', locale === 'nl' ? 'Behandelingen & Prijzen' : 'Services & Rates', Scissors, undefined, 'text-secondary-500')}
                {renderNavItem('hours', locale === 'nl' ? 'Openingstijden & Info' : 'Hours & Info', Store, undefined, 'text-secondary-500')}
                {renderNavItem('profile', locale === 'nl' ? 'Mijn Profiel' : 'Profile', User, undefined, 'text-primary-600')}
              </div>
            </div>
          </>
        )}
      </nav>

      {/* Sidebar Footer: VIP Loyalty Card for Customer OR Pro Suite for Admin */}
      <div
        className={cn(
          'shrink-0 p-3 border-t transition-colors',
          isDark ? 'border-[#22222d] bg-[#121217]' : 'border-secondary-200 bg-white'
        )}
      >
        {userRole === 'customer' ? (
          <div
            className={cn(
              'p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden',
              isDark
                ? 'bg-linear-to-br from-purple-950/60 via-[#181826] to-[#12121c] border-purple-500/30 text-white shadow-lg shadow-purple-950/30'
                : 'bg-linear-to-br from-purple-50/90 via-white to-amber-50/60 border-purple-200/80 text-secondary-900 shadow-xs'
            )}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className={cn(
                  'p-1.5 rounded-lg text-xs flex items-center justify-center',
                  isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-100 text-purple-700'
                )}
              >
                <Award className="h-3.5 w-3.5" />
              </span>
              <span
                className={cn(
                  'text-[10px] font-extrabold uppercase tracking-wider',
                  isDark ? 'text-purple-400' : 'text-purple-700'
                )}
              >
                {customerTier.toUpperCase()} VIP MEMBER
              </span>
            </div>

            <p className="text-xs font-bold leading-snug">
              {customerPoints} {locale === 'nl' ? 'Spaarpunten' : 'Loyalty Points'}
            </p>
            <p className={cn('text-[10px] mt-0.5 leading-snug', isDark ? 'text-slate-400' : 'text-secondary-500')}>
              {customerTier === 'gold'
                ? (locale === 'nl' ? 'Hoogste VIP status actief' : 'Highest VIP tier unlocked')
                : (locale === 'nl' ? `Nog ${500 - customerPoints} pts voor Gold VIP` : `${500 - customerPoints} pts to Gold VIP`)}
            </p>

            <div className="mt-3 flex items-center justify-between pt-1">
              <span
                onClick={() => handleNavClick('loyalty')}
                className={cn(
                  'text-[10px] font-medium underline cursor-pointer transition-colors',
                  isDark ? 'text-slate-400 hover:text-white' : 'text-secondary-600 hover:text-secondary-900'
                )}
              >
                {locale === 'nl' ? 'Voordelen' : 'Rewards'}
              </span>
              <button
                type="button"
                onClick={() => handleNavClick('loyalty')}
                className={cn(
                  'text-[10px] font-bold px-2.5 py-1 rounded-lg text-white shadow-xs transition-all hover:opacity-90 active:scale-95 cursor-pointer',
                  isDark ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : ''
                )}
                style={!isDark ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
              >
                {locale === 'nl' ? 'Inwisselen' : 'Redeem'}
              </button>
            </div>
          </div>
        ) : (
          <div
            className={cn(
              'p-3.5 rounded-2xl border text-left transition-all relative overflow-hidden',
              isDark
                ? 'bg-linear-to-br from-purple-950/50 via-[#191926] to-[#13131e] border-purple-500/25 text-white shadow-lg shadow-purple-950/20'
                : 'bg-linear-to-br from-primary-50/80 via-white to-secondary-50/80 border-primary-200/70 text-secondary-900 shadow-xs'
            )}
          >
            <div className="flex items-center gap-1.5 mb-2">
              <span
                className={cn(
                  'p-1.5 rounded-lg text-xs flex items-center justify-center',
                  isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-primary-100 text-primary-700'
                )}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
              </span>
              <span
                className={cn(
                  'text-[10px] font-extrabold uppercase tracking-wider',
                  isDark ? 'text-purple-400' : 'text-primary-700'
                )}
              >
                {locale === 'nl' ? 'Pro Functies' : 'Pro Suite'}
              </span>
            </div>

            <p className="text-xs font-bold leading-snug">
              {locale === 'nl' ? 'Nieuwe functies ontgrendelen' : 'Unlock New Features'}
            </p>
            <p className={cn('text-[10px] mt-0.5 leading-snug', isDark ? 'text-slate-400' : 'text-secondary-500')}>
              {locale === 'nl' ? 'Maximaliseer salon efficiëntie' : '& Maximize Salon Efficiency'}
            </p>

            <div className="mt-3 flex items-center justify-between pt-1">
              <span
                onClick={() => handleNavClick('services')}
                className={cn(
                  'text-[10px] font-medium underline cursor-pointer transition-colors',
                  isDark ? 'text-slate-400 hover:text-white' : 'text-secondary-600 hover:text-secondary-900'
                )}
              >
                {locale === 'nl' ? 'Wat is nieuw?' : "What's New?"}
              </span>
              <button
                type="button"
                onClick={() => handleNavClick('services')}
                className={cn(
                  'text-[10px] font-bold px-2.5 py-1 rounded-lg text-white shadow-xs transition-all hover:opacity-90 active:scale-95 cursor-pointer',
                  isDark ? 'bg-[#7c3aed] hover:bg-[#6d28d9]' : ''
                )}
                style={!isDark ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
              >
                {locale === 'nl' ? 'Upgraden' : 'Upgrade'}
              </button>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
