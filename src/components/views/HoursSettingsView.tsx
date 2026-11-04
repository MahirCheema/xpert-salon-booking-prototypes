import React, { useState, useMemo, useEffect } from 'react';
import {
  Clock,
  ExternalLink,
  Store,
  Calendar,
  Plus,
  Trash2,
  RotateCcw,
  Save,
  Sliders,
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
import type { SalonDataStore } from '@/core/data-store';
import { getOpeningHoursForDay } from '@/core/slot-engine';

export interface HoursSettingsViewProps {
  store: SalonDataStore;
}

interface DayRowState {
  dayIdx: number; // 0=Sun, 1=Mon, ..., 6=Sat
  nameNl: string;
  nameEn: string;
  key: string;
  mode: 'open' | 'closed' | 'by_appointment';
  openTime: string;
  closeTime: string;
  hasBreak: boolean;
  breakStart: string;
  breakEnd: string;
}

interface SpecialClosure {
  id: string;
  date: string;
  reason: string;
  type: 'full_closed' | 'custom_hours';
  customOpen?: string;
  customClose?: string;
}

export function HoursSettingsView({ store }: HoursSettingsViewProps) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const cfg = store.config;

  const isGrooming = Boolean(cfg.type && (cfg.type.toLowerCase().includes('animal') || cfg.type.toLowerCase().includes('grooming')));
  const isBeauty = Boolean(cfg.type && cfg.type.toLowerCase().includes('beauty'));
  const heroImg = isGrooming
    ? '/images/salon-grooming.svg'
    : isBeauty
    ? '/images/salon-beauty.svg'
    : '/images/salon-hair.svg';

  // 1. Initialize 7 days schedule from store.config.hours
  const initialDays: DayRowState[] = useMemo(() => {
    const dayMeta = [
      { dayIdx: 1, key: 'Mon', nameNl: 'Maandag', nameEn: 'Monday' },
      { dayIdx: 2, key: 'Tue', nameNl: 'Dinsdag', nameEn: 'Tuesday' },
      { dayIdx: 3, key: 'Wed', nameNl: 'Woensdag', nameEn: 'Wednesday' },
      { dayIdx: 4, key: 'Thu', nameNl: 'Donderdag', nameEn: 'Thursday' },
      { dayIdx: 5, key: 'Fri', nameNl: 'Vrijdag', nameEn: 'Friday' },
      { dayIdx: 6, key: 'Sat', nameNl: 'Zaterdag', nameEn: 'Saturday' },
      { dayIdx: 0, key: 'Sun', nameNl: 'Zondag', nameEn: 'Sunday' },
    ];

    return dayMeta.map((m) => {
      const parsed = getOpeningHoursForDay(cfg.hours || {}, m.dayIdx);
      let mode: 'open' | 'closed' | 'by_appointment' = 'open';
      if (parsed.isClosed) {
        mode = 'closed';
      } else if (parsed.isByAppointment) {
        mode = 'by_appointment';
      }

      return {
        dayIdx: m.dayIdx,
        key: m.key,
        nameNl: m.nameNl,
        nameEn: m.nameEn,
        mode,
        openTime: parsed.openTime || '09:00',
        closeTime: parsed.closeTime || '18:00',
        hasBreak: false,
        breakStart: '12:30',
        breakEnd: '13:00',
      };
    });
  }, [cfg.hours]);

  const [days, setDays] = useState<DayRowState[]>(initialDays);

  // Sync when salon changes
  useEffect(() => {
    setDays(initialDays);
  }, [initialDays]);

  // 2. Special Closures / Holiday Exceptions CRUD state
  const [specialClosures, setSpecialClosures] = useState<SpecialClosure[]>(() => {
    if (cfg.special_closures && Array.isArray(cfg.special_closures)) {
      return cfg.special_closures.map((c) => ({
        ...c,
        type: (c.type === 'custom_hours' ? 'custom_hours' : 'full_closed') as 'full_closed' | 'custom_hours',
      }));
    }
    return [
      { id: 'sc-1', date: '2026-12-25', reason: 'Eerste Kerstdag (Wettelijke Feestdag)', type: 'full_closed' },
      { id: 'sc-2', date: '2026-12-26', reason: 'Tweede Kerstdag (Wettelijke Feestdag)', type: 'full_closed' },
      { id: 'sc-3', date: '2026-12-31', reason: 'Oudejaarsavond (Aangepaste openingstijden)', type: 'custom_hours', customOpen: '09:00', customClose: '14:00' },
      { id: 'sc-4', date: '2027-01-01', reason: 'Nieuwjaarsdag (Salon Gesloten)', type: 'full_closed' },
      { id: 'sc-5', date: '2027-04-05', reason: 'Tweede Paasdag (Wettelijke Feestdag)', type: 'full_closed' },
      { id: 'sc-6', date: '2027-04-27', reason: 'Koningsdag (Hele Dag Gesloten)', type: 'full_closed' },
      { id: 'sc-7', date: '2027-05-13', reason: 'Hemelvaartsdag (Salon Gesloten)', type: 'full_closed' },
      { id: 'sc-8', date: '2027-05-24', reason: 'Tweede Pinksterdag (Wettelijke Feestdag)', type: 'full_closed' },
      { id: 'sc-9', date: '2027-07-15', reason: 'Jaarlijkse Teamtraining & Masterclass', type: 'full_closed' },
      { id: 'sc-10', date: '2027-08-01', reason: 'Zomeravond Aangepast (Open tot 21:00)', type: 'custom_hours', customOpen: '10:00', customClose: '21:00' },
    ];
  });

  const [newClosureOpen, setNewClosureOpen] = useState(false);
  const [newClosureDate, setNewClosureDate] = useState('2026-11-20');
  const [newClosureReason, setNewClosureReason] = useState('');
  const [newClosureType, setNewClosureType] = useState<'full_closed' | 'custom_hours'>('full_closed');

  // 3. Contact & Business Info CRUD state
  const [salonName, setSalonName] = useState(cfg.client || '');
  const [address, setAddress] = useState(cfg.contact?.address || `${cfg.city}, Nederland`);
  const [city, setCity] = useState(cfg.city || '');
  const [phone, setPhone] = useState(cfg.contact?.phone || '010-1234567');
  const [email, setEmail] = useState(cfg.contact?.email || `info@${cfg.slug}.nl`);
  const [website, setWebsite] = useState(cfg.website || 'https://www.xpert-salon.nl');
  const [kvkNumber, setKvkNumber] = useState<string>(String(cfg.business_details?.kvk || '24398102'));
  const [btwNumber, setBtwNumber] = useState<string>(String(cfg.business_details?.btw || 'NL854910284B01'));
  const [parkingNotes, setParkingNotes] = useState<string>(String(cfg.business_details?.parking || 'Gratis parkeren voor de salon, bushalte op 50m loopafstand.'));

  // 4. Online Booking Engine Settings CRUD state
  const [slotGranularity, setSlotGranularity] = useState<'15' | '30'>('15');
  const [minAdvanceHours, setMinAdvanceHours] = useState('1');
  const [maxAdvanceDays, setMaxAdvanceDays] = useState('60');
  const [cancellationNoticeHours, setCancellationNoticeHours] = useState('24');

  // Sync contact when salon changes
  useEffect(() => {
    setSalonName(cfg.client || '');
    setAddress(cfg.contact?.address || `${cfg.city}, Nederland`);
    setCity(cfg.city || '');
    setPhone(cfg.contact?.phone || '010-1234567');
    setEmail(cfg.contact?.email || `info@${cfg.slug}.nl`);
    setWebsite(cfg.website || 'https://www.xpert-salon.nl');
  }, [cfg]);

  // Update a single day's hours
  const handleUpdateDay = (index: number, updates: Partial<DayRowState>) => {
    setDays((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...updates };
      return next;
    });
  };

  // Preset Handlers
  const applyPreset = (presetType: 'kappers' | 'standard' | 'koopavond' | 'all_days') => {
    setDays((prev) =>
      prev.map((d) => {
        if (presetType === 'kappers') {
          // Di-Za open, Zo-Ma closed
          if (d.key === 'Sun' || d.key === 'Mon') {
            return { ...d, mode: 'closed' };
          }
          if (d.key === 'Sat') {
            return { ...d, mode: 'open', openTime: '09:00', closeTime: '16:00' };
          }
          return { ...d, mode: 'open', openTime: '09:00', closeTime: '18:00' };
        } else if (presetType === 'standard') {
          // Ma-Vr 09:00 - 17:00, Za-Zo closed
          if (d.key === 'Sun' || d.key === 'Sat') {
            return { ...d, mode: 'closed' };
          }
          return { ...d, mode: 'open', openTime: '09:00', closeTime: '17:00' };
        } else if (presetType === 'koopavond') {
          // Thursday open till 21:00
          if (d.key === 'Thu') {
            return { ...d, mode: 'open', openTime: '09:00', closeTime: '21:00' };
          }
          return d;
        } else {
          // 7 days open
          return { ...d, mode: 'open', openTime: '09:00', closeTime: '18:00' };
        }
      })
    );
    toast.success(locale === 'nl' ? 'Voorbeeldrooster toegepast!' : 'Schedule preset applied!');
  };

  // Add Special Closure
  const handleAddClosure = () => {
    if (!newClosureReason.trim()) {
      toast.error(locale === 'nl' ? 'Vul a.u.b. een reden in.' : 'Please enter a reason.');
      return;
    }
    const newEntry: SpecialClosure = {
      id: `sc-${Date.now()}`,
      date: newClosureDate,
      reason: newClosureReason.trim(),
      type: newClosureType,
    };
    const nextList = [...specialClosures, newEntry];
    setSpecialClosures(nextList);
    store.updateSpecialClosures(nextList);
    setNewClosureReason('');
    setNewClosureOpen(false);
    toast.success(locale === 'nl' ? 'Uitzonderingsdag toegevoegd!' : 'Holiday exception added!');
  };

  // Remove Special Closure
  const handleRemoveClosure = (id: string) => {
    const nextList = specialClosures.filter((c) => c.id !== id);
    setSpecialClosures(nextList);
    store.updateSpecialClosures(nextList);
    toast.success(locale === 'nl' ? 'Uitzonderingsdag verwijderd.' : 'Exception removed.');
  };

  // Save All Changes (CRUD Execution)
  const handleSaveAll = () => {
    // 1. Build dictionary for store.updateHours
    const hoursDict: Record<string, string> = {};
    days.forEach((d) => {
      if (d.mode === 'closed') {
        hoursDict[d.key] = 'Closed';
      } else if (d.mode === 'by_appointment') {
        hoursDict[d.key] = 'By appointment';
      } else {
        hoursDict[d.key] = `${d.openTime}-${d.closeTime}`;
      }
    });

    store.updateHours(hoursDict);

    // 2. Update contact & location info
    store.updateContactInfo({
      address,
      phone,
      email,
      website,
      city,
    });

    // 3. Update business details & rules
    store.updateBookingRules({
      slotGranularity,
      minAdvanceHours,
      maxAdvanceDays,
      cancellationNoticeHours,
      parkingNotes,
      kvk: kvkNumber,
      btw: btwNumber,
    });

    toast.success(
      locale === 'nl'
        ? 'Openingstijden, contactgegevens en boekingsregels succesvol opgeslagen!'
        : 'Hours, contact details, and booking rules saved successfully!'
    );
  };

  // Reset to original client configuration defaults
  const handleResetDefaults = () => {
    store.resetConfigToDefaults();
    toast.success(
      locale === 'nl'
        ? 'Hersteld naar de originele fabrieksinstellingen van deze salon.'
        : 'Reset to original salon configuration defaults.'
    );
  };

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader
        eyebrow={locale === 'nl' ? 'Salon Beheer & Instellingen' : 'Salon Management & Operations'}
        title={locale === 'nl' ? 'Openingstijden, Contact & Bedrijfsgegevens' : 'Hours, Contact & Business Info'}
        description={locale === 'nl'
          ? `Compleet beheer van wekelijkse openingstijden per dag, afwijkende feestdagen, contactgegevens en online boekingsregels voor ${cfg.client}.`
          : `Full CRUD management of weekly hours per day, holiday exceptions, contact info, and online booking rules for ${cfg.client}.`}
      />

      {/* Top Action Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl border bg-white dark:bg-[#181822] border-secondary-200 dark:border-[#272733] shadow-2xs">
        <div className="flex items-center gap-2">
          <Badge variant="primary" className="text-xs font-semibold">
            {cfg.client}
          </Badge>
          <span className="text-xs text-secondary-500 font-medium">
            {cfg.type} • {cfg.city}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={handleResetDefaults}
            className="text-xs font-semibold"
            title={locale === 'nl' ? 'Herstel fabrieksinstellingen' : 'Reset to defaults'}
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1 text-secondary-500" />
            {locale === 'nl' ? 'Herstel Standaard' : 'Reset Defaults'}
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={handleSaveAll}
            className="text-xs font-bold text-white shadow-xs"
            style={{ backgroundColor: 'var(--primary, #2563eb)' }}
          >
            <Save className="h-3.5 w-3.5 mr-1" />
            {locale === 'nl' ? 'Wijzigingen Opslaan' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols): Interactive Weekly Hours & Holiday Exceptions CRUD */}
        <div className="lg:col-span-8 space-y-6">
          {/* Section 1: Weekly Opening Hours Day-by-Day CRUD */}
          <Card className="p-6 border-secondary-200 dark:border-[#272733]">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4 pb-3 border-b border-secondary-100 dark:border-[#272733]">
              <div className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary-600" />
                <div>
                  <h3 className="text-base font-bold text-secondary-900 dark:text-white leading-tight">
                    {locale === 'nl' ? 'Wekelijks Openingstijdenschema' : 'Weekly Operating Hours'}
                  </h3>
                  <p className="text-xs text-secondary-500">
                    {locale === 'nl'
                      ? 'Pas de openingstijden per dag aan. Wijzigingen worden direct doorberekend in de 15-minuten slot engine.'
                      : 'Customize operating hours per day. Affects the real-time slot engine and schedule interface.'}
                  </p>
                </div>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] uppercase font-bold text-secondary-400 mr-1">
                  {locale === 'nl' ? 'Presets:' : 'Presets:'}
                </span>
                <button
                  type="button"
                  onClick={() => applyPreset('kappers')}
                  className="px-2 py-1 text-[11px] font-semibold rounded-md border border-secondary-200 dark:border-[#333346] bg-secondary-50 dark:bg-[#1a1a24] hover:bg-secondary-100 cursor-pointer"
                >
                  Di-Za
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('standard')}
                  className="px-2 py-1 text-[11px] font-semibold rounded-md border border-secondary-200 dark:border-[#333346] bg-secondary-50 dark:bg-[#1a1a24] hover:bg-secondary-100 cursor-pointer"
                >
                  Ma-Vr
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('koopavond')}
                  className="px-2 py-1 text-[11px] font-semibold rounded-md border border-secondary-200 dark:border-[#333346] bg-secondary-50 dark:bg-[#1a1a24] hover:bg-secondary-100 cursor-pointer text-amber-600"
                >
                  + Koopavond
                </button>
              </div>
            </div>

            {/* Day rows table */}
            <div className="space-y-3">
              {days.map((day, idx) => {
                const dayName = locale === 'nl' ? day.nameNl : day.nameEn;
                const isClosed = day.mode === 'closed';
                const isByAppt = day.mode === 'by_appointment';

                return (
                  <div
                    key={day.key}
                    className={cn(
                      'p-3 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3',
                      isClosed
                        ? 'bg-rose-50/30 dark:bg-rose-950/10 border-rose-200/60 dark:border-rose-900/30'
                        : isByAppt
                        ? 'bg-amber-50/30 dark:bg-amber-950/10 border-amber-200/60 dark:border-amber-900/30'
                        : 'bg-white dark:bg-[#14141c] border-secondary-200 dark:border-[#2d2d3e]'
                    )}
                  >
                    {/* Day Name & Status Switcher */}
                    <div className="flex items-center gap-3 min-w-37.5">
                      <span className="font-bold text-sm text-secondary-900 dark:text-white w-24">
                        {dayName}
                      </span>

                      {/* Mode Segmented Switch */}
                      <div className="inline-flex rounded-lg border border-secondary-200 dark:border-[#333344] p-0.5 bg-secondary-50 dark:bg-[#181822]">
                        <button
                          type="button"
                          onClick={() => handleUpdateDay(idx, { mode: 'open' })}
                          className={cn(
                            'px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer',
                            day.mode === 'open'
                              ? 'bg-emerald-600 text-white shadow-2xs'
                              : 'text-secondary-600 dark:text-slate-400 hover:text-secondary-900'
                          )}
                        >
                          {locale === 'nl' ? 'Open' : 'Open'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateDay(idx, { mode: 'by_appointment' })}
                          className={cn(
                            'px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer',
                            day.mode === 'by_appointment'
                              ? 'bg-amber-600 text-white shadow-2xs'
                              : 'text-secondary-600 dark:text-slate-400 hover:text-secondary-900'
                          )}
                        >
                          {locale === 'nl' ? 'Afspraak' : 'Appt'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleUpdateDay(idx, { mode: 'closed' })}
                          className={cn(
                            'px-2 py-0.5 text-[10px] font-bold rounded-md transition-colors cursor-pointer',
                            day.mode === 'closed'
                              ? 'bg-rose-600 text-white shadow-2xs'
                              : 'text-secondary-600 dark:text-slate-400 hover:text-secondary-900'
                          )}
                        >
                          {locale === 'nl' ? 'Gesloten' : 'Closed'}
                        </button>
                      </div>
                    </div>

                    {/* Time Selectors or Closed Label */}
                    <div className="flex items-center gap-3 flex-wrap">
                      {isClosed ? (
                        <span className="text-xs font-semibold text-rose-600 dark:text-rose-400 px-3 py-1 rounded-md bg-rose-100/50 dark:bg-rose-950/30 font-mono">
                          {locale === 'nl' ? 'De gehele dag gesloten' : 'Closed all day'}
                        </span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-secondary-500 font-medium">Van:</span>
                            <input
                              type="time"
                              value={day.openTime}
                              onChange={(e) => handleUpdateDay(idx, { openTime: e.target.value })}
                              className="px-2 py-1 text-xs font-mono font-bold rounded-md border border-secondary-300 dark:border-[#38384a] bg-white dark:bg-[#1a1a24] text-secondary-900 dark:text-white"
                            />
                          </div>

                          <span className="text-secondary-400">-</span>

                          <div className="flex items-center gap-1.5">
                            <span className="text-[11px] text-secondary-500 font-medium">Tot:</span>
                            <input
                              type="time"
                              value={day.closeTime}
                              onChange={(e) => handleUpdateDay(idx, { closeTime: e.target.value })}
                              className="px-2 py-1 text-xs font-mono font-bold rounded-md border border-secondary-300 dark:border-[#38384a] bg-white dark:bg-[#1a1a24] text-secondary-900 dark:text-white"
                            />
                          </div>

                          {/* Koopavond Badge if after 18:30 */}
                          {parseInt(day.closeTime.split(':')[0], 10) >= 19 && (
                            <Badge variant="warning" className="text-[10px] hidden sm:inline-flex">
                              {locale === 'nl' ? 'Koopavond' : 'Late night'}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Section 2: Special Closures & Holiday Exceptions CRUD */}
          <Card className="p-6 border-secondary-200 dark:border-[#272733]">
            <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-secondary-100 dark:border-[#272733]">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary-600" />
                <div>
                  <h3 className="text-base font-bold text-secondary-900 dark:text-white leading-tight">
                    {locale === 'nl' ? 'Afwijkende Dagen & Feestdagen' : 'Holiday Exceptions & Closures'}
                  </h3>
                  <p className="text-xs text-secondary-500">
                    {locale === 'nl'
                      ? 'Plan vakanties, teamtrainingen en feestdagen in waarin de salon afwijkende openingstijden heeft.'
                      : 'Schedule vacation periods, public holidays, or team training closures.'}
                  </p>
                </div>
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={() => setNewClosureOpen(true)}
                className="text-xs font-semibold"
              >
                <Plus className="h-3.5 w-3.5 mr-1" />
                {locale === 'nl' ? 'Nieuwe Uitzondering' : 'Add Exception'}
              </Button>
            </div>

            {specialClosures.length === 0 ? (
              <p className="text-xs text-secondary-500 italic py-3 text-center">
                {locale === 'nl' ? 'Geen afwijkende feestdagen geregistreerd.' : 'No special holiday closures registered.'}
              </p>
            ) : (
              <div className="space-y-2">
                {specialClosures.map((closure) => (
                  <div
                    key={closure.id}
                    className="p-3 rounded-xl border border-secondary-200 dark:border-[#2c2c3d] bg-secondary-50/50 dark:bg-[#161622] flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-bold text-secondary-900 dark:text-white bg-white dark:bg-[#1e1e2c] border border-secondary-200 dark:border-[#333346] px-2.5 py-1 rounded-md">
                        {closure.date}
                      </div>
                      <div>
                        <span className="font-bold text-secondary-900 dark:text-white block">
                          {closure.reason}
                        </span>
                        <span className="text-[11px] text-rose-600 dark:text-rose-400 font-medium">
                          {closure.type === 'full_closed'
                            ? (locale === 'nl' ? 'Hele dag gesloten' : 'Closed full day')
                            : `${closure.customOpen} - ${closure.customClose}`}
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleRemoveClosure(closure.id)}
                      className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 h-8 w-8 p-0"
                      title={locale === 'nl' ? 'Verwijderen' : 'Remove'}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right Column (4 cols): Contact & Location CRUD + Legal & Booking Engine */}
        <div className="lg:col-span-4 space-y-6">
          {/* Salon Visual Banner */}
          <div className="relative rounded-2xl overflow-hidden border border-secondary-200 bg-secondary-900 shadow-2xs">
            <img src={heroImg} alt={cfg.client} className="w-full h-32 object-cover opacity-85" />
            <div className="absolute inset-0 bg-linear-to-t from-secondary-950/90 via-transparent to-transparent flex items-end p-4">
              <div>
                <span className="text-white font-bold text-sm block">{salonName}</span>
                <span className="text-xs text-slate-300">{cfg.type}</span>
              </div>
            </div>
          </div>

          {/* Contact & Location CRUD Card */}
          <Card className="p-6 border-secondary-200 dark:border-[#272733] space-y-4">
            <h3 className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-2">
              <Store className="h-4 w-4 text-primary-600" />
              <span>{locale === 'nl' ? 'Vestigings- & Contactgegevens' : 'Contact & Location'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                  {locale === 'nl' ? 'Salon Handelsnaam' : 'Business Name'}
                </label>
                <input
                  type="text"
                  value={salonName}
                  onChange={(e) => setSalonName(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-secondary-300 dark:border-[#333346] bg-white dark:bg-[#151520] text-secondary-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                  {locale === 'nl' ? 'Adres & Huisnummer' : 'Street Address'}
                </label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-secondary-300 dark:border-[#333346] bg-white dark:bg-[#151520] text-secondary-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                    {locale === 'nl' ? 'Plaats' : 'City'}
                  </label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-secondary-300 dark:border-[#333346] bg-white dark:bg-[#151520] text-secondary-900 dark:text-white focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                    {locale === 'nl' ? 'Telefoonnummer' : 'Phone'}
                  </label>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-secondary-300 dark:border-[#333346] bg-white dark:bg-[#151520] text-secondary-900 dark:text-white font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                  {locale === 'nl' ? 'E-mailadres Klantcontact' : 'Public Email'}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-secondary-300 dark:border-[#333346] bg-white dark:bg-[#151520] text-secondary-900 dark:text-white focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-semibold text-secondary-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>{locale === 'nl' ? 'Website URL' : 'Website'}</span>
                  {website && (
                    <a
                      href={website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary-600 hover:underline flex items-center gap-0.5 text-[10px]"
                    >
                      <span>{locale === 'nl' ? 'Test link' : 'Test'}</span>
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </label>
                <input
                  type="url"
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-secondary-300 dark:border-[#333346] bg-white dark:bg-[#151520] text-secondary-900 dark:text-white focus:outline-hidden font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                  {locale === 'nl' ? 'Parkeer- & Route-instructies' : 'Parking & Directions'}
                </label>
                <textarea
                  rows={2}
                  value={parkingNotes}
                  onChange={(e) => setParkingNotes(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-secondary-300 dark:border-[#333346] bg-white dark:bg-[#151520] text-secondary-900 dark:text-white focus:outline-hidden text-xs"
                />
              </div>
            </div>
          </Card>

          {/* Legal Dossier & Booking Engine Rules Card */}
          <Card className="p-6 border-secondary-200 dark:border-[#272733] space-y-4">
            <h3 className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-2">
              <Sliders className="h-4 w-4 text-primary-600" />
              <span>{locale === 'nl' ? 'Boekingsregels & Facturatie' : 'Booking Rules & Billing'}</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                    KVK Nummer
                  </label>
                  <input
                    type="text"
                    value={kvkNumber}
                    onChange={(e) => setKvkNumber(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-secondary-300 dark:border-[#333346] bg-white dark:bg-[#151520] text-secondary-900 dark:text-white font-mono focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                    BTW Nummer
                  </label>
                  <input
                    type="text"
                    value={btwNumber}
                    onChange={(e) => setBtwNumber(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-secondary-300 dark:border-[#333346] bg-white dark:bg-[#151520] text-secondary-900 dark:text-white font-mono focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                  {locale === 'nl' ? 'Slot Interval Engine' : 'Slot Interval'}
                </label>
                <select
                  value={slotGranularity}
                  onChange={(e) => setSlotGranularity(e.target.value as '15' | '30')}
                  className="w-full px-3 py-1.5 rounded-lg border border-secondary-300 dark:border-[#333346] bg-white dark:bg-[#151520] text-secondary-900 dark:text-white focus:outline-hidden"
                >
                  <option value="15">15 minuten (Xpert Standaard)</option>
                  <option value="30">30 minuten</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                  {locale === 'nl' ? 'Kosteloze Annuleringstermijn' : 'Free Cancellation Notice'}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={cancellationNoticeHours}
                    onChange={(e) => setCancellationNoticeHours(e.target.value)}
                    className="w-24 px-3 py-1.5 rounded-lg border border-secondary-300 dark:border-[#333346] bg-white dark:bg-[#151520] text-secondary-900 dark:text-white font-mono focus:outline-hidden"
                  />
                  <span className="text-secondary-500">
                    {locale === 'nl' ? 'uur voor afspraak' : 'hours prior'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  variant="primary"
                  onClick={handleSaveAll}
                  className="w-full text-xs font-bold text-white shadow-xs"
                  style={{ backgroundColor: 'var(--primary, #2563eb)' }}
                >
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  {locale === 'nl' ? 'Alle Gegevens Opslaan' : 'Save All Settings'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Add Holiday Closure Modal */}
      <Dialog open={newClosureOpen} onOpenChange={setNewClosureOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary-600" />
              <span>{locale === 'nl' ? 'Afwijkende Uitzondering Toevoegen' : 'Add Holiday Exception'}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="px-6 py-4 space-y-3.5 text-xs">
            <div>
              <label className="block font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                {locale === 'nl' ? 'Datum' : 'Date'}
              </label>
              <input
                type="date"
                value={newClosureDate}
                onChange={(e) => setNewClosureDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-[#333346] bg-white dark:bg-[#151520] text-secondary-900 dark:text-white font-mono focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                {locale === 'nl' ? 'Reden / Omschrijving' : 'Reason / Description'}
              </label>
              <input
                type="text"
                placeholder={locale === 'nl' ? 'bijv. Salonvakantie, Teamtraining...' : 'e.g. Salon vacation, team training...'}
                value={newClosureReason}
                onChange={(e) => setNewClosureReason(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-[#333346] bg-white dark:bg-[#151520] text-secondary-900 dark:text-white focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                {locale === 'nl' ? 'Type Sluiting' : 'Closure Type'}
              </label>
              <select
                value={newClosureType}
                onChange={(e) => setNewClosureType(e.target.value as 'full_closed' | 'custom_hours')}
                className="w-full px-3 py-2 rounded-lg border border-secondary-300 dark:border-[#333346] bg-white dark:bg-[#151520] text-secondary-900 dark:text-white focus:outline-hidden"
              >
                <option value="full_closed">{locale === 'nl' ? 'Hele dag gesloten' : 'Closed all day'}</option>
              </select>
            </div>
          </div>

          <DialogFooter>
            <Button variant="secondary" onClick={() => setNewClosureOpen(false)}>
              {locale === 'nl' ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button
              variant="primary"
              onClick={handleAddClosure}
              className="text-white font-bold"
              style={{ backgroundColor: 'var(--primary, #2563eb)' }}
            >
              <Plus className="h-4 w-4 mr-1" />
              {locale === 'nl' ? 'Uitzondering Opslaan' : 'Add Exception'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
