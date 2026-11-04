import { useState, useMemo, type ComponentType } from 'react';
import {
  LayoutDashboard,
  Sparkles,
  Award,
  Gift,
  Coffee,
  Tag,
  CheckCircle2,
  Plus,
  RotateCcw,
  ShieldCheck,
  Eye,
  Calendar,
  Clock,
  User,
  Star,
  MessageSquare,
  Send,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageContainer } from '@/components/layout/PageContainer';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import { SalesLineGraph, type SalesPoint } from '@/components/dashboard/SalesLineGraph';
import { UpcomingAppointmentsPanel } from '@/components/dashboard/UpcomingAppointmentsPanel';
import { NewBookingModal } from '@/components/appointments/NewBookingModal';
import type { SalonDataStore, BookingRecord } from '@/core/data-store';
import type { NavTabId } from '@/components/layout/Sidebar';

export interface CustomerDashboardViewProps {
  store: SalonDataStore;
  onSelectTab: (tab: NavTabId) => void;
  onNewBookingClick?: () => void;
  isDark?: boolean;
  selectedCustomerId?: string;
  onSelectCustomer?: (id: string) => void;
}

interface LoyaltyRewardItem {
  id: string;
  titleNl: string;
  titleEn: string;
  descNl: string;
  descEn: string;
  points: number;
  icon: ComponentType<{ className?: string }>;
  valueEur: number;
}

