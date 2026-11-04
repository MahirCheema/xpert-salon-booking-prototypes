import { useState, useMemo } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/Dialog';
import { ChevronDown, MoreVertical, Bell, CalendarClock, CheckCircle2, UserX, Trash2, Eye, Sparkles, FileText, Plus, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from '@/components/ui/Dropdown';
import type { SalonDataStore, BookingRecord } from '@/core/data-store';

export interface UpcomingAppointmentsPanelProps {
  store: SalonDataStore;
  onOpenBookingDetails?: (booking: Partial<BookingRecord>) => void;
  onReschedule?: (booking: Partial<BookingRecord>) => void;
  isDark?: boolean;
  className?: string;
  customerMode?: boolean;
  customerName?: string;
  customerBookings?: BookingRecord[];
  onOpenNewBooking?: () => void;
}

export interface UpcomingDisplayItem {
  id: string;
  name: string;
  service: string;
  time: string;
  price: string;
  avatar?: string;
  phone: string;
  status: string;
}

function AppointmentAvatar({
  name,
  avatar,
  status,
  isDark,
}: {
  name: string;
  avatar?: string;
  status?: string;
  isDark?: boolean;
}) {
  const [hasError, setHasError] = useState(false);

  const initials = useMemo(() => {
    if (!name) return '??';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  const gradientClass = useMemo(() => {
    const gradients = [
      'from-purple-600 to-indigo-600',
      'from-pink-600 to-rose-600',
      'from-emerald-600 to-teal-700',
      'from-amber-500 to-orange-600',
      'from-sky-500 to-blue-600',
      'from-violet-600 to-fuchsia-600',
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return gradients[Math.abs(hash) % gradients.length];
  }, [name]);

  const statusColor =
    status === 'completed'
      ? 'bg-blue-500'
      : status === 'cancelled'
      ? 'bg-rose-500'
      : status === 'pending'
      ? 'bg-amber-500'
      : 'bg-emerald-500';

  return (
    <div className="relative shrink-0">
      {avatar && !hasError ? (
        <img
          src={avatar}
          alt={name}
          onError={() => setHasError(true)}
          className="h-11 w-11 rounded-full object-cover shrink-0 border border-purple-500/30 shadow-xs bg-secondary-100 dark:bg-slate-900"
        />
      ) : (
        <div
          className={cn(
            'h-11 w-11 rounded-full flex items-center justify-center font-bold text-xs tracking-wider text-white shadow-xs border border-purple-500/30 bg-linear-to-tr select-none',
            gradientClass
          )}
        >
          {initials}
        </div>
      )}
      <span
        className={cn(
          'absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2',
          isDark ? 'ring-[#1d1d27]' : 'ring-white',
          statusColor
        )}
        title={status || 'confirmed'}
      />
    </div>
  );
}

export function UpcomingAppointmentsPanel({
  store,
  onOpenBookingDetails,
  onReschedule,
  isDark = false,
  className,
  customerMode = false,
  customerName = 'Sample Klant A',
  customerBookings,
  onOpenNewBooking,
}: UpcomingAppointmentsPanelProps) {
  const { locale, t } = useI18n();
  const { toast } = useToast();
  const confirm = useConfirm();

  const [selectedMonth, setSelectedMonth] = useState('November');
  const [activeDateIndex, setActiveDateIndex] = useState(4); // Friday 13 active by default as in reference!

  // Weekday date strip as in reference image: MON 09, TUE 10, WED 11, THU 12, FRI 13 (active), SAT 14, SUN 15
  const weekDays = [
    { dayEn: 'MON', dayNl: 'MA', date: '09' },
    { dayEn: 'TUE', dayNl: 'DI', date: '10' },
    { dayEn: 'WED', dayNl: 'WO', date: '11' },
    { dayEn: 'THU', dayNl: 'DO', date: '12' },
    { dayEn: 'FRI', dayNl: 'VR', date: '13' }, // Active purple pill
    { dayEn: 'SAT', dayNl: 'ZA', date: '14' },
    { dayEn: 'SUN', dayNl: 'ZO', date: '15' },
  ];

  // Customer specific appointments or fallback list
  const activeCustomerList = useMemo(() => {
    if (customerMode) {
      const realBookings = (customerBookings && customerBookings.length > 0)
        ? customerBookings
        : store.state.bookings.filter(b =>
            b.client_name.toLowerCase().includes((customerName || '').toLowerCase().split(' ')[0]) ||
            b.client_id === 'client-sample-1'
          );

      if (realBookings.length > 0) {
        return realBookings.map((b, idx) => ({
          id: b.id,
          name: b.staff_name || 'Sarah Jansen (Specialist)',
          service: b.service_name,
          time: `${b.start_time} - ${b.end_time || '10:30'}`,
          price: `€${(b.price_eur || 45).toFixed(2)}`,
          avatar: '/images/avatar-olivia.svg',
          phone: b.client_phone || '06-12345678',
          status: b.status,
          date: b.date,
        }));
      }

      return [
        {
          id: 'cust-app-1',
          name: 'Sarah Jansen (Senior Stylist)',
          service: 'Knippen & Föhnen (All-in)',
          time: '09:00 - 10:00',
          price: '€45.00',
          avatar: '/images/avatar-olivia.svg',
          phone: '06-12345678',
          status: 'confirmed',
          date: '2026-11-13',
        },
        {
          id: 'cust-app-2',
          name: 'Joseph (Kleurspecialist)',
          service: 'Highlights & Balayage Touch-up',
          time: '11:30 - 13:00',
          price: '€85.00',
          avatar: '/images/avatar-emily.svg',
          phone: '06-12345678',
          status: 'confirmed',
          date: '2026-11-20',
        },
      ];
    }

    return null;
  }, [customerMode, customerBookings, store.state.bookings, customerName]);

  // Upcoming appointments matching GLOWBOARD reference for Admin (15 Rich Realistic Records)
  const adminList = [
    {
      id: 'app-1',
      name: 'Sophie van Dijk',
      service: 'Knippen & Föhnen (All-in)',
      time: '09:00 to 09:45',
      price: '€45.00',
      avatar: '/images/avatar-emily.svg',
      phone: '06-12345678',
      status: 'confirmed',
    },
    {
      id: 'app-2',
      name: 'Jan de Vries',
      service: 'Wassen & Klassieke Fade',
      time: '09:45 to 10:30',
      price: '€35.00',
      avatar: '/images/avatar-liam.svg',
      phone: '06-23456789',
      status: 'confirmed',
    },
    {
      id: 'app-3',
      name: 'Anouk de Jong',
      service: 'Balayage & Kleurbehandeling',
      time: '10:30 to 12:00',
      price: '€115.00',
      avatar: '/images/avatar-olivia.svg',
      phone: '06-34567890',
      status: 'confirmed',
    },
    {
      id: 'app-4',
      name: 'Daan Bakker',
      service: 'Baardtrim & Contouren',
      time: '11:15 to 11:45',
      price: '€28.00',
      avatar: '/images/avatar-benjamin.svg',
      phone: '06-45678901',
      status: 'confirmed',
    },
    {
      id: 'app-5',
      name: 'Emma van den Berg',
      service: 'Highlights & Glansspoeling',
      time: '13:00 to 14:15',
      price: '€95.00',
      avatar: '/images/avatar-charlotte.svg',
      phone: '06-56789012',
      status: 'completed',
    },
    {
      id: 'app-6',
      name: 'Lucas Janssen',
      service: 'Opscheren Skin Fade',
      time: '14:00 to 14:35',
      price: '€32.00',
      avatar: '/images/avatar-amelia.svg',
      phone: '06-67890123',
      status: 'completed',
    },
    {
      id: 'app-7',
      name: 'Mila Visser',
      service: 'Keratine Boost Kuur',
      time: '15:15 to 16:30',
      price: '€130.00',
      avatar: '/images/avatar-olivia.svg',
      phone: '06-78901234',
      status: 'confirmed',
    },
    {
      id: 'app-8',
      name: 'Sander Smit',
      service: 'Knippen & Baardverzorging',
      time: '16:00 to 16:45',
      price: '€52.50',
      avatar: '/images/avatar-emily.svg',
      phone: '06-89012345',
      status: 'confirmed',
    },
    {
      id: 'app-9',
      name: 'Fleur Meijer',
      service: 'Dames Knippen & Föhnen',
      time: '09:15 to 10:00',
      price: '€48.00',
      avatar: '/images/avatar-charlotte.svg',
      phone: '06-90123456',
      status: 'confirmed',
    },
    {
      id: 'app-10',
      name: 'Bram Mulder',
      service: 'Tondeuse & Oor/Nek Lijnen',
      time: '10:30 to 11:00',
      price: '€25.00',
      avatar: '/images/avatar-benjamin.svg',
      phone: '06-11223344',
      status: 'confirmed',
    },
    {
      id: 'app-11',
      name: 'Lotte Bos',
      service: 'Balayage Deluxe Pakket',
      time: '11:45 to 13:30',
      price: '€145.00',
      avatar: '/images/avatar-emily.svg',
      phone: '06-22334455',
      status: 'confirmed',
    },
    {
      id: 'app-12',
      name: 'Sem Vos',
      service: 'Studenten Knippen & Wax',
      time: '14:00 to 14:35',
      price: '€27.50',
      avatar: '/images/avatar-liam.svg',
      phone: '06-33445566',
      status: 'cancelled',
    },
    {
      id: 'app-13',
      name: 'Lieke Peters',
      service: 'Diepgaand Haarmasker',
      time: '15:00 to 15:45',
      price: '€38.00',
      avatar: '/images/avatar-olivia.svg',
      phone: '06-44556677',
      status: 'confirmed',
    },
    {
      id: 'app-14',
      name: 'Jesse Hendriks',
      service: 'Heren Knippen Klassiek',
      time: '16:15 to 16:50',
      price: '€34.00',
      avatar: '/images/avatar-benjamin.svg',
      phone: '06-55667788',
      status: 'pending',
    },
    {
      id: 'app-15',
      name: 'Sanne van Leeuwen',
      service: 'Bruidskapsel Proefbehandeling',
      time: '10:00 to 11:30',
      price: '€85.00',
      avatar: '/images/avatar-amelia.svg',
      phone: '06-66778899',
      status: 'confirmed',
    },
  ];

  const upcomingList = activeCustomerList || adminList;

  // Actions
  const handleSendReminder = (item: UpcomingDisplayItem) => {
    toast({
      title: locale === 'nl' ? 'Herinnering verstuurd' : 'Reminder sent',
      description: locale === 'nl'
        ? `Herinnering verzonden naar ${item.name} (${item.phone}).`
        : `Reminder dispatched to ${item.name} (${item.phone}).`,
      variant: 'success',
    });
  };

  const handleMarkCompleted = (item: UpcomingDisplayItem) => {
    toast({
      title: locale === 'nl' ? 'Afspraak voltooid' : 'Appointment completed',
      description: locale === 'nl'
        ? `Afspraak voor ${item.name} gemarkeerd als afgerond.`
        : `Appointment for ${item.name} marked as completed.`,
      variant: 'success',
    });
  };

  const handleCancelBooking = async (item: UpcomingDisplayItem) => {
    const confirmed = await confirm({
      title: locale === 'nl' ? 'Afspraak annuleren?' : 'Cancel appointment?',
      description: locale === 'nl'
        ? `Weet u zeker dat u de afspraak van ${item.name} wilt annuleren?`
        : `Are you sure you want to cancel the booking for ${item.name}?`,
      confirmText: locale === 'nl' ? 'Annuleren' : 'Cancel booking',
      cancelText: t('cancel'),
      variant: 'danger',
    });

    if (confirmed) {
      toast({
        title: locale === 'nl' ? 'Afspraak geannuleerd' : 'Appointment cancelled',
        description: locale === 'nl'
          ? `Afspraak van ${item.name} is geannuleerd.`
          : `Booking for ${item.name} was cancelled.`,
        variant: 'info',
      });
    }
  };

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 sm:p-6 transition-colors flex flex-col h-full',
        isDark
          ? 'bg-[#181820] border-[#272733] text-white'
          : 'bg-white border-secondary-200 text-secondary-900 shadow-xs',
        className
      )}
    >
      {/* Header: Title + Month Dropdown */}
      <div className="flex items-center justify-between mb-5">
        <h3 className={cn('text-base sm:text-lg font-bold', isDark ? 'text-white' : 'text-secondary-900')}>
          {customerMode
            ? (locale === 'nl' ? 'Mijn Afspraken' : 'My Appointments')
            : (locale === 'nl' ? 'Aankomende Afspraken' : 'Upcoming Appointments')}
        </h3>

        {/* Month Selector Dropdown */}
        <div className="relative inline-block text-left">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className={cn(
              'appearance-none text-xs font-semibold rounded-lg px-3 py-1.5 pr-7 cursor-pointer transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500',
              isDark
                ? 'bg-[#22222d] text-slate-300 border border-[#323242] hover:bg-[#2b2b3a]'
                : 'bg-secondary-50 text-secondary-700 border border-secondary-200 hover:bg-secondary-100'
            )}
          >
            <option value="October">{locale === 'nl' ? 'Oktober' : 'October'}</option>
            <option value="November">{locale === 'nl' ? 'November' : 'November'}</option>
            <option value="December">{locale === 'nl' ? 'December' : 'December'}</option>
          </select>
          <ChevronDown className={cn(
            'pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5',
            isDark ? 'text-slate-400' : 'text-secondary-500'
          )} />
        </div>
      </div>

      {/* Week Day Strip (MON 09 ... FRI 13 active ... SUN 15) with Capsule Highlighter */}
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5 mb-6 text-center select-none items-center">
        {weekDays.map((d, idx) => {
          const isActive = idx === activeDateIndex;
          return (
            <div key={idx} className="flex justify-center">
              <button
                type="button"
                onClick={() => setActiveDateIndex(idx)}
                className={cn(
                  'w-9 sm:w-10 h-13 sm:h-14 rounded-full flex flex-col items-center justify-center transition-all duration-150 cursor-pointer select-none',
                  isActive
                    ? isDark
                      ? 'bg-[#c4b5fd] text-[#19142f] font-bold shadow-md shadow-purple-950/40 ring-1 ring-[#c4b5fd]/80 scale-105'
                      : 'text-white font-bold shadow-md shadow-primary-500/25 scale-105'
                    : isDark
                    ? 'text-slate-400 hover:text-white hover:bg-[#22222d]'
                    : 'text-secondary-500 hover:text-secondary-900 hover:bg-secondary-100'
                )}
                style={isActive && !isDark ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
                title={`${d.dayEn} ${d.date}`}
              >
                <span
                  className={cn(
                    'text-[10px] font-bold tracking-wider uppercase',
                    isActive
                      ? isDark
                        ? 'text-[#19142f]/85 font-extrabold'
                        : 'text-white/90 font-bold'
                      : isDark
                      ? 'text-slate-400 font-semibold'
                      : 'text-secondary-400 font-semibold'
                  )}
                >
                  {locale === 'nl' ? d.dayNl : d.dayEn}
                </span>
                <span
                  className={cn(
                    'text-sm font-extrabold mt-0.5 font-sans leading-none',
                    isActive
                      ? isDark
                        ? 'text-[#19142f]'
                        : 'text-white'
                      : isDark
                      ? 'text-slate-200'
                      : 'text-secondary-800'
                  )}
                >
                  {d.date}
                </span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Appointments List */}
      <div className="flex-1 space-y-3.5 overflow-y-auto no-scrollbar">
        {upcomingList.map((item) => (
          <div
            key={item.id}
            className={cn(
              'flex items-center justify-between p-3 rounded-xl border transition-all duration-150',
              isDark
                ? 'border-[#282836] bg-[#1d1d27]/70 hover:bg-[#222230]'
                : 'border-secondary-100 bg-secondary-50/50 hover:bg-secondary-50'
            )}
          >
            <div className="flex items-center gap-3 min-w-0">
              <AppointmentAvatar
                name={item.name}
                avatar={item.avatar}
                status={item.status}
                isDark={isDark}
              />
              <div className="min-w-0">
                <h4 className={cn('text-xs sm:text-sm font-bold truncate leading-tight', isDark ? 'text-white' : 'text-secondary-900')}>
                  {item.name}
                </h4>
                <p className={cn('text-[11px] truncate mt-0.5', isDark ? 'text-slate-400' : 'text-secondary-500')}>
                  {item.service}
                </p>
                <p className={cn('text-[10px] font-mono mt-0.5', isDark ? 'text-slate-500' : 'text-secondary-400')}>
                  {item.time}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <span className={cn('text-xs sm:text-sm font-bold font-mono', isDark ? 'text-purple-300' : 'text-primary-700')}>
                {item.price}
              </span>

              {/* 3-Dots Action Dropdown Menu */}
              <Dropdown>
                <DropdownTrigger
                  className={cn(
                    'inline-flex h-8 w-8 items-center justify-center rounded-lg transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-purple-500',
                    isDark
                      ? 'text-slate-400 hover:text-white hover:bg-[#2a2a38]'
                      : 'text-secondary-400 hover:text-secondary-700 hover:bg-secondary-100'
                  )}
                  aria-label={`Options for ${item.name}`}
                >
                  <MoreVertical className="h-4 w-4" />
                </DropdownTrigger>
                <DropdownContent align="end" width="md">
                  <DropdownItem
                    icon={<Eye className="h-4 w-4 text-purple-600" />}
                    onClick={() => {
                      if (onOpenBookingDetails) {
                        onOpenBookingDetails({
                          id: item.id,
                          client_name: item.name,
                          service_name: item.service,
                          client_phone: item.phone,
                          date: '2026-11-13',
                          start_time: item.time.split(' to ')[0],
                          end_time: item.time.split(' to ')[1],
                          price_eur: parseFloat(item.price.replace('€', '')),
                          status: (item.status as BookingRecord['status']) || 'confirmed',
                        });
                      }
                    }}
                  >
                    {locale === 'nl' ? 'Dossier inzien' : 'View details'}
                  </DropdownItem>
                  {/* Owner-only action: Send reminder */}
                  {!customerMode && (
                    <DropdownItem
                      icon={<Bell className="h-4 w-4 text-blue-500" />}
                      onClick={() => handleSendReminder(item)}
                    >
                      {locale === 'nl' ? 'Herinnering sturen' : 'Send reminder'}
                    </DropdownItem>
                  )}
                  <DropdownItem
                    icon={<CalendarClock className="h-4 w-4 text-amber-500" />}
                    onClick={() => {
                      if (onReschedule) {
                        onReschedule({
                          id: item.id,
                          client_name: item.name,
                          service_name: item.service,
                          date: '2026-11-13',
                          start_time: item.time.split(' to ')[0],
                        });
                      }
                    }}
                  >
                    {locale === 'nl' ? 'Afspraak verplaatsen' : 'Reschedule'}
                  </DropdownItem>
                  {/* Owner-only action: Mark as completed */}
                  {!customerMode && (
                    <DropdownItem
                      icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                      onClick={() => handleMarkCompleted(item)}
                    >
                      {locale === 'nl' ? 'Markeren als voltooid' : 'Mark as completed'}
                    </DropdownItem>
                  )}
                  <DropdownSeparator />
                  <DropdownItem
                    icon={<Trash2 className="h-4 w-4 text-rose-600" />}
                    variant="danger"
                    onClick={() => handleCancelBooking(item)}
                  >
                    {locale === 'nl' ? 'Afspraak annuleren' : 'Cancel appointment'}
                  </DropdownItem>
                </DropdownContent>
              </Dropdown>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Mode Exclusive: Active Strippenkaart & Nazorg Spotlight */}
      {customerMode && (
        <div className="mt-4 pt-3.5 border-t border-secondary-200 dark:border-[#282836] space-y-3">
          {/* Strippenkaart Progress Widget */}
          <div className={cn(
            'p-3 rounded-xl border text-left',
            isDark ? 'bg-[#1e1b2e] border-purple-900/40' : 'bg-primary-50/70 border-primary-200/80'
          )}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-primary-600 dark:text-purple-400" />
                <span className="text-[11px] font-bold text-secondary-900 dark:text-white">
                  {locale === 'nl' ? 'Actieve Kuurkaart' : 'Active Treatment Pass'}
                </span>
              </div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-400">
                4 / 6 {locale === 'nl' ? 'sessies' : 'sessions'}
              </span>
            </div>
            {/* Progress bar */}
            <div className="h-2 w-full rounded-full bg-secondary-200 dark:bg-[#2b2b3d] overflow-hidden">
              <div className="h-full rounded-full bg-linear-to-r from-primary-500 to-purple-600 w-2/3" />
            </div>
            <div className="flex items-center justify-between mt-2 text-[10px] text-secondary-600 dark:text-slate-400">
              <span>{locale === 'nl' ? 'Nog 2 sessies over' : '2 sessions left'}</span>
              <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                {locale === 'nl' ? '€30 voordeel bespaard' : '€30 package savings'}
              </span>
            </div>
          </div>

          {/* Quick Aftercare / 24h Policy Note */}
          <div className={cn(
            'p-2.5 rounded-xl border flex items-center justify-between gap-2 text-[11px]',
            isDark ? 'bg-[#151520] border-[#29293a] text-slate-300' : 'bg-white border-secondary-200 text-secondary-700'
          )}>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-500 shrink-0" />
              <span>{locale === 'nl' ? '24-uurs gratis annuleringsgarantie actief' : '24h free cancellation policy active'}</span>
            </div>
            {onOpenNewBooking && (
              <button
                type="button"
                onClick={onOpenNewBooking}
                className="font-bold text-primary-600 dark:text-purple-400 hover:underline shrink-0 cursor-pointer"
              >
                + {locale === 'nl' ? 'Boeken' : 'Book'}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

