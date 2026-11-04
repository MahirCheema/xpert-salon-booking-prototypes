import { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { Clock, Plus, CheckCircle2, User } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import type { SalonDataStore, BookingRecord } from '@/core/data-store';

export interface DaySchedulePlannerProps {
  store: SalonDataStore;
  onBookSlot?: (staffName: string, time: string) => void;
  onSelectBooking?: (booking: BookingRecord) => void;
  isDark?: boolean;
  className?: string;
  customerMode?: boolean;
  customerName?: string;
}

export function DaySchedulePlanner({
  store,
  onBookSlot,
  onSelectBooking,
  isDark = false,
  className,
  customerMode = false,
  customerName = 'Sample Klant A',
}: DaySchedulePlannerProps) {
  const { locale } = useI18n();
  const cfg = store.config;

  // Staff members from salon config, ensuring at least 4 for rich multi-column view
  const baseStaff = cfg.staff || cfg.staff_sample || [];
  const staffList = [
    (baseStaff[0]?.name || baseStaff[0]?.name_sample || 'Specialist 1').replace(/\s*\(SAMPLE\)/gi, '').trim(),
    (baseStaff[1]?.name || baseStaff[1]?.name_sample || 'Specialist 2').replace(/\s*\(SAMPLE\)/gi, '').trim(),
    (baseStaff[2]?.name || baseStaff[2]?.name_sample || 'Specialist 3').replace(/\s*\(SAMPLE\)/gi, '').trim(),
    (baseStaff[3]?.name || baseStaff[3]?.name_sample || 'Specialist 4').replace(/\s*\(SAMPLE\)/gi, '').trim(),
  ];

  // Colors matching the reference image:
  // Col 0: Blue, Col 1: Teal/Green, Col 2: Amber, Col 3: Coral/Rose
  const staffTheme = [
    {
      dot: '#3b82f6',
      cardDark: 'bg-[#1e293b]/90 border-[#334155] text-blue-200 hover:border-blue-400',
      cardLight: 'bg-blue-50 border-blue-200 text-blue-900 hover:border-blue-400',
      badge: 'bg-blue-500/20 text-blue-300',
    },
    {
      dot: '#10b981',
      cardDark: 'bg-[#064e3b]/80 border-[#047857] text-emerald-200 hover:border-emerald-400',
      cardLight: 'bg-emerald-50 border-emerald-200 text-emerald-900 hover:border-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300',
    },
    {
      dot: '#d97706',
      cardDark: 'bg-[#451a03]/80 border-[#78350f] text-amber-200 hover:border-amber-400',
      cardLight: 'bg-amber-50 border-amber-200 text-amber-900 hover:border-amber-400',
      badge: 'bg-amber-500/20 text-amber-300',
    },
    {
      dot: '#e11d48',
      cardDark: 'bg-[#4c0519]/80 border-[#881337] text-rose-200 hover:border-rose-400',
      cardLight: 'bg-rose-50 border-rose-200 text-rose-900 hover:border-rose-400',
      badge: 'bg-rose-500/20 text-rose-300',
    },
  ];

  // Reference schedule items mapped to columns
  const scheduleColumns = [
    // Staff 1 (Blue)
    {
      staff: staffList[0],
      items: [
        {
          id: 'sc-1',
          time: '09:00 - 10:30',
          title: 'Haircut & Styling',
          client: 'David Miller',
          topPct: 1,
          heightPct: 22,
        },
        {
          id: 'sc-2',
          time: '11:00 - 13:00',
          title: 'Bridal Makeup & Styling',
          client: 'Sophie van Dijk',
          topPct: 30,
          heightPct: 31,
        },
        {
          id: 'sc-3',
          time: '13:30 - 15:00',
          title: 'Manicure & Pedicure',
          client: 'Elena Rostova',
          topPct: 69,
          heightPct: 23,
        },
      ],
    },
    // Staff 2 (Teal)
    {
      staff: staffList[1],
      items: [
        {
          id: 'sc-4',
          time: '09:30 - 10:45',
          title: 'Hair Spa Treatment',
          client: 'Olivia Smith',
          topPct: 8,
          heightPct: 20,
        },
        {
          id: 'sc-5',
          time: '11:00 - 12:30',
          title: 'Haircut & Styling',
          client: 'Lucas Janssen',
          topPct: 30,
          heightPct: 23,
        },
        {
          id: 'sc-6',
          time: '13:00 - 15:00',
          title: 'Bridal Makeup',
          client: 'Anouk de Jong',
          topPct: 61,
          heightPct: 31,
        },
      ],
    },
    // Staff 3 (Amber)
    {
      staff: staffList[2],
      items: [
        {
          id: 'sc-7',
          time: '09:30 - 11:00',
          title: 'Facial & Cleanup',
          client: 'Charlotte Anderson',
          topPct: 8,
          heightPct: 23,
        },
        {
          id: 'sc-8',
          time: '11:30 - 13:30',
          title: 'Hair Coloring - Full Hair',
          client: 'Laura Visser',
          topPct: 38,
          heightPct: 31,
        },
        {
          id: 'sc-9',
          time: '13:45 - 15:00',
          title: 'Hair Wash & Blow Dry',
          client: 'Emma Bakker',
          topPct: 73,
          heightPct: 20,
        },
      ],
    },
    // Staff 4 (Rose)
    {
      staff: staffList[3],
      items: [
        {
          id: 'sc-10',
          time: '09:30 - 11:30',
          title: 'Hair Coloring - Highlights',
          client: 'Jessica Taylor',
          topPct: 8,
          heightPct: 29,
        },
        {
          id: 'sc-11',
          time: '11:30 - 13:00',
          title: 'Hair Coloring - Highlights',
          client: 'Sanne Meijer',
          topPct: 40,
          heightPct: 23,
        },
        {
          id: 'sc-12',
          time: '13:30 - 15:00',
          title: 'Facial - Anti-Aging',
          client: 'Monique Bos',
          topPct: 69,
          heightPct: 23,
        },
      ],
    },
  ];

  const timeRows = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];

  return (
    <div
      className={cn(
        'rounded-2xl border p-5 sm:p-6 transition-colors',
        isDark
          ? 'bg-[#181820] border-[#272733] text-white'
          : 'bg-white border-secondary-200 text-secondary-900 shadow-xs',
        className
      )}
    >
      {/* Header: Title + Staff Legend */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <h3 className={cn('text-base sm:text-lg font-bold', isDark ? 'text-white' : 'text-secondary-900')}>
          {locale === 'nl' ? 'Dagindeling & Rooster' : 'Day Schedule'}
        </h3>

        {/* Legend dots with staff names */}
        <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
          {staffList.map((name, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: staffTheme[idx % staffTheme.length].dot }}
              />
              <span className={isDark ? 'text-slate-300' : 'text-secondary-600'}>
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Grid: Time Column on Left + 4 Staff Columns */}
      <div className="relative overflow-x-auto no-scrollbar">
        <div className="min-w-155">
          {/* Staff Headers matching grid columns */}
          <div className={cn(
            'flex items-center pb-2.5 border-b text-xs font-semibold',
            isDark ? 'border-[#2a2b38]' : 'border-secondary-200'
          )}>
            <div className="w-12 text-center text-slate-500 font-mono shrink-0">
              <Clock className="h-3.5 w-3.5 mx-auto" />
            </div>
            <div className="flex-1 grid grid-cols-4 gap-2.5 px-1">
              {scheduleColumns.map((col, idx) => (
                <div
                  key={idx}
                  className="text-center truncate font-bold text-xs"
                  style={{ color: staffTheme[idx].dot }}
                >
                  <span className="truncate">{col.staff}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Time Rows and Content Container */}
          <div className="relative pt-3 overflow-hidden" style={{ height: '370px' }}>
            {/* Background horizontal hour guide lines */}
            {timeRows.map((t, idx) => {
              const topPx = 10 + (idx / (timeRows.length - 1)) * 320;
              return (
                <div
                  key={t}
                  className="absolute left-0 right-0 flex items-center"
                  style={{ top: `${topPx}px` }}
                >
                  <span className={cn(
                    'w-12 text-[11px] font-mono text-right pr-2 shrink-0 select-none',
                    isDark ? 'text-slate-500' : 'text-secondary-400'
                  )}>
                    {t}
                  </span>
                  <div className={cn(
                    'flex-1 border-t',
                    isDark ? 'border-[#262635]' : 'border-secondary-100'
                  )} />
                </div>
              );
            })}

            {/* 4 Staff Columns of Floating Appointment Cards */}
            <div className="absolute top-2.5 bottom-2 left-12 right-0 grid grid-cols-4 gap-2.5 px-1">
              {scheduleColumns.map((col, colIdx) => {
                const theme = staffTheme[colIdx];
                return (
                  <div key={colIdx} className="relative h-full">
                    {col.items.map((item) => {
                      const isCustomerAppointment =
                        customerMode &&
                        item.client.toLowerCase().includes((customerName || '').toLowerCase().split(' ')[0]);

                      // When in customer mode, anonymize all appointments not belonging to this customer
                      const displayTitle = customerMode
                        ? isCustomerAppointment
                          ? item.title
                          : (locale === 'nl' ? 'Bezet tijdslot' : 'Reserved Slot')
                        : item.title;

                      const displayClient = customerMode
                        ? isCustomerAppointment
                          ? `${customerName} (U)`
                          : (locale === 'nl' ? 'Niet beschikbaar' : 'Unavailable')
                        : item.client;

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            // Only allow opening details if it belongs to this customer or if in admin mode
                            if (customerMode && !isCustomerAppointment) {
                              return;
                            }
                            if (onSelectBooking) {
                              onSelectBooking({
                                id: item.id,
                                client_id: `client-${item.id}`,
                                client_name: isCustomerAppointment ? customerName : item.client,
                                client_phone: '06-12345678',
                                client_email: 'klant@example.nl',
                                service_id: 'srv-1',
                                service_name: item.title,
                                staff_id: 'staff-1',
                                staff_name: col.staff,
                                start_time: item.time.split(' - ')[0],
                                end_time: item.time.split(' - ')[1],
                                date: '2026-11-03',
                                status: 'confirmed' as const,
                                price_eur: 45,
                                duration_min: 45,
                                is_sample: true,
                                created_at: new Date().toISOString(),
                              });
                            }
                          }}
                          style={{
                            top: `${item.topPct}%`,
                            height: `${item.heightPct}%`,
                          }}
                          className={cn(
                            'absolute left-0 right-0 rounded-xl p-2.5 border shadow-sm transition-all duration-150 flex flex-col justify-between',
                            isDark ? theme.cardDark : theme.cardLight,
                            customerMode && !isCustomerAppointment
                              ? 'cursor-default opacity-60 filter grayscale-[30%]'
                              : 'cursor-pointer hover:scale-[1.02] hover:z-20',
                            isCustomerAppointment &&
                              (isDark
                                ? 'ring-2 ring-[#a855f7] bg-[#2e1065]/90 border-[#a855f7] shadow-lg shadow-purple-950/60 z-10 opacity-100 filter-none'
                                : 'ring-2 ring-primary-600 bg-primary-50/90 border-primary-500 shadow-md shadow-primary-500/20 z-10 opacity-100 filter-none')
                          )}
                          title={
                            customerMode && !isCustomerAppointment
                              ? (locale === 'nl' ? 'Bezet tijdslot' : 'Unavailable slot')
                              : `${item.title} (${isCustomerAppointment ? customerName : item.client}) - ${item.time}`
                          }
                        >
                          <div className="min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-[11px] font-bold leading-tight truncate">
                                {displayTitle}
                              </p>
                              {isCustomerAppointment && (
                                <span className="text-[8px] font-extrabold uppercase px-1.5 py-0.2 rounded-full bg-primary-600 text-white shrink-0 tracking-wider shadow-2xs">
                                  {locale === 'nl' ? '★ Mijn Afspraak' : '★ My Booking'}
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] opacity-80 truncate mt-0.5 font-medium">
                              {displayClient}
                            </p>
                          </div>
                          <div className="flex items-center justify-between text-[9px] opacity-75 font-mono pt-1">
                            <span>{item.time}</span>
                            <CheckCircle2 className="h-3 w-3 shrink-0 opacity-80" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Customer Interactive Booking Bar */}
          {customerMode && (
            <div className={cn(
              'mt-3 pt-3 border-t border-dashed flex flex-wrap items-center justify-between gap-2 text-xs',
              isDark ? 'border-[#2d2d3f]' : 'border-secondary-200'
            )}>
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className={cn('text-xs font-semibold', isDark ? 'text-slate-300' : 'text-secondary-700')}>
                  {locale === 'nl'
                    ? '15-minuten tijdsloten realtime beschikbaar voor directe online boeking'
                    : '15-minute slots available for instant online booking'}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onBookSlot && onBookSlot(staffList[0], '14:00')}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                {locale === 'nl' ? 'Direct tijdslot reserveren' : 'Select open time slot'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

