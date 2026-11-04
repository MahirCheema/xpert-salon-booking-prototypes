import React from 'react';
import { Calendar, Clock, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import { Badge } from '@/components/ui/Badge';
import type { SlotResult } from '@/core/slot-engine';
import type { ServiceRecord } from '@/core/data-store';

export interface TimeSlotPickerProps {
  selectedDate: string;
  setSelectedDate: (date: string) => void;
  selectedTime: string;
  setSelectedTime: (time: string) => void;
  todayStr: string;
  slotData: { slots: SlotResult[]; isClosed: boolean };
  currentService?: ServiceRecord;
  bufferMin: number;
  isDark?: boolean;
}

export function TimeSlotPicker({
  selectedDate,
  setSelectedDate,
  selectedTime,
  setSelectedTime,
  todayStr,
  slotData,
  currentService,
  bufferMin,
  isDark = false,
}: TimeSlotPickerProps) {
  const { locale } = useI18n();

  return (
    <div
      className={cn(
        'p-4 rounded-xl border space-y-3',
        isDark
          ? 'bg-[#1a1a24] border-[#2d2d3e]'
          : 'bg-secondary-50/50 border-secondary-200'
      )}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <label className={cn('text-xs font-bold uppercase tracking-wider flex items-center gap-1.5', isDark ? 'text-slate-300' : 'text-secondary-700')}>
          <Calendar className="h-3.5 w-3.5 text-primary-600" />
          <span>{locale === 'nl' ? '4. Datum & Beschikbaar Tijdslot' : '4. Date & Time Slot'}</span>
        </label>

        {slotData.isClosed ? (
          <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-400">
            {locale === 'nl' ? '🔒 Gesloten op deze dag' : '🔒 Closed on this day'}
          </span>
        ) : (
          <span className="text-[11px] font-medium text-secondary-500">
            {locale === 'nl' ? '15-minuten interval controles' : '15-min interval verified'}
          </span>
        )}
      </div>

      <div className="flex items-center gap-3">
        <input
          type="date"
          min={todayStr}
          value={selectedDate}
          onChange={(e) => {
            setSelectedDate(e.target.value);
            setSelectedTime('');
          }}
          className={cn(
            'px-3 py-2 text-xs font-semibold rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500',
            isDark
              ? 'bg-[#121218] border-[#36364a] text-white'
              : 'bg-white border-secondary-300 text-secondary-900'
          )}
        />
        <span className="text-xs text-secondary-500">
          {locale === 'nl' ? 'Beschikbare tijden:' : 'Available slots:'}
        </span>
      </div>

      {/* Slots Grid */}
      {slotData.isClosed ? (
        <p className="text-xs text-rose-600 dark:text-rose-400 py-2">
          {locale === 'nl'
            ? 'De salon is gesloten op deze dag. Kies a.u.b. een andere datum.'
            : 'The salon is closed on this day. Please choose another date.'}
        </p>
      ) : slotData.slots.length === 0 ? (
        <p className="text-xs text-amber-600 dark:text-amber-400 py-2">
          {locale === 'nl'
            ? 'Geen vrije tijdsloten beschikbaar op deze dag voor de gekozen behandelduur.'
            : 'No free time slots available on this day for the selected duration.'}
        </p>
      ) : (
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-1.5 max-h-36 overflow-y-auto p-1 border rounded-lg bg-white dark:bg-[#121218] border-secondary-200 dark:border-[#2b2b3b]">
          {slotData.slots.map((s) => {
            const isSelected = selectedTime === s.time;
            return (
              <button
                key={s.time}
                type="button"
                onClick={() => setSelectedTime(s.time)}
                className={cn(
                  'py-1.5 px-2 rounded-md font-mono text-xs font-semibold transition-all cursor-pointer text-center',
                  isSelected
                    ? 'text-white shadow-xs font-bold scale-102'
                    : isDark
                    ? 'bg-[#191924] text-slate-300 hover:bg-[#252536] border border-[#2b2b3d]'
                    : 'bg-secondary-100 text-secondary-800 hover:bg-secondary-200 border border-secondary-200'
                )}
                style={
                  isSelected
                    ? { backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }
                    : undefined
                }
              >
                {s.time}
              </button>
            );
          })}
        </div>
      )}

      {/* Prominently Display Selected Date & Time Slot directly below Section 4 */}
      {selectedTime ? (
        <div
          className={cn(
            'mt-2.5 p-3 rounded-xl border flex items-center justify-between gap-3 transition-all animate-in fade-in slide-in-from-top-1 duration-200',
            isDark
              ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              : 'bg-emerald-50/90 border-emerald-300 text-emerald-950 shadow-xs'
          )}
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                {locale === 'nl' ? 'Geselecteerd Afspraakmoment' : 'Selected Appointment Slot'}
              </div>
              <div className="text-xs font-bold truncate text-emerald-900 dark:text-white flex items-center gap-1.5 flex-wrap">
                <span>{selectedDate}</span>
                <span className="text-emerald-500 font-extrabold">•</span>
                <span className="font-mono text-sm font-black underline decoration-emerald-500 decoration-2 underline-offset-2">
                  {selectedTime}
                </span>
                {currentService && (
                  <span className="text-[11px] font-medium opacity-85 ml-1 hidden sm:inline">
                    ({currentService.duration_min} min + {bufferMin} min buffer)
                  </span>
                )}
              </div>
            </div>
          </div>
          <Badge variant="success" className="shrink-0 text-xs font-mono font-bold px-2 py-0.5">
            {selectedTime} uur
          </Badge>
        </div>
      ) : (
        <div
          className={cn(
            'mt-2.5 p-2 rounded-lg border border-dashed flex items-center gap-2 text-xs',
            isDark ? 'border-[#333346] text-slate-400' : 'border-secondary-300 text-secondary-500'
          )}
        >
          <Clock className="h-4 w-4 text-secondary-400 shrink-0" />
          <span>
            {locale === 'nl'
              ? 'Klik op een beschikbaar tijdslot hierboven om uw keuze vast te leggen.'
              : 'Click an available time slot above to choose your preferred time.'}
          </span>
        </div>
      )}
    </div>
  );
}

