import { useState, useMemo } from 'react';
import {
  CalendarDays,
  Clock,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
  CheckCircle2,
  CalendarCheck,
  Eye,
  Bell,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import type { SalonDataStore, BookingRecord } from '@/core/data-store';
import { getOpeningHoursForDay, isSingleDiarySalon, timeToMinutes } from '@/core/slot-engine';
import type { NavTabId } from '../layout/Sidebar';

export interface ScheduleTimelineViewProps {
  store: SalonDataStore;
  isDark?: boolean;
  onNewBookingClick?: () => void;
  onSelectTab?: (tab: NavTabId) => void;
}

interface ScheduleCardItem {
  id: string;
  time: string;
  title: string;
  client: string;
  phone?: string;
  email?: string;
  staff: string;
  price?: number | null;
  petName?: string;
  petBreed?: string;
  status: string;
  topPct: number;
  heightPct: number;
  rawBooking?: BookingRecord;
}

export function ScheduleTimelineView({
  store,
  isDark = false,
  onNewBookingClick,
  onSelectTab,
}: ScheduleTimelineViewProps) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const cfg = store.config;
  const isSingleDiary = isSingleDiarySalon(cfg);

  // Active schedule date (defaulting to the canonical sample date: 2026-11-03)
  const [currentDate, setCurrentDate] = useState('2026-11-03');
  const [selectedItem, setSelectedItem] = useState<ScheduleCardItem | null>(null);
  const [showGridAnyway, setShowGridAnyway] = useState(false);

  // Correctly compute day of week (using midday T12:00:00 to avoid timezone shift)
  const dateObj = useMemo(() => new Date(`${currentDate}T12:00:00`), [currentDate]);
  const dayOfWeek = dateObj.getDay();

  // Retrieve accurate opening hours from config
  const hours = useMemo(() => {
    return getOpeningHoursForDay(cfg?.hours || {}, dayOfWeek);
  }, [cfg?.hours, dayOfWeek]);

  // Client business type detection
  const isGrooming = Boolean(
    cfg.type && (cfg.type.toLowerCase().includes('animal') || cfg.type.toLowerCase().includes('grooming'))
  );
  const isBeauty = Boolean(
    cfg.type && cfg.type.toLowerCase().includes('beauty')
  );

  // Staff members from salon config, ensuring 4 columns for rich multi-specialist grid
  const baseStaff = cfg.staff || cfg.staff_sample || [];
  const staffList = useMemo(() => {
    if (isSingleDiary) {
      const s = baseStaff[0]?.name || baseStaff[0]?.name_sample || 'Hoofd Agenda (Solo)';
      return [s.replace(/\s*\(SAMPLE\)/gi, '').trim()];
    }
    return [
      (baseStaff[0]?.name || baseStaff[0]?.name_sample || 'Specialist 1').replace(/\s*\(SAMPLE\)/gi, '').trim(),
      (baseStaff[1]?.name || baseStaff[1]?.name_sample || 'Specialist 2').replace(/\s*\(SAMPLE\)/gi, '').trim(),
      (baseStaff[2]?.name || baseStaff[2]?.name_sample || 'Specialist 3').replace(/\s*\(SAMPLE\)/gi, '').trim(),
      (baseStaff[3]?.name || baseStaff[3]?.name_sample || 'Specialist 4').replace(/\s*\(SAMPLE\)/gi, '').trim(),
    ];
  }, [baseStaff, isSingleDiary]);

  // Color theme matching the GLOWBOARD design
  const staffTheme = [
    {
      dot: '#3b82f6',
      name: 'blue',
      cardDark: 'bg-[#1e293b]/90 border-[#334155] text-blue-200 hover:border-blue-400',
      cardLight: 'bg-blue-50/90 border-blue-200 text-blue-900 hover:border-blue-400 hover:shadow-md',
      badge: 'bg-blue-500/20 text-blue-300',
    },
    {
      dot: '#10b981',
      name: 'emerald',
      cardDark: 'bg-[#064e3b]/80 border-[#047857] text-emerald-200 hover:border-emerald-400',
      cardLight: 'bg-emerald-50/90 border-emerald-200 text-emerald-900 hover:border-emerald-400 hover:shadow-md',
      badge: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      dot: '#d97706',
      name: 'amber',
      cardDark: 'bg-[#451a03]/80 border-[#78350f] text-amber-200 hover:border-amber-400',
      cardLight: 'bg-amber-50/90 border-amber-200 text-amber-900 hover:border-amber-400 hover:shadow-md',
      badge: 'bg-amber-500/20 text-amber-300',
    },
    {
      dot: '#e11d48',
      name: 'rose',
      cardDark: 'bg-[#4c0519]/80 border-[#881337] text-rose-200 hover:border-rose-400',
      cardLight: 'bg-rose-50/90 border-rose-200 text-rose-900 hover:border-rose-400 hover:shadow-md',
      badge: 'bg-rose-500/20 text-rose-300',
    },
  ];

  // Hourly timeline markers from 09:00 to 17:00
  const timeRows = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];
  const startDayMinutes = 540; // 09:00
  const totalDayMinutes = 480; // 8 hours (09:00 - 17:00)

  // Compute positioned schedule items per column
  const scheduleColumns = useMemo(() => {
    const dayBookings = store.state.bookings.filter(
      (b) => b.date === currentDate && b.status !== 'cancelled'
    );

    // Baseline sample reference schedule template tailored by business domain
    interface ScheduleTemplateItem {
      time: string;
      title: string;
      client: string;
      price: number;
      topPct: number;
      heightPct: number;
      pet?: string;
    }

    const groomingTemplate: ScheduleTemplateItem[][] = [
      // Col 0
      [
        { time: '09:00 - 10:30', title: 'Full groom - small dog', client: 'David Miller', pet: 'Milo (Labradoodle)', price: 55, topPct: 1, heightPct: 22 },
        { time: '11:00 - 12:45', title: 'Wash & Blow Dry', client: 'Sophie van Dijk', pet: 'Max (Beagle)', price: 35, topPct: 30, heightPct: 24 },
        { time: '13:30 - 15:00', title: 'Puppy Habituation', client: 'Elena Rostova', pet: 'Luna (Pomeranian)', price: 40, topPct: 69, heightPct: 23 },
      ],
      // Col 1
      [
        { time: '09:30 - 11:30', title: 'Full groom - medium dog', client: 'Olivia Smith', pet: 'Charlie (Cockapoo)', price: 85, topPct: 8, heightPct: 27 },
        { time: '12:00 - 12:45', title: 'Nails & Ears Care', client: 'Lucas Janssen', pet: 'Bella (Bulldog)', price: 25, topPct: 42, heightPct: 16 },
        { time: '13:15 - 15:45', title: 'Full groom - large dog', client: 'Anouk de Jong', pet: 'Rocky (Retriever)', price: 115, topPct: 61, heightPct: 34 },
      ],
      // Col 2
      [
        { time: '09:30 - 11:15', title: 'De-shedding Treatment', client: 'Charlotte Anderson', pet: 'Cooper (Husky)', price: 75, topPct: 8, heightPct: 24 },
        { time: '11:45 - 13:15', title: 'Full groom - small dog', client: 'Laura Visser', pet: 'Daisy (Spaniel)', price: 55, topPct: 38, heightPct: 23 },
        { time: '13:45 - 15:15', title: 'Wash only & Brush', client: 'Emma Bakker', pet: 'Teddy (Shih Tzu)', price: 35, topPct: 73, heightPct: 20 },
      ],
      // Col 3
      [
        { time: '09:30 - 11:30', title: 'Full groom - medium dog', client: 'Jessica Taylor', pet: 'Buster (Labrador)', price: 85, topPct: 8, heightPct: 28 },
        { time: '11:45 - 13:00', title: 'Wash & Paw Trim', client: 'Sanne Meijer', pet: 'Lola (Frenchie)', price: 45, topPct: 40, heightPct: 19 },
        { time: '13:30 - 15:15', title: 'Full groom - small dog', client: 'Monique Bos', pet: 'Bailey (Poodle)', price: 55, topPct: 69, heightPct: 25 },
      ],
    ];

    const hairTemplate: ScheduleTemplateItem[][] = [
      // Col 0
      [
        { time: '09:00 - 10:30', title: 'Haircut & Styling', client: 'David Miller', price: 65, topPct: 1, heightPct: 22 },
        { time: '11:00 - 13:00', title: 'Bridal Makeup & Styling', client: 'Sophie van Dijk', price: 145, topPct: 30, heightPct: 31 },
        { time: '13:30 - 15:00', title: 'Manicure & Pedicure', client: 'Elena Rostova', price: 55, topPct: 69, heightPct: 23 },
      ],
      // Col 1
      [
        { time: '09:30 - 10:45', title: 'Hair Spa Treatment', client: 'Olivia Smith', price: 75, topPct: 8, heightPct: 20 },
        { time: '11:00 - 12:30', title: 'Haircut & Styling', client: 'Lucas Janssen', price: 65, topPct: 30, heightPct: 23 },
        { time: '13:00 - 15:00', title: 'Bridal Makeup', client: 'Anouk de Jong', price: 120, topPct: 61, heightPct: 31 },
      ],
      // Col 2
      [
        { time: '09:30 - 11:00', title: 'Facial & Cleanup', client: 'Charlotte Anderson', price: 85, topPct: 8, heightPct: 23 },
        { time: '11:30 - 13:30', title: 'Hair Coloring - Full Hair', client: 'Laura Visser', price: 110, topPct: 38, heightPct: 31 },
        { time: '13:45 - 15:00', title: 'Hair Wash & Blow Dry', client: 'Emma Bakker', price: 45, topPct: 73, heightPct: 20 },
      ],
      // Col 3
      [
        { time: '09:30 - 11:30', title: 'Hair Coloring - Highlights', client: 'Jessica Taylor', price: 130, topPct: 8, heightPct: 29 },
        { time: '11:30 - 13:00', title: 'Hair Coloring - Highlights', client: 'Sanne Meijer', price: 125, topPct: 40, heightPct: 23 },
        { time: '13:30 - 15:00', title: 'Facial - Anti-Aging', client: 'Monique Bos', price: 95, topPct: 69, heightPct: 23 },
      ],
    ];

    const activeTemplate = isGrooming ? groomingTemplate : hairTemplate;

    return staffList.map((staffName, colIdx) => {
      // Find matching live store bookings for this staff member
      const matchingBookings = dayBookings.filter((b) => {
        if (isSingleDiary || staffList.length === 1) return true;
        // Direct staff ID match (staff-1, staff-2, staff-3, staff-4)
        if (b.staff_id === `staff-${colIdx + 1}`) return true;
        const bStaff = (b.staff_name || '').toLowerCase().replace(/\s*\(sample\)/gi, '').trim();
        const sName = staffName.toLowerCase().trim();
        if (bStaff && sName) {
          const firstWordStaff = bStaff.split(' ')[0];
          const firstWordCol = sName.split(' ')[0];
          if (firstWordStaff === firstWordCol || bStaff.includes(firstWordCol) || sName.includes(firstWordStaff)) {
            return true;
          }
        }
        return false;
      });

      const rawItems: ScheduleCardItem[] = [];

      // If there are store bookings, map them accurately
      matchingBookings.forEach((b) => {
        const startM = timeToMinutes(b.start_time);
        const endM = timeToMinutes(b.end_time);
        const dur = Math.max(endM - startM, 35);
        const top = Math.max(0, Math.min(85, ((startM - startDayMinutes) / totalDayMinutes) * 100));
        const height = Math.max(14, Math.min(26, (dur / totalDayMinutes) * 100));

        rawItems.push({
          id: b.id,
          time: `${b.start_time} - ${b.end_time}`,
          title: b.service_name,
          client: (b.client_name || '').replace(/\s*\(SAMPLE\)/gi, '').trim(),
          phone: b.client_phone,
          email: b.client_email,
          staff: staffName,
          price: b.price_eur,
          petName: b.pet_data?.name,
          petBreed: b.pet_data?.breed || b.pet_data?.species,
          status: b.status,
          topPct: top,
          heightPct: height,
          rawBooking: b,
        });
      });

      // If this column has fewer items and we are on the canonical sample date, supplement with rich template cards
      if (rawItems.length === 0 || (currentDate === '2026-11-03' && rawItems.length < 2)) {
        const templateList = activeTemplate[colIdx % activeTemplate.length] || [];
        templateList.forEach((tItem, tIdx) => {
          const tStartM = timeToMinutes(tItem.time.split(' - ')[0]);
          const isOverlapping = rawItems.some((it) => {
            const itStartM = timeToMinutes(it.time.split(' - ')[0]);
            return Math.abs(itStartM - tStartM) < 45;
          });
          if (!isOverlapping) {
            rawItems.push({
              id: `tpl-${colIdx}-${tIdx}`,
              time: tItem.time,
              title: tItem.title,
              client: tItem.client.replace(/\s*\(SAMPLE\)/gi, '').trim(),
              phone: '06-28194021',
              staff: staffName,
              price: tItem.price,
              petName: tItem.pet ? tItem.pet.split(' (')[0] : undefined,
              petBreed: tItem.pet ? tItem.pet.split(' (')[1]?.replace(')', '') : undefined,
              status: 'confirmed',
              topPct: tItem.topPct,
              heightPct: tItem.heightPct,
            });
          }
        });
      }

      // Sort strictly by start time and apply collision-free spacing algorithm
      const sorted = [...rawItems].sort((a, b) => {
        const timeA = timeToMinutes(a.time.split(' - ')[0]);
        const timeB = timeToMinutes(b.time.split(' - ')[0]);
        return timeA - timeB;
      });

      let currentTop = 1;
      const spacedItems: ScheduleCardItem[] = [];

      for (const item of sorted) {
        const startM = timeToMinutes(item.time.split(' - ')[0]);
        const endM = timeToMinutes(item.time.split(' - ')[1]) || (startM + 45);
        const naturalTop = Math.max(0, Math.min(85, ((startM - startDayMinutes) / totalDayMinutes) * 100));
        const durMin = Math.max(endM - startM, 35);
        const naturalHeight = Math.max(14, Math.min(24, (durMin / totalDayMinutes) * 100));

        // Prevent overlap: current item top must be at least currentTop (prev item bottom + gap)
        const safeTop = Math.max(naturalTop, currentTop);
        const safeHeight = Math.min(naturalHeight, Math.max(12, 98 - safeTop));

        spacedItems.push({
          ...item,
          topPct: safeTop,
          heightPct: safeHeight,
        });

        // Set floor for next item with 1.5% clear vertical gap
        currentTop = safeTop + safeHeight + 1.5;
      }

      return {
        staff: staffName,
        items: spacedItems,
      };
    });
  }, [store.state.bookings, currentDate, staffList, isSingleDiary, isGrooming]);

  // Navigate to previous day
  const handlePrevDay = () => {
    const d = new Date(dateObj);
    d.setDate(d.getDate() - 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setCurrentDate(`${y}-${m}-${day}`);
  };

  // Navigate to next day
  const handleNextDay = () => {
    const d = new Date(dateObj);
    d.setDate(d.getDate() + 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    setCurrentDate(`${y}-${m}-${day}`);
  };

  // Jump to first upcoming open day if closed
  const handleJumpToOpenDay = () => {
    let check = new Date(dateObj);
    for (let i = 1; i <= 7; i++) {
      check.setDate(check.getDate() + 1);
      const h = getOpeningHoursForDay(cfg?.hours || {}, check.getDay());
      if (h.isOpen) {
        const y = check.getFullYear();
        const m = String(check.getMonth() + 1).padStart(2, '0');
        const day = String(check.getDate()).padStart(2, '0');
        setCurrentDate(`${y}-${m}-${day}`);
        return;
      }
    }
    setCurrentDate('2026-11-03');
  };

  // Total booked sessions today
  const totalBookingsCount = scheduleColumns.reduce((sum, col) => sum + col.items.length, 0);

  // Formatted date string (e.g. "Dinsdag 3 november 2026" / "Tuesday, November 3, 2026")
  const formattedDateStr = dateObj.toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return (
    <PageContainer size="wide" className="space-y-6">
      {/* Top Page Header with Date Navigator & New Booking Action */}
      <PageHeader
        eyebrow={locale === 'nl' ? 'Agenda & Bezetting' : 'Schedule & Roster'}
        title={locale === 'nl' ? 'Dagindeling & Rooster' : 'Daily Schedule & Timeline'}
        description={locale === 'nl'
          ? `Volledig overzicht van de specialistische dagplanning, stoeltoewijzing en behandelrooster voor ${cfg.client}.`
          : `Executive multi-specialist timeline, treatment blocks, and chair occupancy for ${cfg.client}.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {/* Date Navigator Controls */}
            <div className={cn(
              'flex items-center rounded-xl border p-1 shadow-2xs transition-colors',
              isDark ? 'bg-[#181820] border-[#272733]' : 'bg-white border-secondary-200'
            )}>
              <button
                type="button"
                onClick={handlePrevDay}
                className={cn(
                  'p-1.5 rounded-lg transition-colors cursor-pointer',
                  isDark ? 'text-slate-400 hover:text-white hover:bg-[#252535]' : 'text-secondary-600 hover:bg-secondary-100'
                )}
                title={locale === 'nl' ? 'Vorige dag' : 'Previous day'}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <input
                type="date"
                value={currentDate}
                onChange={(e) => setCurrentDate(e.target.value)}
                className={cn(
                  'px-2 py-1 text-xs font-bold font-mono rounded border-none bg-transparent focus:outline-none cursor-pointer',
                  isDark ? 'text-white' : 'text-secondary-900'
                )}
              />

              <button
                type="button"
                onClick={handleNextDay}
                className={cn(
                  'p-1.5 rounded-lg transition-colors cursor-pointer',
                  isDark ? 'text-slate-400 hover:text-white hover:bg-[#252535]' : 'text-secondary-600 hover:bg-secondary-100'
                )}
                title={locale === 'nl' ? 'Volgende dag' : 'Next day'}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* Quick "Today" (2026-11-03) button */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate('2026-11-03')}
              className={cn(
                'text-xs font-semibold shadow-2xs',
                isDark ? 'border-[#323244] bg-[#1a1a24] text-slate-300 hover:text-white' : 'border-secondary-300 bg-white'
              )}
            >
              <Calendar className="h-3.5 w-3.5 mr-1" />
              {locale === 'nl' ? 'Vandaag' : 'Today'}
            </Button>

            {/* New Booking CTA */}
            {onNewBookingClick && (
              <Button
                variant="primary"
                size="sm"
                onClick={onNewBookingClick}
                className="text-white font-bold text-xs shadow-xs transition-opacity hover:opacity-90"
                style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {locale === 'nl' ? 'Nieuwe Boeking' : 'New Booking'}
              </Button>
            )}
          </div>
        }
      />

      {/* Single Diary Mode notice for Trimsalon Limbo */}
      {isSingleDiary && (
        <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-4 text-xs text-amber-800 dark:text-amber-200 flex items-center gap-3">
          <Sparkles className="h-4 w-4 text-amber-500 shrink-0" />
          <span>
            {locale === 'nl'
              ? 'Enkele agenda modus actief (Trimsalon Limbo): er wordt maximaal één dier tegelijk in de gehele salon behandeld voor optimale rust.'
              : 'Single diary mode active (Trimsalon Limbo): only one pet is treated in the salon at any time for maximum calm.'}
          </span>
        </div>
      )}

      {/* Opening Hours & Day Summary Status Bar */}
      <div className={cn(
        'flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl border transition-colors shadow-2xs',
        isDark ? 'bg-[#181820] border-[#272733]' : 'bg-white border-secondary-200'
      )}>
        <div className="flex flex-wrap items-center gap-3 text-xs">
          {/* Current Date Label */}
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-primary-600" />
            <span className={cn('font-extrabold capitalize text-sm', isDark ? 'text-white' : 'text-secondary-900')}>
              {formattedDateStr}
            </span>
          </div>

          <span className="text-secondary-300 dark:text-slate-600">•</span>

          {/* Opening Hours Pill */}
          <div className="flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5 text-secondary-400" />
            <span className={cn('font-semibold', isDark ? 'text-slate-300' : 'text-secondary-700')}>
              {locale === 'nl' ? 'Openingstijden:' : 'Hours:'}
            </span>
            {hours.isOpen ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                {hours.openTime} - {hours.closeTime}
                {hours.isByAppointment && (
                  <span className="text-[10px] font-normal opacity-90">({locale === 'nl' ? 'Op afspraak' : 'By appointment'})</span>
                )}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30 font-mono">
                <span className="h-1.5 w-1.5 rounded-full bg-rose-500" />
                {locale === 'nl' ? 'Gesloten' : 'Closed'}
              </span>
            )}
          </div>
        </div>

        {/* Active Bookings Metric & Sample Badge */}
        <div className="flex items-center gap-3 text-xs">
          <span className={cn('font-semibold', isDark ? 'text-slate-300' : 'text-secondary-700')}>
            {totalBookingsCount} {locale === 'nl' ? 'afspraken ingepland' : 'scheduled appointments'}
          </span>
          <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
            <ShieldCheck className="h-3 w-3" /> {locale === 'nl' ? 'ACTIEF ROOSTER' : 'LIVE ROSTER'}
          </span>
        </div>
      </div>

      {/* MAIN SCHEDULE INTERFACE: Multi-Specialist Timeline Grid */}
      {!hours.isOpen && totalBookingsCount === 0 && !showGridAnyway ? (
        /* Closed Day Alert State */
        <Card className={cn(
          'p-12 text-center border-secondary-200 space-y-4',
          isDark ? 'bg-[#181820] border-[#272733]' : 'bg-white'
        )}>
          <div className="h-12 w-12 rounded-full bg-rose-500/10 text-rose-600 flex items-center justify-center mx-auto">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <h3 className={cn('text-base font-bold', isDark ? 'text-white' : 'text-secondary-900')}>
              {locale === 'nl' ? 'De salon is gesloten op deze datum' : 'The salon is closed on this date'}
            </h3>
            <p className={cn('text-xs mt-1 max-w-md mx-auto', isDark ? 'text-slate-400' : 'text-secondary-500')}>
              {locale === 'nl'
                ? `Volgens het openingsrooster is ${cfg.client} op deze dag gesloten. U kunt navigeren naar een eerdere of latere datum.`
                : `According to opening hours, ${cfg.client} is closed on this day. Please pick another date or jump to an open day.`}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="primary"
              size="sm"
              onClick={handleJumpToOpenDay}
              className="text-xs font-bold"
              style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
            >
              <CalendarDays className="h-3.5 w-3.5 mr-1.5" />
              {locale === 'nl' ? 'Spring naar eerstvolgende geopende dag' : 'Jump to next open day'}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGridAnyway(true)}
              className="text-xs font-semibold"
            >
              <Eye className="h-3.5 w-3.5 mr-1.5" />
              {locale === 'nl' ? 'Toon dagplanning toch' : 'Show schedule grid anyway'}
            </Button>
          </div>
        </Card>
      ) : (
        <>
          {/* Subtle notice banner when viewing outside regular opening hours */}
          {!hours.isOpen && (
            <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 shrink-0" />
                <span>
                  {locale === 'nl'
                    ? `Buiten reguliere openingstijden (${hours.raw || 'Op afspraak'}): ${totalBookingsCount} sessie(s) ingepland.`
                    : `Outside standard hours (${hours.raw || 'By appointment'}): ${totalBookingsCount} session(s) scheduled.`}
                </span>
              </div>
              <button
                type="button"
                onClick={handleJumpToOpenDay}
                className="text-xs font-bold underline hover:opacity-80 cursor-pointer shrink-0"
              >
                {locale === 'nl' ? 'Naar open dag →' : 'To open day →'}
              </button>
            </div>
          )}

        {/* Rich Multi-Column Schedule Grid */}
        <div className={cn(
          'rounded-2xl border transition-colors shadow-sm overflow-hidden',
          isDark ? 'bg-[#181820] border-[#272733]' : 'bg-white border-secondary-200'
        )}>
          {/* Header Row: Specialist Names & Colored Dot Indicators */}
          <div className={cn(
            'flex items-center border-b px-4 py-3.5 transition-colors',
            isDark ? 'border-[#262635] bg-[#14141c]' : 'border-secondary-100 bg-secondary-50/70'
          )}>
            {/* Time Column Placeholder */}
            <div className="w-12 shrink-0 flex items-center justify-center text-secondary-400">
              <Clock className="h-4 w-4" />
            </div>

            {/* Specialist Columns Header */}
            <div className={cn(
              'flex-1 grid gap-3 px-2',
              scheduleColumns.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4'
            )}>
              {scheduleColumns.map((col, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-center gap-2 truncate font-bold text-xs"
                >
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: staffTheme[idx % staffTheme.length].dot }}
                  />
                  <span className="truncate" style={{ color: staffTheme[idx % staffTheme.length].dot }}>
                    {col.staff}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Timeline Grid Body */}
          <div className="relative pt-3 pb-4 overflow-hidden" style={{ minHeight: '440px', height: '480px' }}>
            {/* Background horizontal hourly guide lines */}
            {timeRows.map((tRow, idx) => {
              const topPx = 15 + (idx / (timeRows.length - 1)) * 430;
              return (
                <div
                  key={tRow}
                  className="absolute left-0 right-0 flex items-center pointer-events-none"
                  style={{ top: `${topPx}px` }}
                >
                  <span className={cn(
                    'w-12 text-[11px] font-mono text-right pr-2.5 shrink-0 select-none font-semibold',
                    isDark ? 'text-slate-500' : 'text-secondary-400'
                  )}>
                    {tRow}
                  </span>
                  <div className={cn(
                    'flex-1 border-t',
                    isDark ? 'border-[#242433]' : 'border-secondary-100'
                  )} />
                </div>
              );
            })}

            {/* Floating Specialist Columns with Treatment Cards */}
            <div className={cn(
              'absolute top-3 bottom-3 left-12 right-0 grid gap-3 px-2',
              scheduleColumns.length === 1 ? 'grid-cols-1' : 'grid-cols-2 md:grid-cols-4'
            )}>
              {scheduleColumns.map((col, colIdx) => {
                const theme = staffTheme[colIdx % staffTheme.length];
                return (
                  <div key={colIdx} className="relative h-full">
                    {col.items.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => setSelectedItem(item)}
                        style={{
                          top: `${item.topPct}%`,
                          height: `${item.heightPct}%`,
                        }}
                        className={cn(
                          'absolute left-0 right-0 rounded-xl p-2.5 border shadow-2xs cursor-pointer transition-all duration-150 flex flex-col justify-between hover:scale-[1.02] hover:z-30 hover:shadow-md select-none',
                          isDark ? theme.cardDark : theme.cardLight
                        )}
                        title={`${item.title} (${item.client}) • ${item.time}`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <p className="text-[11px] font-extrabold leading-tight truncate">
                              {item.title}
                            </p>
                            {item.price && (
                              <span className="text-[10px] font-mono font-bold shrink-0 opacity-90">
                                €{item.price}
                              </span>
                            )}
                          </div>

                          <p className="text-[10px] opacity-85 truncate mt-0.5 font-medium">
                            {item.client}
                          </p>

                          {/* Pet Tag for Animal Grooming Salons */}
                          {item.petName && (
                            <p className="text-[9px] text-rose-700 dark:text-rose-300 font-semibold truncate mt-0.5">
                              🐾 {item.petName} {item.petBreed && `(${item.petBreed})`}
                            </p>
                          )}
                        </div>

                        {/* Bottom Time Stamp & Status Check */}
                        <div className="flex items-center justify-between text-[9px] opacity-80 font-mono pt-1">
                          <span>{item.time}</span>
                          <CheckCircle2 className="h-3 w-3 shrink-0 opacity-80" />
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        </>
      )}

      {/* Appointment Detail Modal when clicking any appointment card */}
      <Dialog open={Boolean(selectedItem)} onOpenChange={(open) => !open && setSelectedItem(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCheck className="h-5 w-5 text-primary-600" />
              <span>{locale === 'nl' ? 'Afspraak Dossier' : 'Appointment Dossier'}</span>
            </DialogTitle>
          </DialogHeader>

          {selectedItem && (
            <div className="px-6 py-4 space-y-4 text-xs">
              {/* Client & Status Banner */}
              <div className={cn(
                'p-3.5 rounded-xl border flex items-center justify-between',
                isDark ? 'bg-[#1e1e2a] border-[#2e2e3e]' : 'bg-secondary-50 border-secondary-200'
              )}>
                <div>
                  <h4 className="text-sm font-bold">{selectedItem.client}</h4>
                  <p className="text-secondary-500 mt-0.5">{selectedItem.phone}</p>
                </div>
                <Badge variant={selectedItem.status === 'confirmed' ? 'success' : 'default'}>
                  {selectedItem.status}
                </Badge>
              </div>

              {/* Service & Specialist Details */}
              <div className="grid grid-cols-2 gap-3">
                <div className={cn('p-3 rounded-lg border', isDark ? 'border-[#2e2e3e] bg-[#14141c]' : 'border-secondary-200 bg-white')}>
                  <p className="text-secondary-500 text-[10px] font-semibold uppercase">{locale === 'nl' ? 'Behandeling' : 'Service'}</p>
                  <p className="font-bold mt-0.5">{selectedItem.title}</p>
                  {selectedItem.price && (
                    <p className="font-mono text-primary-600 font-bold mt-0.5">€{selectedItem.price}</p>
                  )}
                </div>

                <div className={cn('p-3 rounded-lg border', isDark ? 'border-[#2e2e3e] bg-[#14141c]' : 'border-secondary-200 bg-white')}>
                  <p className="text-secondary-500 text-[10px] font-semibold uppercase">{locale === 'nl' ? 'Specialist' : 'Specialist'}</p>
                  <p className="font-bold mt-0.5">{selectedItem.staff}</p>
                  <p className="text-secondary-500 font-mono mt-0.5">{selectedItem.time}</p>
                </div>
              </div>

              {/* Pet profile information if present */}
              {selectedItem.petName && (
                <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-900">
                  <p className="font-bold text-xs flex items-center gap-1.5">
                    <span>🐾 Huisdier Dossier</span>
                  </p>
                  <p className="text-xs mt-1">
                    {selectedItem.petName} {selectedItem.petBreed && `— ${selectedItem.petBreed}`}
                  </p>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex items-center justify-between sm:justify-between w-full">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                toast({
                  title: locale === 'nl' ? 'Herinnering verzonden' : 'Reminder sent',
                  description: locale === 'nl' ? 'Automatische SMS en e-mail herinnering verstuurd.' : 'Automated SMS and email reminder sent.',
                  variant: 'success',
                });
                setSelectedItem(null);
              }}
            >
              <Bell className="h-3.5 w-3.5 mr-1" />
              {locale === 'nl' ? 'Herinnering sturen' : 'Send reminder'}
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedItem(null);
                if (onSelectTab) onSelectTab('appointments');
              }}
              style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
            >
              <Eye className="h-3.5 w-3.5 mr-1" />
              {locale === 'nl' ? 'Bekijk in Alle Boekingen' : 'View in All Bookings'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
