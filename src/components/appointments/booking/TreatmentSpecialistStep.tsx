import React from 'react';
import { Scissors, User, GraduationCap } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import type { ServiceRecord } from '@/core/data-store';

export interface TreatmentSpecialistStepProps {
  services: ServiceRecord[];
  selectedServiceId: string;
  onSelectServiceId: (id: string) => void;
  currentService?: ServiceRecord;
  staffList: Array<{ id: string; name: string; role?: string }>;
  selectedStaffId: string;
  onSelectStaffId: (id: string) => void;
  hasStudentPricing: boolean;
  isStudentDiscount: boolean;
  setIsStudentDiscount: (val: boolean) => void;
  isDark?: boolean;
}

export function TreatmentSpecialistStep({
  services,
  selectedServiceId,
  onSelectServiceId,
  currentService,
  staffList,
  selectedStaffId,
  onSelectStaffId,
  hasStudentPricing,
  isStudentDiscount,
  setIsStudentDiscount,
  isDark = false,
}: TreatmentSpecialistStepProps) {
  const { locale } = useI18n();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Treatment Select */}
        <div>
          <label className={cn('text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5', isDark ? 'text-slate-300' : 'text-secondary-700')}>
            <Scissors className="h-3.5 w-3.5 text-primary-600" />
            <span>{locale === 'nl' ? '2. Service' : '2. Treatment'}</span>
          </label>
          <select
            value={selectedServiceId}
            onChange={(e) => onSelectServiceId(e.target.value)}
            className={cn(
              'w-full px-3 py-2 text-xs font-medium rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-colors',
              isDark
                ? 'bg-[#14141c] border-[#36364a] text-white'
                : 'bg-white border-secondary-300 text-secondary-900'
            )}
          >
            {services.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.duration_min} min{s.price_eur ? ` • €${s.price_eur.toFixed(2)}` : ''})
              </option>
            ))}
          </select>

          {currentService && (
            <div className="mt-1.5 flex items-center gap-2 text-[11px] text-secondary-500">
              <span>Duur: <strong>{currentService.duration_min} min</strong></span>
              <span>•</span>
              <span>
                Prijs:{' '}
                {isStudentDiscount && currentService.student_price_eur ? (
                  <>
                    <span className="line-through opacity-70 mr-1">€{currentService.price_eur?.toFixed(2)}</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">€{currentService.student_price_eur.toFixed(2)} (Student)</strong>
                  </>
                ) : (
                  <strong>{currentService.price_eur ? `€${currentService.price_eur.toFixed(2)}` : 'Op aanvraag'}</strong>
                )}
              </span>
            </div>
          )}
        </div>

        {/* Specialist Select */}
        <div>
          <label className={cn('text-xs font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5', isDark ? 'text-slate-300' : 'text-secondary-700')}>
            <User className="h-3.5 w-3.5 text-sky-600" />
            <span>{locale === 'nl' ? '3. Specialist' : '3. Specialist'}</span>
          </label>
          <select
            value={selectedStaffId}
            onChange={(e) => onSelectStaffId(e.target.value)}
            className={cn(
              'w-full px-3 py-2 text-xs font-medium rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-colors',
              isDark
                ? 'bg-[#14141c] border-[#36364a] text-white'
                : 'bg-white border-secondary-300 text-secondary-900'
            )}
          >
            <option value="first_available">
              {locale === 'nl' ? '✨ Eerste beschikbare specialist' : '✨ First available specialist'}
            </option>
            {staffList.map((st) => (
              <option key={st.id} value={st.id}>
                {st.name} {st.role ? `(${st.role})` : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Student Discount Toggle (Kapsalon van Haaren & Student Pricing) */}
      {hasStudentPricing && (
        <div
          className={cn(
            'p-3 rounded-xl border flex items-center justify-between transition-all cursor-pointer select-none',
            isStudentDiscount
              ? 'bg-blue-500/10 border-blue-500/40 text-blue-900 dark:text-blue-200'
              : isDark
              ? 'bg-[#181822] border-[#2d2d3e] text-slate-300 hover:border-blue-400/40'
              : 'bg-secondary-50 border-secondary-200 text-secondary-800 hover:border-secondary-300'
          )}
          onClick={() => setIsStudentDiscount(!isStudentDiscount)}
        >
          <div className="flex items-center gap-2.5">
            <GraduationCap className={cn('h-4 w-4 shrink-0', isStudentDiscount ? 'text-blue-600' : 'text-secondary-400')} />
            <div>
              <p className="text-xs font-bold leading-tight flex items-center gap-1.5">
                <span>{locale === 'nl' ? 'Studentenkorting toepassen' : 'Apply Student Discount'}</span>
                <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                  Nijmegen Campus
                </span>
              </p>
              <p className="text-[10px] opacity-80 mt-0.5">
                {locale === 'nl' ? 'Geldige studenten- of collegekaart vereist bij afspraak' : 'Valid student ID card required upon arrival'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            {currentService?.student_price_eur && (
              <span className="text-xs font-mono font-extrabold text-emerald-600 dark:text-emerald-400">
                €{currentService.student_price_eur.toFixed(2)}
              </span>
            )}
            <input
              type="checkbox"
              checked={isStudentDiscount}
              onChange={(e) => setIsStudentDiscount(e.target.checked)}
              className="h-4 w-4 rounded accent-primary-600 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
}