export function CustomerDashboardView({
  store,
  isDark = false,
  selectedCustomerId = 'client-sample-1',
  onSelectCustomer,
}: CustomerDashboardViewProps) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const cfg = store.config;

  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [selectedBookingDetails, setSelectedBookingDetails] = useState<Partial<BookingRecord> | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [aftercareModalOpen, setAftercareModalOpen] = useState(false);
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewText, setReviewText] = useState('');
  const [submittedReviews, setSubmittedReviews] = useState<Array<{ name: string; rating: number; text: string; date: string }>>([
    {
      name: 'Sophie van Dijk',
      rating: 5,
      text: 'Fantastische service bij het knippen en föhnen. Altijd een ontspannen ervaring met heerlijke koffie en vakkundig advies!',
      date: 'Gisteren',
    },
    {
      name: 'Anouk de Jong',
      rating: 5,
      text: 'Super blij met mijn nieuwe balayage kleuring! Vakkundig geadviseerd en een prachtig natuurlijk glanzend resultaat.',
      date: '3 dagen geleden',
    },
    {
      name: 'Jan de Vries',
      rating: 5,
      text: 'Snelle service, strakke fade en vriendelijke sfeer. Al geruime tijd vaste en zeer tevreden klant!',
      date: '1 week geleden',
    },
  ]);

  // Active Customer Record
  const activeCustomer = useMemo(() => {
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

  const customerPoints = activeCustomer.loyalty_points ?? 380;
  const customerTier = activeCustomer.loyalty_tier ?? 'silver';
  const customerSpent = activeCustomer.total_spent_eur ?? 245.0;

  // Customer Bookings
  const customerBookings = useMemo(() => {
    return store.state.bookings.filter(
      (b) =>
        b.client_id === activeCustomer.id ||
        b.client_name.toLowerCase().includes(activeCustomer.name.toLowerCase().split(' ')[0])
    );
  }, [store.state.bookings, activeCustomer]);

  const customerBookingsCount = customerBookings.length || 2;
  const nextBooking = customerBookings.find((b) => b.status === 'confirmed') || null;

  // Loyalty Rewards
  const loyaltyRewards: LoyaltyRewardItem[] = [
    {
      id: 'rew-1',
      titleNl: 'Luxe Barista Koffie & Traktatie',
      titleEn: 'Luxury Barista Coffee & Treat',
      descNl: 'Heerlijke cappuccino met luxe bonbon.',
      descEn: 'Cappuccino with artisan chocolate.',
      points: 100,
      icon: Coffee,
      valueEur: 5.5,
    },
    {
      id: 'rew-2',
      titleNl: 'Diepverzorgend Haarmasker / Boost',
      titleEn: 'Conditioning Mask / Skin Boost',
      descNl: 'Intensieve voeding en glansbehandeling.',
      descEn: 'Intensive nourishing care treatment.',
      points: 200,
      icon: Sparkles,
      valueEur: 12.5,
    },
    {
      id: 'rew-3',
      titleNl: '€15 Directe Factuurkorting',
      titleEn: '€15 Direct Invoice Discount',
      descNl: 'Direct vijftien euro korting op uw factuur.',
      descEn: 'Fifteen euros off your next appointment.',
      points: 350,
      icon: Tag,
      valueEur: 15.0,
    },
    {
      id: 'rew-4',
      titleNl: 'VIP Diamond Behandeling',
      titleEn: 'VIP Diamond Treatment',
      descNl: 'Exclusieve massage + gratis salonproduct.',
      descEn: 'Scalp massage + professional gift.',
      points: 500,
      icon: Award,
      valueEur: 27.5,
    },
  ];

  // Loyalty Points Curve Data
  const customerLoyaltyData: SalesPoint[] = [
    { month: 'Jan', monthNl: 'Jan', value: 80, formatted: '80 pts' },
    { month: 'Feb', monthNl: 'Feb', value: 120, formatted: '120 pts' },
    { month: 'Mar', monthNl: 'Mrt', value: 180, formatted: '180 pts' },
    { month: 'Apr', monthNl: 'Apr', value: 230, formatted: '230 pts' },
    { month: 'May', monthNl: 'Mei', value: 290, formatted: '290 pts' },
    { month: 'Jun', monthNl: 'Jun', value: 380, formatted: '380 pts (Silver VIP)' },
    { month: 'Jul', monthNl: 'Jul', value: 410, formatted: '410 pts' },
    { month: 'Aug', monthNl: 'Aug', value: 450, formatted: '450 pts' },
    { month: 'Sep', monthNl: 'Sep', value: 350, formatted: '350 pts (Korting verzilverd)' },
    { month: 'Oct', monthNl: 'Okt', value: 420, formatted: '420 pts' },
    { month: 'Nov', monthNl: 'Nov', value: 480, formatted: '480 pts (Gold VIP nabij)' },
    { month: 'Dec', monthNl: 'Dec', value: 520, formatted: '520 pts' },
  ];

  // 1-Click Redeem Reward Handler
  const handleRedeemReward = (reward: LoyaltyRewardItem) => {
    try {
      store.redeemLoyaltyReward(
        activeCustomer.id,
        reward.id,
        reward.points,
        locale === 'nl' ? reward.titleNl : reward.titleEn
      );
      toast.success(
        locale === 'nl'
          ? `Gefeliciteerd! "${reward.titleNl}" is succesvol ingewisseld voor uw volgende afspraak!`
          : `Congratulations! "${reward.titleEn}" has been redeemed for your next appointment!`
      );
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : (locale === 'nl' ? 'Onvoldoende spaarpunten.' : 'Insufficient loyalty points.'));
    }
  };

  const handleOpenDetails = (booking: Partial<BookingRecord>) => {
    setSelectedBookingDetails(booking);
    setDetailsModalOpen(true);
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewText.trim()) {
      toast.error(locale === 'nl' ? 'Schrijf alstublieft een korte ervaring.' : 'Please enter a brief review.');
      return;
    }
    setSubmittedReviews((prev) => [
      {
        name: activeCustomer.name,
        rating: reviewRating,
        text: reviewText.trim(),
        date: locale === 'nl' ? 'Zojuist' : 'Just now',
      },
      ...prev,
    ]);
    setReviewText('');
    setReviewModalOpen(false);
    toast.success(
      locale === 'nl'
        ? 'Hartelijk dank voor uw beoordeling! Uw review is succesvol geplaatst.'
        : 'Thank you for your rating! Your review has been submitted.'
    );
  };

  return (
    <PageContainer size="wide" className="space-y-6">
      {/* Top Bar Header with Title, Salon Pill, Customer Account Switcher & New Booking */}
      <div
        className={cn(
          'flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl border transition-colors',
          isDark
            ? 'bg-[#181820] border-[#272733] text-white shadow-xl'
            : 'bg-white border-secondary-200 text-secondary-900 shadow-xs'
        )}
      >
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white font-bold text-xs shadow-xs"
              style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
            >
              <LayoutDashboard className="h-4 w-4" />
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
              {locale === 'nl' ? 'Dashboard' : 'Dashboard'}
            </h1>
            <span
              className={cn(
                'ml-1 text-xs font-semibold px-2.5 py-0.5 rounded-full border',
                isDark
                  ? 'bg-purple-950/60 text-purple-300 border-purple-500/40'
                  : 'bg-primary-50 text-primary-700 border-primary-200'
              )}>
              {cfg.client} ({cfg.city})
            </span>
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              {locale === 'nl' ? '👤 Klantenoverzicht' : '👤 Customer View'}
            </span>
          </div>
          <p className={cn('text-xs mt-1', isDark ? 'text-slate-400' : 'text-secondary-500')}>
            {locale === 'nl'
              ? `Welkom terug, ${activeCustomer.name}! Bekijk uw persoonlijke afspraken, spaarpunten saldo, behandelingen en exclusieve salonbeloningen.`
              : `Welcome back, ${activeCustomer.name}! View your upcoming appointments, loyalty points balance, treatments, and exclusive salon rewards.`}
          </p>
        </div>

        {/* Action Controls: Switch Customer Demo & New Booking */}
        <div className="flex items-center gap-3">
          {onSelectCustomer && (
            <div className="flex items-center gap-1.5 text-xs">
              <span className={cn('text-xs font-medium hidden sm:inline', isDark ? 'text-slate-400' : 'text-secondary-500')}>
                {locale === 'nl' ? 'Account:' : 'Account:'}
              </span>
              <select
                value={selectedCustomerId}
                onChange={(e) => onSelectCustomer(e.target.value)}
                className={cn(
                  'px-2.5 py-1.5 text-xs font-bold rounded-lg border focus:outline-none cursor-pointer',
                  isDark
                    ? 'bg-[#22222f] border-[#343448] text-white hover:border-[#4c4c66]'
                    : 'bg-white border-secondary-300 text-secondary-900 hover:border-secondary-400'
                )}
              >
                {store.state.clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.loyalty_points || 0} pts)
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => setBookingModalOpen(true)}
            className="text-white font-bold text-xs shadow-md transition-opacity hover:opacity-90 cursor-pointer"
            style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {locale === 'nl' ? 'Nieuwe Boeking' : 'New Booking'}
          </Button>
        </div>
      </div>

      {/* Main Grid: Left Column (3 KPI Cards, Day Schedule, Line Graph, Reward Chips) + Right Column (Upcoming Appointments) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left Column (8 cols) */}
        <div className="xl:col-span-8 space-y-6">
          {/* 3 KPI Stat Cards matching GLOWBOARD reference! */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
            {/* KPI 1: Loyalty Points & VIP Tier */}
            <div
              className={cn(
                'rounded-2xl border p-4.5 sm:p-5 transition-all flex flex-col justify-between shadow-xs min-w-0',
                isDark
                  ? 'bg-[#181820] border-[#272733] text-white hover:border-[#38384a]'
                  : 'bg-white border-secondary-200 text-secondary-900 hover:border-secondary-300'
              )}
            >
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans text-secondary-900 dark:text-white whitespace-nowrap leading-none">
                  {customerPoints} <span className="text-base font-bold text-purple-600 dark:text-purple-400">Pts</span>
                </div>
                <span className={cn(
                  'text-[10px] font-black uppercase px-2 py-0.5 rounded-full border',
                  customerTier === 'gold'
                    ? 'bg-amber-500/20 text-amber-600 border-amber-500/40'
                    : 'bg-purple-500/20 text-purple-600 dark:text-purple-300 border-purple-500/40'
                )}>
                  {customerTier.toUpperCase()} VIP
                </span>
              </div>
              <div className="flex items-center justify-between gap-1.5 mt-auto min-w-0">
                <span className={cn('text-xs font-normal whitespace-nowrap truncate min-w-0', isDark ? 'text-[#8a8a9e]' : 'text-secondary-500')}>
                  {locale === 'nl' ? 'Loyalty Saldo' : 'Loyalty Balance'}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0',
                    isDark
                      ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                      : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                  )}
                >
                  ↑ +45 {locale === 'nl' ? 'deze mnd' : 'this mo'}
                </span>
              </div>
            </div>

            {/* KPI 2: Direct TeGoed & Voucher Value */}
            <div
              className={cn(
                'rounded-2xl border p-4.5 sm:p-5 transition-all flex flex-col justify-between shadow-xs min-w-0',
                isDark
                  ? 'bg-[#181820] border-[#272733] text-white hover:border-[#38384a]'
                  : 'bg-white border-secondary-200 text-secondary-900 hover:border-secondary-300'
              )}
            >
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans text-secondary-900 dark:text-white whitespace-nowrap leading-none mb-3 sm:mb-4">
                € {(customerPoints * 0.05).toFixed(2)}
              </div>
              <div className="flex items-center justify-between gap-1.5 mt-auto min-w-0">
                <span className={cn('text-xs font-normal whitespace-nowrap truncate min-w-0', isDark ? 'text-[#8a8a9e]' : 'text-secondary-500')}>
                  {locale === 'nl' ? 'Kortingswaarde' : 'Discount Credit'}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0',
                    isDark
                      ? 'text-purple-300 bg-purple-950/40 border border-purple-800/40'
                      : 'text-primary-700 bg-primary-50 border border-primary-200'
                  )}
                >
                  ✓ 10% {locale === 'nl' ? 'Sparen' : 'Earn'}
                </span>
              </div>
            </div>

            {/* KPI 3: Next Appointment & Policy Guarantee */}
            <div
              className={cn(
                'rounded-2xl border p-4.5 sm:p-5 transition-all flex flex-col justify-between shadow-xs min-w-0',
                isDark
                  ? 'bg-[#181820] border-[#272733] text-white hover:border-[#38384a]'
                  : 'bg-white border-secondary-200 text-secondary-900 hover:border-secondary-300'
              )}
            >
              <div className="text-2xl sm:text-3xl font-extrabold tracking-tight font-sans text-secondary-900 dark:text-white whitespace-nowrap leading-none mb-3 sm:mb-4">
                {customerBookingsCount} {locale === 'nl' ? 'Afspraken' : 'Bookings'}
              </div>
              <div className="flex items-center justify-between gap-1.5 mt-auto min-w-0">
                <span className={cn('text-xs font-normal whitespace-nowrap truncate min-w-0', isDark ? 'text-[#8a8a9e]' : 'text-secondary-500')}>
                  {locale === 'nl' ? 'Volgende: Vr 13 Nov' : 'Next: Fri Nov 13'}
                </span>
                <span
                  className={cn(
                    'inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded-md whitespace-nowrap shrink-0',
                    isDark
                      ? 'text-emerald-400 bg-emerald-950/40 border border-emerald-800/40'
                      : 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                  )}
                >
                  ✓ 24h {locale === 'nl' ? 'Garantie' : 'Policy'}
                </span>
              </div>
            </div>
          </div>

          {/* Section 1: Customer Spotlight - Next Scheduled Treatment & Quick Actions */}
          <div
            className={cn(
              'rounded-2xl border p-5 sm:p-6 transition-all shadow-xs space-y-4',
              isDark ? 'bg-[#181820] border-[#272733] text-white' : 'bg-white border-secondary-200 text-secondary-900'
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-secondary-100 dark:border-[#272733]">
              <div className="flex items-center gap-2.5">
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-xl text-white font-bold shadow-xs shrink-0"
                  style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
                >
                  <Calendar className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold">
                    {locale === 'nl' ? 'Mijn Eerstvolgende Afspraak' : 'My Next Scheduled Appointment'}
                  </h3>
                  <p className="text-xs text-secondary-500 dark:text-slate-400">
                    {locale === 'nl' ? 'Uw persoonlijke salonbehandeling en snelle acties' : 'Your personal salon treatment details and quick actions'}
                  </p>
                </div>
              </div>

              {nextBooking && (
                <span className="self-start sm:self-auto inline-flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {locale === 'nl' ? 'Bevestigd & Gereserveerd' : 'Confirmed & Scheduled'}
                </span>
              )}
            </div>

            {nextBooking ? (
              <div
                className={cn(
                  'p-4 sm:p-5 rounded-xl border flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 transition-all',
                  isDark
                    ? 'bg-[#1c1c2a] border-[#2d2d42] hover:border-purple-500/40'
                    : 'bg-secondary-50/70 border-secondary-200 hover:border-primary-300'
                )}
              >
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30">
                      {nextBooking.date || 'Vr 13 Nov 2026'}
                    </span>
                    <span className="text-xs font-medium text-secondary-500 dark:text-slate-400 flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-secondary-400" />
                      {nextBooking.start_time} - {nextBooking.end_time || '10:00'}
                    </span>
                  </div>

                  <h4 className="text-lg font-extrabold text-secondary-900 dark:text-white">
                    {nextBooking.service_name}
                  </h4>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-secondary-600 dark:text-slate-300 pt-0.5">
                    <span className="flex items-center gap-1 font-medium">
                      <User className="h-3.5 w-3.5 text-purple-500" />
                      {locale === 'nl' ? 'Specialist:' : 'Specialist:'}{' '}
                      <strong className="text-secondary-900 dark:text-white">
                        {nextBooking.staff_name || 'Sarah Jansen'}
                      </strong>
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      €{(nextBooking.price_eur || 45).toFixed(2)}
                    </span>
                    <span>•</span>
                    <span className="text-secondary-500 dark:text-slate-400">
                      {cfg.client} ({cfg.city})
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 self-stretch lg:self-auto justify-end pt-2 lg:pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDetails(nextBooking)}
                    className="text-xs font-semibold"
                  >
                    <Eye className="h-3.5 w-3.5 mr-1" />
                    {locale === 'nl' ? 'Bekijk Dossier' : 'View Details'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setBookingModalOpen(true)}
                    className="text-xs font-semibold"
                  >
                    <RotateCcw className="h-3.5 w-3.5 mr-1" />
                    {locale === 'nl' ? 'Verzetten' : 'Reschedule'}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => setBookingModalOpen(true)}
                    className="text-xs font-bold text-white shadow-xs"
                    style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
                  >
                    <Plus className="h-3.5 w-3.5 mr-1" />
                    {locale === 'nl' ? 'Extra Boeking' : 'Add Booking'}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center rounded-xl border border-dashed border-secondary-200 dark:border-[#2d2d3f] space-y-3">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400">
                  <Calendar className="h-6 w-6" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-secondary-900 dark:text-white">
                    {locale === 'nl' ? 'Geen actieve afspraken gepland' : 'No active appointments scheduled'}
                  </h4>
                  <p className="text-xs text-secondary-500 dark:text-slate-400 mt-0.5">
                    {locale === 'nl'
                      ? 'Plan direct een nieuwe salonbehandeling in bij uw favoriete specialist.'
                      : 'Schedule a new treatment directly with your favorite specialist.'}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setBookingModalOpen(true)}
                  className="text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  {locale === 'nl' ? 'Nu Afspraak Inplannen' : 'Book Appointment Now'}
                </Button>
              </div>
            )}

            {/* Satisfaction Guarantee & 24h Policy Banner */}
            <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
              <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>
                  {locale === 'nl'
                    ? '100% Tevredenheidsgarantie • Kosteloos annuleren tot 24 uur vooraf'
                    : '100% Satisfaction Guarantee • Free cancellation up to 24h prior'}
                </span>
              </div>
              <span className="text-[11px] text-secondary-400 dark:text-slate-400">
                {locale === 'nl' ? 'Directe salonbevestiging per e-mail & sms' : 'Instant email & SMS confirmation'}
              </span>
            </div>
          </div>

          {/* Section 2: Customer Reviews & Salon Experience Spotlight */}
          <div
            className={cn(
              'rounded-2xl border p-5 sm:p-6 transition-all shadow-xs space-y-4',
              isDark ? 'bg-[#181820] border-[#272733] text-white' : 'bg-white border-secondary-200 text-secondary-900'
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-secondary-100 dark:border-[#272733]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500 font-bold shrink-0 border border-amber-500/30">
                  <Star className="h-4 w-4 fill-amber-500" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                    <span>{locale === 'nl' ? 'Salon Beoordelingen & Ervaringen' : 'Salon Reviews & Satisfaction'}</span>
                    <span className="text-xs font-bold text-amber-500 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-500/30">
                      ★ 4.9 / 5.0
                    </span>
                  </h3>
                  <p className="text-xs text-secondary-500 dark:text-slate-400">
                    {locale === 'nl'
                      ? '128 geverifieerde salonbeoordelingen van tevreden klanten'
                      : '128 verified customer reviews from recent appointments'}
                  </p>
                </div>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setReviewModalOpen(true)}
                className="text-xs font-semibold self-start sm:self-auto"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1 text-purple-500" />
                {locale === 'nl' ? 'Review Schrijven' : 'Write Review'}
              </Button>
            </div>

            {/* Quick Review Snippets Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {submittedReviews.slice(0, 3).map((rev, idx) => (
                <div
                  key={idx}
                  className={cn(
                    'p-3.5 rounded-xl border flex flex-col justify-between space-y-2',
                    isDark ? 'bg-[#1e1e2d] border-[#2e2e42]' : 'bg-secondary-50/60 border-secondary-200'
                  )}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="font-bold text-xs text-secondary-900 dark:text-white">
                        {rev.name}
                      </span>
                      <div className="flex items-center text-amber-400 text-xs">
                        {Array.from({ length: rev.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-amber-400" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-secondary-600 dark:text-slate-300 line-clamp-3 leading-relaxed">
                      "{rev.text}"
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-secondary-400 pt-1 border-t border-secondary-100 dark:border-[#2b2b3d]">
                    <span className="text-emerald-600 dark:text-emerald-400 font-semibold">✓ Geverifieerd</span>
                    <span>{rev.date}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Customer Loyalty Points Spline Line Graph */}
          <SalesLineGraph
            isDark={isDark}
            title={locale === 'nl' ? 'Mijn Spaarpunten & Bezoekhistorie' : 'My Loyalty Points & Visit History'}
            growthBadge="+24.5% spaarsnelheid"
            data={customerLoyaltyData}
            maxY={600}
            gridLevels={[
              { label: '600 pts', yVal: 600 },
              { label: '450 pts', yVal: 450 },
              { label: '300 pts', yVal: 300 },
              { label: '150 pts', yVal: 150 },
              { label: '0 pts', yVal: 0 },
            ]}
          />

          {/* Quick Rewards Store Bar ("Direct Beloningen Inwisselen") */}
          <div
            className={cn(
              'rounded-2xl border p-5 sm:p-6 transition-colors',
              isDark
                ? 'bg-[#181820] border-[#272733] text-white'
                : 'bg-white border-secondary-200 text-secondary-900 shadow-xs'
            )}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-2">
                <Gift className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                <h3 className="text-base sm:text-lg font-bold">
                  {locale === 'nl' ? 'Spaarpunten Inwisselen voor Voordelen' : 'Redeem Points for Salon Perks'}
                </h3>
              </div>
              <span className="text-xs text-secondary-500 font-medium">
                {locale === 'nl' ? `Uw saldo: ${customerPoints} punten` : `Your balance: ${customerPoints} points`}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {loyaltyRewards.map((reward) => {
                const canAfford = customerPoints >= reward.points;
                const IconComponent = reward.icon;

                return (
                  <div
                    key={reward.id}
                    className={cn(
                      'p-3.5 rounded-xl border flex flex-col justify-between transition-all duration-150',
                      isDark
                        ? 'bg-[#1d1d28] border-[#2c2c3e] hover:border-purple-500/50'
                        : 'bg-secondary-50/70 border-secondary-200 hover:border-primary-300'
                    )}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span
                          className={cn(
                            'p-2 rounded-lg text-xs',
                            isDark ? 'bg-purple-900/30 text-purple-300' : 'bg-primary-100 text-primary-700'
                          )}
                        >
                          <IconComponent className="h-4 w-4" />
                        </span>
                        <span className="text-xs font-black font-mono text-purple-600 dark:text-purple-400">
                          {reward.points} pts
                        </span>
                      </div>
                      <h4 className="text-xs font-bold leading-tight line-clamp-1">
                        {locale === 'nl' ? reward.titleNl : reward.titleEn}
                      </h4>
                      <p className={cn('text-[11px] mt-1 line-clamp-2 leading-snug', isDark ? 'text-slate-400' : 'text-secondary-500')}>
                        {locale === 'nl' ? reward.descNl : reward.descEn}
                      </p>
                    </div>

                    <button
                      type="button"
                      disabled={!canAfford}
                      onClick={() => handleRedeemReward(reward)}
                      className={cn(
                        'mt-3 w-full py-1.5 px-2 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1',
                        canAfford
                          ? isDark
                            ? 'bg-[#7c3aed] hover:bg-[#6d28d9] text-white shadow-xs'
                            : 'bg-primary-600 hover:bg-primary-700 text-white shadow-xs'
                          : 'bg-secondary-200/60 dark:bg-slate-800 text-secondary-400 dark:text-slate-500 cursor-not-allowed'
                      )}
                    >
                      {canAfford ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          {locale === 'nl' ? '1-Klik Inwisselen' : 'Redeem Now'}
                        </>
                      ) : (
                        <span>
                          {locale === 'nl' ? `Nog ${reward.points - customerPoints} pts` : `Need ${reward.points - customerPoints} pts`}
                        </span>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column (4 cols): Customer Upcoming Appointments Panel */}
        <div className="xl:col-span-4 space-y-6">
          <UpcomingAppointmentsPanel
            store={store}
            isDark={isDark}
            customerMode={true}
            customerName={activeCustomer.name}
            customerBookings={customerBookings}
            onOpenBookingDetails={handleOpenDetails}
            onReschedule={() => setBookingModalOpen(true)}
            onOpenNewBooking={() => setBookingModalOpen(true)}
          />
        </div>
      </div>

      {/* Booking Modal in Customer Mode */}
      <NewBookingModal
        store={store}
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialClientId={activeCustomer.id}
        isCustomerMode={true}
      />

      {/* Appointment Dossier Details Dialog */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-lg dark:bg-[#181820] dark:border-[#272733] dark:text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg dark:text-white">
              <Eye className="h-5 w-5 text-purple-500" />
              <span>{locale === 'nl' ? 'Mijn Afspraak Details' : 'Appointment Details'}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedBookingDetails && (
            <div className="px-6 py-4 space-y-4 text-sm">
              <div className="p-4 rounded-xl bg-secondary-50 dark:bg-[#1e1e2b] border border-secondary-200 dark:border-[#2d2d3d] flex items-center justify-between">
                <div>
                  <h4 className="text-base font-bold text-secondary-900 dark:text-white">{selectedBookingDetails.service_name}</h4>
                  <p className="text-xs text-secondary-500 dark:text-slate-400">
                    {selectedBookingDetails.date} • {selectedBookingDetails.start_time} - {selectedBookingDetails.end_time || '10:30'}
                  </p>
                </div>
                <Badge variant="success">
                  {selectedBookingDetails.status || 'CONFIRMED'}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-secondary-200 dark:border-[#2d2d3d] bg-white dark:bg-[#1a1a26]">
                  <p className="text-secondary-500 dark:text-slate-400 uppercase font-semibold text-[11px]">{locale === 'nl' ? 'Specialist' : 'Specialist'}</p>
                  <p className="font-bold text-secondary-900 dark:text-white mt-1">{selectedBookingDetails.staff_name || 'Sarah Jansen'}</p>
                </div>
                <div className="p-3 rounded-lg border border-secondary-200 dark:border-[#2d2d3d] bg-white dark:bg-[#1a1a26]">
                  <p className="text-secondary-500 dark:text-slate-400 uppercase font-semibold text-[11px]">{locale === 'nl' ? 'Prijs' : 'Price'}</p>
                  <p className="font-bold text-secondary-900 dark:text-white mt-1">
                    {selectedBookingDetails.price_eur ? `€${selectedBookingDetails.price_eur}` : '€45.00'}
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 shrink-0" />
                <span>
                  {locale === 'nl'
                    ? '24-Uurs Annuleringsgarantie: U kunt deze afspraak tot 24 uur van tevoren kosteloos wijzigen of annuleren.'
                    : '24-Hour Policy: You can cancel or reschedule this appointment free of charge up to 24h prior.'}
                </span>
              </div>
            </div>
          )}
          <DialogFooter className="px-6 py-4 bg-secondary-50/80 dark:bg-[#14141c] border-t border-secondary-200 dark:border-[#272733] flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setDetailsModalOpen(false);
                setBookingModalOpen(true);
              }}
              className="text-xs"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1" />
              {locale === 'nl' ? 'Afspraak Verzetten' : 'Reschedule'}
            </Button>
            <Button
              variant="primary"
              size="sm"
              className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs"
              onClick={() => setDetailsModalOpen(false)}
            >
              {locale === 'nl' ? 'Sluiten' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Customer Review Dialog */}
      <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
        <DialogContent className="max-w-md dark:bg-[#181820] dark:border-[#272733] dark:text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg dark:text-white">
              <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
              <span>{locale === 'nl' ? 'Deel uw Salonervaring' : 'Share Your Experience'}</span>
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleReviewSubmit} className="space-y-4 px-6 py-2">
            <div>
              <label className="text-xs font-semibold text-secondary-700 dark:text-slate-300 block mb-1.5">
                {locale === 'nl' ? 'Uw Beoordeling' : 'Your Rating'}
              </label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setReviewRating(star)}
                    className="p-1 hover:scale-110 transition-transform cursor-pointer"
                  >
                    <Star
                      className={cn(
                        'h-6 w-6',
                        star <= reviewRating
                          ? 'text-amber-500 fill-amber-500'
                          : 'text-secondary-300 dark:text-slate-600'
                      )}
                    />
                  </button>
                ))}
                <span className="text-xs font-bold text-amber-500 ml-2">
                  {reviewRating} / 5 {reviewRating === 5 ? (locale === 'nl' ? '★ Uitstekend' : '★ Excellent') : '★'}
                </span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-secondary-700 dark:text-slate-300 block mb-1.5">
                {locale === 'nl' ? 'Uw Toelichting of Ervaring' : 'Your Review & Comments'}
              </label>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                rows={3}
                placeholder={
                  locale === 'nl'
                    ? 'Wat vond u van de behandeling, service en specialist?'
                    : 'How was the service, consultation, and specialist?'
                }
                className={cn(
                  'w-full text-xs rounded-xl border p-3 focus:outline-none focus:ring-2 focus:ring-purple-500/50 resize-none',
                  isDark
                    ? 'bg-[#1f1f2e] border-[#313146] text-white placeholder-slate-500'
                    : 'bg-white border-secondary-200 text-secondary-900 placeholder-secondary-400'
                )}
                required
              />
            </div>

            <DialogFooter className="pt-2 flex items-center justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setReviewModalOpen(false)}
                className="text-xs"
              >
                {locale === 'nl' ? 'Annuleren' : 'Cancel'}
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                className="bg-[#7c3aed] hover:bg-[#6d28d9] text-white text-xs font-bold"
              >
                <Send className="h-3.5 w-3.5 mr-1" />
                {locale === 'nl' ? 'Review Plaatsen' : 'Submit Review'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

