import { useState, useMemo, type ComponentType } from 'react';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  CalendarPlus,
  AlertCircle,
  Phone,
  MapPin,
  ExternalLink,
  RotateCcw,
  XCircle,
  FileText,
  Heart,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  Store,
  Award,
  Gift,
  Coffee,
  Zap,
  TrendingUp,
  Tag,
  Check,
  Plus,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageContainer } from '@/components/layout/PageContainer';
import { NewBookingModal } from '@/components/appointments/NewBookingModal';
import type { SalonDataStore, BookingRecord } from '@/core/data-store';

export interface CustomerPortalViewProps {
  store: SalonDataStore;
  currentSlug: string;
  onSwitchRole: (role: 'admin' | 'customer') => void;
  isDark?: boolean;
}

interface LoyaltyReward {
  id: string;
  titleNl: string;
  titleEn: string;
  descNl: string;
  descEn: string;
  points: number;
  icon: ComponentType<{ className?: string }>;
  valueEur: number;
}

export function CustomerPortalView({
  store,
  currentSlug,
  onSwitchRole,
  isDark = false,
}: CustomerPortalViewProps) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const cfg = store.config;

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('client-sample-1');
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'appointments' | 'rewards' | 'aftercare'>('dashboard');

  // Active customer details
  const activeCustomer = useMemo(() => {
    return (
      store.state.clients.find((c) => c.id === selectedCustomerId) ||
      store.state.clients[0] || {
        id: 'c-default',
        name: 'Sample Klant A',
        phone: '06-12345678',
        email: 'voorbeeld.a@example.com',
        loyalty_points: 380,
        loyalty_tier: 'silver',
        total_spent_eur: 245.0,
        redeemed_rewards: ['Luxe verzorgende shampoo'],
      }
    );
  }, [store.state.clients, selectedCustomerId]);

  const customerPoints = activeCustomer.loyalty_points ?? 380;
  const customerTier = activeCustomer.loyalty_tier ?? 'silver';
  const customerSpent = activeCustomer.total_spent_eur ?? 245.0;
  const redeemedRewards = activeCustomer.redeemed_rewards ?? [];

  // Customer bookings
  const customerBookings = useMemo(() => {
    return store.state.bookings.filter(
      (b) =>
        b.client_id === activeCustomer.id ||
        b.client_name.toLowerCase().includes(activeCustomer.name.toLowerCase().split(' ')[0])
    );
  }, [store.state.bookings, activeCustomer]);

  // Next upcoming booking
  const nextBooking = useMemo(() => {
    return customerBookings.find((b) => b.status === 'confirmed') || null;
  }, [customerBookings]);

  // Strippenkaart / course package for this customer
  const customerCourse = useMemo(() => {
    return store.state.treatmentCourses?.find(
      (tc) =>
        tc.client_id === activeCustomer.id ||
        tc.client_name.toLowerCase().includes(activeCustomer.name.toLowerCase().split(' ')[0])
    );
  }, [store.state.treatmentCourses, activeCustomer]);

  // Handle Cancel Booking
  const handleCancelBooking = (bookingId: string) => {
    try {
      store.cancelBooking(bookingId, 'Geannuleerd door klant via klantenportaal (24h garantie)');
      toast.success(
        locale === 'nl'
          ? 'Uw afspraak is kosteloos geannuleerd conform het 24-uurs annuleringsbeleid.'
          : 'Your appointment has been cancelled free of charge under the 24-hour guarantee.'
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Kon afspraak niet annuleren.');
    }
  };

  // Loyalty Rewards Catalog (12 Realistic Rewards across All Tiers)
  const loyaltyRewards: LoyaltyReward[] = [
    {
      id: 'rew-1',
      titleNl: 'Luxe Barista Koffie & Bonbon',
      titleEn: 'Luxury Barista Coffee & Chocolate',
      descNl: 'Heerlijke verse cappuccino met luxe bonbon tijdens uw behandeling.',
      descEn: 'Fresh cappuccino and luxury chocolate during your appointment.',
      points: 100,
      icon: Coffee,
      valueEur: 5.5,
    },
    {
      id: 'rew-2',
      titleNl: 'Diepverzorgend Haarmasker / Huidserum Boost',
      titleEn: 'Deep Conditioning Mask / Skin Serum Boost',
      descNl: 'Intensieve voeding en glansbehandeling op maat voor uw haar of huid.',
      descEn: 'Custom intensive nourishment treatment for hair or skin.',
      points: 180,
      icon: Sparkles,
      valueEur: 12.5,
    },
    {
      id: 'rew-3',
      titleNl: 'Ontspannende Hoofdhuid- of Pootsmassage (10 min)',
      titleEn: 'Relaxing Scalp or Paw Massage (10 min)',
      descNl: 'Heerlijke drukpuntmassage met essentiële oliën voor ultieme rust.',
      descEn: 'Aromatherapy pressure-point massage for ultimate relaxation.',
      points: 220,
      icon: Zap,
      valueEur: 14.0,
    },
    {
      id: 'rew-4',
      titleNl: '€10,00 Directe Factuurkorting',
      titleEn: '€10.00 Direct Invoice Discount',
      descNl: 'Tien euro directe korting op uw eerstvolgende afspraak.',
      descEn: 'Direct ten euro credit applied to your next checkout.',
      points: 250,
      icon: Tag,
      valueEur: 10.0,
    },
    {
      id: 'rew-5',
      titleNl: 'Keratine Glans Elixir & Föhnen Touch-Up',
      titleEn: 'Keratin Gloss Elixir & Blow-Dry Touch-Up',
      descNl: 'Professionele hittebescherming en spiegelglans afwerking.',
      descEn: 'Heat protection shield and mirror-gloss finishing treatment.',
      points: 300,
      icon: Sparkles,
      valueEur: 16.5,
    },
    {
      id: 'rew-6',
      titleNl: '€15,00 Factuurkorting & Gratis Sample Set',
      titleEn: '€15.00 Invoice Credit & Deluxe Sample Kit',
      descNl: 'Direct vijftien euro korting plus reisverpakking salonproducten.',
      descEn: '15 euro off next treatment plus a luxury travel grooming set.',
      points: 380,
      icon: Gift,
      valueEur: 22.0,
    },
    {
      id: 'rew-7',
      titleNl: 'Full-Size Salon Shampoo of Vachtspray (250ml)',
      titleEn: 'Full-Size Professional Salon Care (250ml)',
      descNl: 'Professioneel verzorgingsproduct uit onze saloncollectie om mee te nemen.',
      descEn: 'Full-size salon retail bottle matched to your hair or pet coat type.',
      points: 450,
      icon: Store,
      valueEur: 24.5,
    },
    {
      id: 'rew-8',
      titleNl: 'VIP Diamond Treatment & Gratis Stylingproduct',
      titleEn: 'VIP Diamond Treatment & Free Styling Product',
      descNl: 'Exclusieve hoofdhuidmassage en een full-size salonproduct mee naar huis.',
      descEn: 'Scalp massage plus a full-size professional salon product to take home.',
      points: 520,
      icon: Award,
      valueEur: 29.5,
    },
    {
      id: 'rew-9',
      titleNl: 'Baardolie & Hot-Towel Wellness Ritueel',
      titleEn: 'Beard Oil & Hot-Towel Wellness Ritual',
      descNl: 'Warme handdoeken met rozemarijn en cederhout baardolie massage.',
      descEn: 'Steaming hot towel wrap with cedarwood nourishing beard oil infusion.',
      points: 320,
      icon: Zap,
      valueEur: 18.0,
    },
    {
      id: 'rew-10',
      titleNl: '€25,00 Verwenbon voor een Vriend(in)',
      titleEn: '€25.00 Gift Voucher for a Friend',
      descNl: 'Deel uw salonervaring! Geef een vriend(in) 25 euro introductiekorting.',
      descEn: 'Share the experience! Gift a friend 25 euro toward their first visit.',
      points: 600,
      icon: Gift,
      valueEur: 25.0,
    },
    {
      id: 'rew-11',
      titleNl: 'Vachtontwol & Ozon Spa Bad Upgrade (Hond/Kat)',
      titleEn: 'De-shedding & Ozone Spa Bath Upgrade',
      descNl: 'Bubbels en diepgaande vachtreiniging ter vermindering van verharen.',
      descEn: 'Hydromassage ozone bath to release trapped shedding undercoat.',
      points: 400,
      icon: Sparkles,
      valueEur: 22.0,
    },
    {
      id: 'rew-12',
      titleNl: 'Platinum Master Stylist All-in Upgrade',
      titleEn: 'Platinum Master Stylist All-in Upgrade',
      descNl: 'Complete verwenupgrade naar salon directie inclusief drankje naar keuze.',
      descEn: 'Complimentary treatment upgrade to lead creative director chair.',
      points: 750,
      icon: Award,
      valueEur: 45.0,
    },
  ];

  // Redeem Reward Handler
  const handleRedeemReward = (reward: LoyaltyReward) => {
    try {
      store.redeemLoyaltyReward(
        activeCustomer.id,
        reward.id,
        reward.points,
        locale === 'nl' ? reward.titleNl : reward.titleEn
      );
      toast.success(
        locale === 'nl'
          ? `Gefeliciteerd! "${reward.titleNl}" is succesvol ingewisseld en geactiveerd voor uw volgende afspraak!`
          : `Congratulations! "${reward.titleEn}" has been redeemed and activated for your next visit!`
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : (locale === 'nl' ? 'Onvoldoende punten' : 'Not enough points'));
    }
  };

  const isGrooming = Boolean(cfg.type && (cfg.type.toLowerCase().includes('animal') || cfg.type.toLowerCase().includes('grooming')));
  const isBeauty = Boolean(cfg.type && cfg.type.toLowerCase().includes('beauty'));

  return (
    <div className={cn('min-h-screen transition-colors', isDark ? 'bg-[#0f0f15] text-white' : 'bg-secondary-50 text-secondary-900')}>
      {/* Customer Portal Top Navigation Header */}
      <header className={cn(
        'sticky top-0 z-40 border-b px-4 py-3 backdrop-blur-md transition-colors',
        isDark ? 'bg-[#151520]/95 border-[#28283a]' : 'bg-white/95 border-secondary-200'
      )}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Brand & Customer Portal Pill */}
          <div className="flex items-center gap-3">
            <div
              className="h-9 w-9 rounded-xl text-white font-bold text-sm flex items-center justify-center shadow-xs"
              style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
            >
              {cfg.client.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm leading-tight text-secondary-900 dark:text-white">
                  {cfg.client}
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  {locale === 'nl' ? 'Klantenportaal' : 'Customer Portal'}
                </span>
              </div>
              <p className="text-[11px] text-secondary-500">
                {cfg.type.split('-')[0].trim()} • {cfg.city}
              </p>
            </div>
          </div>

          {/* Customer Profile & Role Switcher Actions */}
          <div className="flex items-center gap-3">
            {/* Switch Sample Customer to test different accounts */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-secondary-400 hidden sm:inline">{locale === 'nl' ? 'Klant:' : 'Client:'}</span>
              <select
                value={selectedCustomerId}
                onChange={(e) => setSelectedCustomerId(e.target.value)}
                className={cn(
                  'px-2 py-1 text-xs font-semibold rounded-lg border focus:outline-hidden cursor-pointer',
                  isDark ? 'bg-[#1c1c28] border-[#38384e] text-white' : 'bg-white border-secondary-300'
                )}
              >
                {store.state.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.loyalty_points || 0} pts)
                  </option>
                ))}
              </select>
            </div>

            {/* Book Appointment Modal Trigger */}
            <Button
              size="sm"
              variant="primary"
              onClick={() => setBookingModalOpen(true)}
              className="text-xs font-bold text-white shadow-xs"
              style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
            >
              <CalendarPlus className="h-3.5 w-3.5 mr-1.5" />
              <span>{locale === 'nl' ? 'Nieuwe Boeking' : 'New Booking'}</span>
            </Button>

            {/* Live Role Switcher Button back to Admin */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => onSwitchRole('admin')}
              className="text-xs font-bold border-secondary-300 hover:bg-secondary-100 dark:border-[#38384e]"
            >
              <ShieldCheck className="h-3.5 w-3.5 mr-1 text-primary-600" />
              <span>{locale === 'nl' ? 'Naar Salon Beheer' : 'Admin View'}</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <PageContainer size="wide" className="py-6 space-y-6">
        {/* Customer Welcome & Quick Nav Header */}
        <div className={cn(
          'p-6 rounded-2xl border transition-all shadow-xs relative overflow-hidden',
          isDark
            ? 'bg-linear-to-r from-purple-950/40 via-[#181824] to-[#12121a] border-[#2f2f44]'
            : 'bg-linear-to-r from-primary-50/80 via-white to-secondary-50/80 border-primary-200/60'
        )}>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="h-4 w-4 text-amber-500" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary-600 dark:text-primary-400">
                  {locale === 'nl' ? 'Klanten Dashboard' : 'Customer Dashboard'}
                </span>
                <span className="text-secondary-300">•</span>
                <Badge
                  variant={customerTier === 'gold' ? 'warning' : 'secondary'}
                  className="text-[10px] uppercase font-bold"
                >
                  {customerTier === 'gold' ? '🥇 Gold VIP' : customerTier === 'silver' ? '🥈 Silver Member' : '🥉 Bronze Member'}
                </Badge>
              </div>
              <h1 className="text-xl sm:text-2xl font-black text-secondary-900 dark:text-white">
                {locale === 'nl' ? `Welkom terug, ${activeCustomer.name}` : `Welcome back, ${activeCustomer.name}`}
              </h1>
              <p className={cn('text-xs mt-1 max-w-xl leading-relaxed', isDark ? 'text-slate-300' : 'text-secondary-600')}>
                {locale === 'nl'
                  ? `U heeft momenteel ${customerPoints} spaarpunten. Plan een nieuwe afspraak in via de snelle boekingsmodal of wissel uw punten in voor exclusieve salonvoordelen.`
                  : `You currently have ${customerPoints} loyalty points. Schedule a new appointment with the booking modal or redeem rewards.`}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <Button
                variant="primary"
                onClick={() => setBookingModalOpen(true)}
                className="text-xs font-bold text-white shadow-md hover:scale-102 transition-transform"
                style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
              >
                <CalendarPlus className="h-4 w-4 mr-1.5" />
                {locale === 'nl' ? 'Afspraak Inplannen (Modal)' : 'Book Appointment (Modal)'}
              </Button>
            </div>
          </div>
        </div>

        {/* 4 Customer Dashboard KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Next Upcoming Appointment Spotlight */}
          <Card className="p-4 border-secondary-200 dark:border-[#272733] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-primary-600" />
                  {locale === 'nl' ? 'Volgende Afspraak' : 'Next Appointment'}
                </span>
                {nextBooking && (
                  <Badge variant="success" className="text-[10px]">
                    {nextBooking.status.toUpperCase()}
                  </Badge>
                )}
              </div>

              {nextBooking ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-secondary-900 dark:text-white">
                    {nextBooking.service_name}
                  </p>
                  <p className="text-xs font-mono font-semibold text-primary-600 dark:text-primary-400">
                    {nextBooking.date} • {nextBooking.start_time} uur
                  </p>
                  <p className="text-[11px] text-secondary-500">
                    Specialist: {nextBooking.staff_name}
                  </p>
                </div>
              ) : (
                <div className="space-y-1 py-1">
                  <p className="text-xs font-semibold text-secondary-700 dark:text-slate-300">
                    {locale === 'nl' ? 'Geen afspraak gepland' : 'No upcoming booking'}
                  </p>
                  <p className="text-[11px] text-secondary-500">
                    {locale === 'nl' ? 'Plan direct in met 1 klik' : 'Book easily in seconds'}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-secondary-100 dark:border-[#272733] mt-3">
              {nextBooking ? (
                <div className="flex items-center justify-between text-xs">
                  <button
                    type="button"
                    onClick={() => handleCancelBooking(nextBooking.id)}
                    className="text-rose-600 hover:text-rose-700 font-semibold cursor-pointer text-[11px]"
                  >
                    {locale === 'nl' ? 'Annuleren (24h gratis)' : 'Cancel (24h free)'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setBookingModalOpen(true)}
                    className="text-primary-600 hover:underline font-semibold cursor-pointer text-[11px]"
                  >
                    {locale === 'nl' ? 'Verzetten &rarr;' : 'Reschedule &rarr;'}
                  </button>
                </div>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setBookingModalOpen(true)}
                  className="w-full text-xs font-bold"
                >
                  <Plus className="h-3 w-3 mr-1" />
                  {locale === 'nl' ? 'Afspraak Maken' : 'Book Now'}
                </Button>
              )}
            </div>
          </Card>

          {/* Card 2: Loyalty Points & Rewards Value */}
          <Card className="p-4 border-secondary-200 dark:border-[#272733] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-amber-500" />
                  {locale === 'nl' ? 'Loyalty Punten' : 'Loyalty Points'}
                </span>
                <span className="text-[10px] font-bold text-amber-600 font-mono">
                  €{(customerPoints * 0.05).toFixed(2)} waarde
                </span>
              </div>

              <div className="space-y-1">
                <div className="text-2xl font-black font-mono text-amber-600 dark:text-amber-400">
                  {customerPoints} <span className="text-xs font-normal text-secondary-500">pts</span>
                </div>
                <div className="flex items-center justify-between text-[11px] text-secondary-500">
                  <span>Level: <strong className="capitalize">{customerTier}</strong></span>
                  <span>{customerTier === 'gold' ? 'Max level' : `${500 - customerPoints} tot Gold VIP`}</span>
                </div>
              </div>
            </div>

            <div className="pt-2 mt-2">
              <div className="w-full bg-secondary-200 dark:bg-[#2b2b3d] h-2 rounded-full overflow-hidden">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, (customerPoints / 500) * 100)}%` }}
                />
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('rewards')}
                className="text-primary-600 hover:underline font-semibold text-[11px] mt-2 block"
              >
                {locale === 'nl' ? 'Bekijk beloningen winkel &rarr;' : 'View rewards store &rarr;'}
              </button>
            </div>
          </Card>

          {/* Card 3: Treatment Course / Strippenkaart */}
          <Card className="p-4 border-secondary-200 dark:border-[#272733] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 flex items-center gap-1.5">
                  <Gift className="h-3.5 w-3.5 text-indigo-500" />
                  {locale === 'nl' ? 'Mijn Strippenkaart' : 'Package Balance'}
                </span>
                {customerCourse && (
                  <Badge variant="warning" className="text-[9px] font-mono">
                    {customerCourse.completed_sessions}/{customerCourse.total_sessions}
                  </Badge>
                )}
              </div>

              {customerCourse ? (
                <div className="space-y-1">
                  <p className="text-sm font-bold text-secondary-900 dark:text-white truncate">
                    {customerCourse.service_name}
                  </p>
                  <p className="text-xs text-secondary-600 dark:text-slate-300">
                    <strong>{customerCourse.total_sessions - customerCourse.completed_sessions}</strong> behandelingen tegoed
                  </p>
                  <p className="text-[10px] text-emerald-600 font-semibold">
                    ✓ €30 pakketbesparing behaald
                  </p>
                </div>
              ) : (
                <div className="space-y-1 py-1">
                  <p className="text-xs font-semibold text-secondary-700 dark:text-slate-300">
                    {locale === 'nl' ? 'Geen actieve strippenkaart' : 'No active package'}
                  </p>
                  <p className="text-[11px] text-secondary-500">
                    {locale === 'nl' ? 'Bespaar tot 25% op kuurbehandelingen' : 'Save up to 25% on courses'}
                  </p>
                </div>
              )}
            </div>

            <div className="pt-2 mt-2">
              {customerCourse && (
                <div className="w-full bg-secondary-200 dark:bg-[#2b2b3d] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(customerCourse.completed_sessions / customerCourse.total_sessions) * 100}%` }}
                  />
                </div>
              )}
              <span className="text-[10px] text-secondary-400 mt-2 block">
                {locale === 'nl' ? 'Geldig bij alle specialisten' : 'Valid with all specialists'}
              </span>
            </div>
          </Card>

          {/* Card 4: Total Visits & Loyalty Benefits */}
          <Card className="p-4 border-secondary-200 dark:border-[#272733] flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 flex items-center gap-1.5">
                  <Award className="h-3.5 w-3.5 text-purple-500" />
                  {locale === 'nl' ? 'Klantstatus & Voordeel' : 'Client Status'}
                </span>
                <span className="text-[10px] font-bold text-purple-600">
                  {customerBookings.length} {locale === 'nl' ? 'bezoeken' : 'visits'}
                </span>
              </div>

              <div className="space-y-1">
                <p className="text-sm font-bold text-secondary-900 dark:text-white">
                  VIP Salon Privileges
                </p>
                <p className="text-xs text-secondary-600 dark:text-slate-300">
                  {locale === 'nl' ? '✓ 24-uurs gratis annuleren' : '✓ 24-hour free cancellation'}
                </p>
                <p className="text-xs text-secondary-600 dark:text-slate-300">
                  {locale === 'nl' ? '✓ Punten sparen bij ieder bezoek' : '✓ Points earned per booking'}
                </p>
              </div>
            </div>

            <div className="pt-2 mt-2 border-t border-secondary-100 dark:border-[#272733]">
              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                Totaal besteed: €{customerSpent.toFixed(2)}
              </span>
            </div>
          </Card>
        </div>

        {/* Sub-Navigation Tabs: Dashboard / Appointments / Loyalty Rewards / Aftercare */}
        <div className="flex items-center gap-2 border-b border-secondary-200 dark:border-[#272738] pb-1">
          <button
            type="button"
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'dashboard'
                ? isDark ? 'bg-[#7c3aed] text-white shadow-xs' : 'bg-primary-600 text-white shadow-xs'
                : 'text-secondary-600 hover:text-secondary-900 dark:text-slate-400'
            )}
            style={activeTab === 'dashboard' && !isDark ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
          >
            <Sparkles className="h-4 w-4" />
            <span>{locale === 'nl' ? 'Overzicht & Snel Boeken' : 'Dashboard & Quick Book'}</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rewards')}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'rewards'
                ? isDark ? 'bg-[#7c3aed] text-white shadow-xs' : 'bg-primary-600 text-white shadow-xs'
                : 'text-secondary-600 hover:text-secondary-900 dark:text-slate-400'
            )}
            style={activeTab === 'rewards' && !isDark ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
          >
            <Gift className="h-4 w-4" />
            <span>{locale === 'nl' ? 'Loyalty Beloningen Inwisselen' : 'Loyalty Rewards Store'}</span>
            <Badge variant="warning" className="text-[10px] ml-1">
              {customerPoints} pts
            </Badge>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('appointments')}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'appointments'
                ? isDark ? 'bg-[#7c3aed] text-white shadow-xs' : 'bg-primary-600 text-white shadow-xs'
                : 'text-secondary-600 hover:text-secondary-900 dark:text-slate-400'
            )}
            style={activeTab === 'appointments' && !isDark ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
          >
            <Calendar className="h-4 w-4" />
            <span>{locale === 'nl' ? 'Alle Afspraken' : 'All Appointments'}</span>
            <span className="text-[10px] opacity-75">({customerBookings.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('aftercare')}
            className={cn(
              'px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer',
              activeTab === 'aftercare'
                ? isDark ? 'bg-[#7c3aed] text-white shadow-xs' : 'bg-primary-600 text-white shadow-xs'
                : 'text-secondary-600 hover:text-secondary-900 dark:text-slate-400'
            )}
            style={activeTab === 'aftercare' && !isDark ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
          >
            <FileText className="h-4 w-4" />
            <span>{locale === 'nl' ? 'Nazorgadvies' : 'Aftercare Sheet'}</span>
          </button>
        </div>

        {/* Tab 1: Dashboard Home with Recommended Treatments & Fast Modal Booking */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* Quick 1-Click Treatment Selection Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                  <Scissors className="h-4 w-4 text-primary-600" />
                  <span>{locale === 'nl' ? 'Populaire Behandelingen (Direct Inplannen)' : 'Popular Treatments (Direct Booking)'}</span>
                </h3>
                <span className="text-xs text-secondary-500">
                  {locale === 'nl' ? 'Klik om direct tijdslot te kiezen in modal' : 'Click to pick time in modal'}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {store.state.services.slice(0, 6).map((service) => (
                  <div
                    key={service.id}
                    className="p-4 rounded-xl border border-secondary-200 dark:border-[#2b2b3d] bg-white dark:bg-[#161622] hover:border-primary-400 hover:shadow-md transition-all flex flex-col justify-between gap-3 group"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-secondary-900 dark:text-white group-hover:text-primary-600 transition-colors">
                          {service.name}
                        </span>
                        <span className="font-mono font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                          €{service.price_eur?.toFixed(2) || '35.00'}
                        </span>
                      </div>
                      <p className="text-xs text-secondary-500 mt-1 flex items-center gap-2">
                        <Clock className="h-3 w-3 text-secondary-400" />
                        <span>{service.duration_min} minuten behandeltijd</span>
                        {service.student_price_eur && (
                          <span className="text-blue-600 font-semibold">Student: €{service.student_price_eur}</span>
                        )}
                      </p>
                    </div>

                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => setBookingModalOpen(true)}
                      className="w-full text-xs font-bold text-white shadow-2xs"
                      style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
                    >
                      <CalendarPlus className="h-3.5 w-3.5 mr-1" />
                      {locale === 'nl' ? 'Kies Tijdslot & Boek' : 'Select Time & Book'}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Rewards Teaser Bar */}
            <div className={cn(
              'p-4 rounded-xl border flex flex-col sm:flex-row items-center justify-between gap-4',
              isDark ? 'bg-[#181826] border-[#2c2c3e]' : 'bg-amber-50/70 border-amber-200 text-amber-950'
            )}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-600 flex items-center justify-center shrink-0">
                  <Gift className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm leading-tight">
                    {locale === 'nl' ? 'U heeft 380 spaarpunten beschikbaar!' : 'You have 380 loyalty points ready!'}
                  </h4>
                  <p className="text-xs text-secondary-600 dark:text-slate-400">
                    {locale === 'nl'
                      ? 'Wissel vandaag nog in voor €15 factuurkorting of een gratis haarmasker bij uw afspraak.'
                      : 'Redeem today for a €15 discount or complimentary mask on your appointment.'}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setActiveTab('rewards')}
                className="shrink-0 text-xs font-bold border-amber-400 bg-white dark:bg-[#1f1f2e] text-amber-800 dark:text-amber-300"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1 text-amber-500" />
                {locale === 'nl' ? 'Beloningen Bekijken' : 'View Rewards'}
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Loyalty Rewards Store */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            {/* Header info */}
            <div className={cn(
              'p-5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4',
              isDark ? 'bg-[#161622] border-[#2c2c3d]' : 'bg-white border-secondary-200'
            )}>
              <div>
                <h3 className="text-base font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-500" />
                  <span>{locale === 'nl' ? 'Loyalty Rewards Catalogus & Inwisselen' : 'Loyalty Rewards Store'}</span>
                </h3>
                <p className="text-xs text-secondary-500 mt-0.5">
                  {locale === 'nl'
                    ? 'Spaar automatisch 10 punten per €1 besteed. Wissel punten direct in voor exclusieve salonvoordelen.'
                    : 'Earn 10 points per €1 spent. Redeem points directly for treatments and salon perks.'}
                </p>
              </div>

              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 text-amber-900 dark:text-amber-300 font-mono text-center">
                <div className="text-[10px] uppercase font-bold text-amber-700 dark:text-amber-400">Uw Saldo</div>
                <div className="text-lg font-black">{customerPoints} Punten</div>
              </div>
            </div>

            {/* Active / Unlocked Rewards */}
            {redeemedRewards.length > 0 && (
              <div className="p-4 rounded-xl border border-emerald-300 bg-emerald-50/80 dark:bg-emerald-950/30 text-xs text-emerald-900 dark:text-emerald-300 space-y-1">
                <span className="font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  {locale === 'nl' ? 'Geactiveerde Beloningen voor uw Eerstvolgende Bezoek:' : 'Active Rewards for Next Visit:'}
                </span>
                <div className="flex flex-wrap gap-2 pt-1">
                  {redeemedRewards.map((rew, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-md bg-white dark:bg-[#1c2e24] border border-emerald-400 font-semibold text-emerald-800 dark:text-emerald-200">
                      ✓ {rew}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reward Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {loyaltyRewards.map((reward) => {
                const IconComponent = reward.icon;
                const canAfford = customerPoints >= reward.points;
                const isAlreadyRedeemed = redeemedRewards.includes(locale === 'nl' ? reward.titleNl : reward.titleEn);

                return (
                  <div
                    key={reward.id}
                    className={cn(
                      'p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4',
                      canAfford
                        ? 'bg-white dark:bg-[#161622] border-secondary-200 dark:border-[#2b2b3d] shadow-xs hover:border-amber-400'
                        : 'bg-secondary-50/50 dark:bg-[#121218] border-secondary-200 dark:border-[#22222f] opacity-75'
                    )}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="h-10 w-10 rounded-xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <Badge variant="warning" className="font-mono text-xs font-bold">
                          {reward.points} Punten
                        </Badge>
                      </div>

                      <h4 className="font-bold text-sm text-secondary-900 dark:text-white">
                        {locale === 'nl' ? reward.titleNl : reward.titleEn}
                      </h4>
                      <p className="text-xs text-secondary-500 leading-relaxed">
                        {locale === 'nl' ? reward.descNl : reward.descEn}
                      </p>
                      <span className="text-[11px] text-emerald-600 font-semibold block">
                        Waarde: €{reward.valueEur.toFixed(2)}
                      </span>
                    </div>

                    <Button
                      size="sm"
                      variant={canAfford ? 'primary' : 'outline'}
                      disabled={!canAfford}
                      onClick={() => handleRedeemReward(reward)}
                      className={cn(
                        'w-full text-xs font-bold',
                        canAfford
                          ? 'text-white shadow-xs'
                          : 'text-secondary-400 border-secondary-300'
                      )}
                      style={canAfford ? { backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' } : undefined}
                    >
                      <Gift className="h-3.5 w-3.5 mr-1.5" />
                      {canAfford
                        ? (locale === 'nl' ? 'Beloning Inwisselen' : 'Redeem Reward')
                        : (locale === 'nl' ? `Nog ${reward.points - customerPoints} punten nodig` : `Need ${reward.points - customerPoints} more pts`)}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab 3: Appointments List */}
        {activeTab === 'appointments' && (
          <Card className="p-6 border-secondary-200 dark:border-[#272733] space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                <span>{locale === 'nl' ? 'Alle Reserveringen' : 'All Appointments'}</span>
              </h3>
              <Button
                size="sm"
                variant="primary"
                onClick={() => setBookingModalOpen(true)}
                className="text-xs font-bold text-white shadow-xs"
                style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {locale === 'nl' ? 'Nieuwe Afspraak' : 'New Appointment'}
              </Button>
            </div>

            <div className="space-y-3">
              {customerBookings.map((b) => {
                const isConfirmed = b.status === 'confirmed';
                const isCancelled = b.status === 'cancelled';

                return (
                  <div
                    key={b.id}
                    className={cn(
                      'p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3',
                      isCancelled ? 'bg-rose-50/20 border-rose-200 opacity-60' : 'bg-white dark:bg-[#161622] border-secondary-200 dark:border-[#2b2b3d]'
                    )}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-secondary-900 dark:text-white">{b.service_name}</span>
                        <Badge variant={isConfirmed ? 'success' : isCancelled ? 'danger' : 'secondary'} className="text-[10px]">
                          {b.status.toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs text-secondary-600 dark:text-slate-400 mt-1 flex items-center gap-2 font-mono">
                        <Clock className="h-3 w-3 text-primary-600" />
                        <span>{b.date} om {b.start_time} - {b.end_time} uur</span>
                        <span>•</span>
                        <span>{b.staff_name}</span>
                        {b.price_eur && <span>• €{b.price_eur.toFixed(2)}</span>}
                      </p>
                    </div>

                    {isConfirmed && (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCancelBooking(b.id)}
                          className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                        >
                          {locale === 'nl' ? 'Annuleren (24h)' : 'Cancel'}
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        )}

        {/* Tab 4: Aftercare Advice Sheet */}
        {activeTab === 'aftercare' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
            <Card className="p-6 border-secondary-200 dark:border-[#272733] space-y-3">
              <h4 className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary-600" />
                <span>{locale === 'nl' ? 'Nazorg & Thuisverzorging Instructies' : 'Homecare & Aftercare'}</span>
              </h4>

              <div className="text-xs text-secondary-700 dark:text-slate-300 space-y-2 leading-relaxed">
                {isBeauty ? (
                  <>
                    <p className="font-semibold text-amber-700 dark:text-amber-300">
                      • {locale === 'nl' ? 'Bescherming tegen direct zonlicht (SPF 50)' : 'Sun protection SPF 50'}
                    </p>
                    <p>{locale === 'nl' ? 'Vermijd sauna, zonnebank en intensieve cardio gedurende 48 uur na de laser/peeling behandeling.' : 'Avoid saunas and intense workouts for 48h.'}</p>
                    <p>{locale === 'nl' ? 'Houd de huid optimaal gehydrateerd met de geadviseerde kalmerende crème.' : 'Keep skin hydrated with recommended moisturizer.'}</p>
                  </>
                ) : isGrooming ? (
                  <>
                    <p className="font-semibold text-rose-700 dark:text-rose-300">
                      • {locale === 'nl' ? 'Vachtverzorging & Dagelijks Borstelen' : 'Daily coat brushing'}
                    </p>
                    <p>{locale === 'nl' ? 'Controleer de oksels en achter de oren dagelijks op beginnende klitten met een metalen kam.' : 'Check armpits and behind ears daily with a metal comb.'}</p>
                    <p>{locale === 'nl' ? 'Laat de hond niet direct door nat gras rennen totdat de vacht volledig droog en gekamd is.' : 'Keep pet dry and avoid wet grass today.'}</p>
                  </>
                ) : (
                  <>
                    <p className="font-semibold text-primary-700 dark:text-primary-300">
                      • {locale === 'nl' ? 'Kleurbehoud & Wasadvies' : 'Color Lock Instructions'}
                    </p>
                    <p>{locale === 'nl' ? 'Was het haar de eerste 48 uur niet met shampoo om kleurpigmenten te laten hechten.' : 'Do not wash with shampoo for 48h to lock color pigment.'}</p>
                    <p>{locale === 'nl' ? 'Gebruik lauwwarm water en een sulfaatvrije conditioner voor maximaal glansbehoud.' : 'Use lukewarm water and sulfate-free conditioner.'}</p>
                  </>
                )}
              </div>
            </Card>

            <Card className="p-6 border-secondary-200 dark:border-[#272733] space-y-3">
              <h4 className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <span>{locale === 'nl' ? 'Vragen of Onzekerheden?' : 'Questions?'}</span>
              </h4>

              <p className="text-xs text-secondary-600 dark:text-slate-300 leading-relaxed">
                {locale === 'nl'
                  ? `Heeft u na uw behandeling bij ${cfg.client} nog vragen? Onze specialisten zijn direct bereikbaar via WhatsApp of telefoon.`
                  : `Any questions about your treatment results? Reach our specialists directly via phone or WhatsApp.`}
              </p>

              <div className="pt-2">
                <a
                  href={`tel:${cfg.contact?.phone || '0101234567'}`}
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors"
                >
                  <Phone className="h-3.5 w-3.5" />
                  <span>{locale === 'nl' ? 'Bel de Salon' : 'Call Salon'}</span>
                </a>
              </div>
            </Card>
          </div>
        )}
      </PageContainer>

      {/* Customer Booking Modal (Replaces clunky multi-step form with sleek modal) */}
      <NewBookingModal
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        store={store}
        initialClientId={activeCustomer.id}
        isCustomerMode={true}
        isDark={isDark}
        onBookingCreated={(newB) => {
          setBookingModalOpen(false);
          toast.success(
            locale === 'nl'
              ? `Afspraak succesvol ingepland op ${newB.date} om ${newB.start_time}!`
              : `Appointment scheduled for ${newB.date} at ${newB.start_time}!`
          );
        }}
      />
    </div>
  );
}
