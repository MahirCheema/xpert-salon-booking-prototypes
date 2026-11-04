import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  Mail,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import {
  getAvailableSlots,
  getNextAvailableDate,
  formatDateYMD,
  getOpeningHoursForDay,
  isSingleDiarySalon,
  type SlotResult,
} from '@/core/slot-engine';
import type { SalonDataStore, BookingRecord, ServiceRecord } from '@/core/data-store';

interface BookingFlowProps {
  store: SalonDataStore;
}

export function BookingFlow({ store }: BookingFlowProps) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const confirm = useConfirm();

  const cfg = store.config;
  const isGrooming = cfg.type && (cfg.type.toLowerCase().includes('animal') || cfg.type.toLowerCase().includes('grooming'));
  const isBeauty = cfg.type && cfg.type.toLowerCase().includes('beauty');
  const isHair = cfg.type && cfg.type.toLowerCase().includes('hair');
  const isSingleDiary = isSingleDiarySalon(cfg);

  // Default date = tomorrow or next weekday
  const defaultDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);
    return formatDateYMD(d);
  }, []);

  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<ServiceRecord | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>('first_available');
  const [selectedDate, setSelectedDate] = useState<string>(defaultDate);
  const [selectedSlot, setSelectedSlot] = useState<SlotResult | null>(null);

  // Client Details
  const [clientName, setClientName] = useState<string>('');
  const [clientPhone, setClientPhone] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientNotes, setClientNotes] = useState<string>('');
  const [isStudent, setIsStudent] = useState<boolean>(false);

  // Grooming Details
  const [petName, setPetName] = useState<string>('');
  const [petSpecies, setPetSpecies] = useState<string>('Hond');
  const [petBreed, setPetBreed] = useState<string>('');
  const [petCoat, setPetCoat] = useState<string>('');
  const [petBehaviour, setPetBehaviour] = useState<string>('');
  const [petFlags, setPetFlags] = useState<string[]>([]);
  const [catQuietRoom, setCatQuietRoom] = useState<boolean>(false);
  const [petPhoto, setPetPhoto] = useState<string | null>(null);

  // Beauty Details
  const [skinType, setSkinType] = useState<string>('Normaal');
  const [skinAllergies, setSkinAllergies] = useState<string>('');
  const [startCourse, setStartCourse] = useState<boolean>(false);

  // Errors & Completed
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [confirmedBooking, setConfirmedBooking] = useState<BookingRecord | null>(null);

  // 14 calendar days
  const calendarDays = useMemo(() => {
    const today = new Date();
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const ymd = formatDateYMD(d);
      const dayOfWeek = d.getDay();
      const hours = getOpeningHoursForDay(cfg.hours, dayOfWeek);
      const dayNames = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'];
      days.push({
        ymd,
        dayNum: d.getDate(),
        dayName: dayNames[dayOfWeek],
        isClosed: hours.isClosed || !hours.isOpen,
        isByAppointment: hours.isByAppointment,
      });
    }
    return days;
  }, [cfg.hours]);

  // Compute slots for selected day
  const availableSlots = useMemo(() => {
    if (!selectedService || !selectedDate) return [];
    return getAvailableSlots({
      clientConfig: cfg,
      service: selectedService,
      staffId: selectedStaffId,
      dateStr: selectedDate,
      existingBookings: store.state.bookings,
      referenceNow: new Date(),
    });
  }, [cfg, selectedService, selectedStaffId, selectedDate, store.state.bookings]);

  // Fallback next available day if no slots
  const nextAvailableDay = useMemo(() => {
    if (availableSlots.length > 0 || !selectedService) return null;
    return getNextAvailableDate({
      clientConfig: cfg,
      service: selectedService,
      staffId: selectedStaffId,
      fromDateStr: selectedDate,
      existingBookings: store.state.bookings,
      referenceNow: new Date(),
    });
  }, [availableSlots, cfg, selectedService, selectedStaffId, selectedDate, store.state.bookings]);

  // Validate step 4
  const handleValidateStep4 = (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};

    if (!clientName.trim()) errors.clientName = 'Naam is verplicht';
    if (!clientPhone.trim() || !/^[0-9+\s\-().]{8,15}$/.test(clientPhone.trim())) {
      errors.clientPhone = 'Geldig telefoonnummer vereist (bijv. 06-12345678)';
    }
    if (!clientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clientEmail.trim())) {
      errors.clientEmail = 'Geldig e-mailadres vereist';
    }

    if (isGrooming) {
      if (!petName.trim()) errors.petName = 'Naam van het huisdier is verplicht';
      if (!petBreed.trim()) errors.petBreed = 'Ras is verplicht';
    }

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast({
        title: t('toastErrorTitle'),
        description: t('toastFormIncomplete'),
        variant: 'danger',
      });
      return;
    }

    setFieldErrors({});
    setStep(5);
  };

  // Submit booking with ConfirmDialog
  const handleConfirmBooking = async () => {
    if (!selectedService || !selectedSlot) return;

    const ok = await confirm({
      title: locale === 'nl' ? 'Afspraak definitief bevestigen?' : 'Confirm your appointment?',
      description:
        locale === 'nl'
          ? `Weet u zeker dat u de afspraak voor ${clientName} op ${selectedDate} om ${selectedSlot.time} uur wilt bevestigen voor ${selectedService.name}?`
          : `Are you sure you want to confirm the appointment for ${clientName} on ${selectedDate} at ${selectedSlot.time} for ${selectedService.name}?`,
      confirmText: t('confirmBookingBtn'),
      cancelText: t('cancel'),
      variant: 'primary',
    });

    if (!ok) return;

    try {
      const price = isStudent && selectedService.student_price_eur ? selectedService.student_price_eur : selectedService.price_eur;
      const b = store.addBooking({
        service_id: selectedService.id,
        service_name: selectedService.name,
        duration_min: selectedService.duration_min,
        price_eur: price,
        is_student: isStudent,
        staff_id: selectedSlot.assignedStaffId,
        date: selectedDate,
        start_time: selectedSlot.time,
        client_name: clientName,
        client_phone: clientPhone,
        client_email: clientEmail,
        client_notes: clientNotes,
        pet: isGrooming
          ? {
              name: petName,
              species: petSpecies,
              breed: petBreed,
              coat: petCoat,
              behaviour_notes: petBehaviour,
              medical_flags: petFlags,
              separate_room_flag: catQuietRoom,
              photo_preview: petPhoto,
            }
          : undefined,
        intake_notes: clientNotes || 'Online geboekt',
        start_treatment_course: startCourse,
      });

      setConfirmedBooking(b);
      setStep(6);
      toast({
        title: t('toastBookedSuccess'),
        description:
          locale === 'nl'
            ? 'Uw afspraak is succesvol ingepland. Bevestiging is verstuurd.'
            : 'Your appointment has been booked. A confirmation has been sent.',
        variant: 'success',
      });
    } catch (err: unknown) {
      toast({
        title: t('toastErrorTitle'),
        description: err instanceof Error ? err.message : 'Er is iets misgegaan.',
        variant: 'danger',
      });
    }
  };

  // Cancel booking with ConfirmDialog
  const handleCancelBooking = async () => {
    if (!confirmedBooking) return;
    const policy = cfg.cancellation_policy || 'Kosteloos annuleren tot 24 uur van tevoren.';

    const ok = await confirm({
      title: t('confirmCancelTitle'),
      description: `${t('confirmCancelDesc')} ${policy}`,
      confirmText: t('confirmCancelBtn'),
      cancelText: t('cancel'),
      variant: 'danger',
    });

    if (!ok) return;

    try {
      store.cancelBooking(confirmedBooking.id);
      setConfirmedBooking({ ...confirmedBooking, status: 'cancelled' });
      toast({
        title: t('toastCancelledSuccess'),
        description: locale === 'nl' ? 'De afspraak is geannuleerd.' : 'The booking has been cancelled.',
        variant: 'info',
      });
    } catch (e: unknown) {
      toast({
        title: t('toastErrorTitle'),
        description: e instanceof Error ? e.message : 'Error cancelling booking',
        variant: 'danger',
      });
    }
  };

  // Reschedule booking
  const handleReschedule = async () => {
    if (!confirmedBooking || !selectedService) return;

    const ok = await confirm({
      title: t('confirmReschedTitle'),
      description:
        locale === 'nl'
          ? 'Kies een nieuwe datum en tijd om deze afspraak te verplaatsen.'
          : 'Choose a new date and time to reschedule this appointment.',
      confirmText: t('confirmReschedBtn'),
      cancelText: t('cancel'),
      variant: 'primary',
    });

    if (!ok) return;
    setStep(3);
  };

  // Simulated Reminder
  const handleSimulateReminder = () => {
    if (!confirmedBooking) return;
    store.simulateReminder(confirmedBooking.id);
    setConfirmedBooking({ ...confirmedBooking, reminder_sent: true });
    toast({
      title: t('toastReminderSent'),
      description:
        locale === 'nl'
          ? 'Gesimuleerde SMS & E-mail herinnering verstuurd naar de klant.'
          : 'Simulated SMS & Email reminder sent to client.',
      variant: 'info',
    });
  };

  // Rebooking nudge
  const handleRebook = () => {
    if (!confirmedBooking) return;
    const nextDate = new Date();
    nextDate.setDate(nextDate.getDate() + 28);
    if (nextDate.getDay() === 0) nextDate.setDate(nextDate.getDate() + 1);

    setSelectedDate(formatDateYMD(nextDate));
    setSelectedSlot(null);
    setStep(1);
    toast({
      title: locale === 'nl' ? 'Vervolgafspraak' : 'Follow-up booking',
      description:
        locale === 'nl'
          ? 'Klant- en dossiergegevens automatisch overgenomen voor uw volgende afspraak.'
          : 'Client details pre-filled for your next appointment.',
      variant: 'info',
    });
  };

  const handleReset = () => {
    setStep(1);
    setSelectedService(null);
    setSelectedSlot(null);
    setConfirmedBooking(null);
  };

  return (
    <div className="mx-auto max-w-4xl py-6">
      {/* Step Progress Navigation */}
      <nav aria-label="Progress" className="mb-8">
        <ol className="flex items-center justify-between border-b border-secondary-200 dark:border-[#272733] pb-4">
          {[1, 2, 3, 4, 5, 6].map((st) => {
            const stepNameKey = `step${st}` as 'step1' | 'step2' | 'step3' | 'step4' | 'step5' | 'step6';
            const isActive = step === st;
            const isDone = step > st;
            return (
              <li key={st} className="flex flex-col items-center gap-1.5 text-center">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-primary-600 text-white shadow-md ring-4 ring-primary-100'
                      : isDone
                      ? 'bg-success-600 text-white'
                      : 'border-2 border-secondary-300 bg-white text-secondary-500'
                  }`}
                >
                  {isDone ? '✓' : st}
                </div>
                <span
                  className={`text-xs font-semibold sm:text-sm ${
                    isActive ? 'text-primary-700' : isDone ? 'text-secondary-800' : 'text-secondary-400'
                  }`}
                >
                  {t(stepNameKey)}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* STEP 1: Select Service */}
      {step === 1 && (
        <Card>
          <Card.Header>
            <Card.Title>{t('step1Title')}</Card.Title>
            <Card.Description>{t('step1Subtitle')}</Card.Description>
          </Card.Header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {store.state.services.map((srv) => {
              const isSel = selectedService?.id === srv.id;
              return (
                <div
                  key={srv.id}
                  onClick={() => {
                    setSelectedService(srv);
                    setSelectedSlot(null);
                  }}
                  className={`group relative flex cursor-pointer flex-col justify-between rounded-xl border-2 p-5 transition-all hover:border-primary-500 hover:shadow-md ${
                    isSel ? 'border-primary-600 bg-primary-50/30 ring-2 ring-primary-500' : 'border-secondary-200 dark:border-[#2c2c3c] bg-white dark:bg-[#1a1a24]'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-bold text-secondary-900 dark:text-white group-hover:text-primary-700">{srv.name}</h4>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-secondary-600 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1 rounded-md bg-secondary-100 px-2 py-0.5 font-medium">
                          <Clock className="h-3 w-3" /> {srv.duration_min} {t('duration')}
                        </span>
                        <span className="rounded-md bg-secondary-100 px-2 py-0.5 font-medium">
                          🛡 {srv.buffer_min} {t('buffer')}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-extrabold text-primary-700">
                        {srv.price_eur ? `€${srv.price_eur}` : t('priceOnRequest')}
                      </div>
                      {srv.student_price_eur && (
                        <div className="text-xs font-semibold text-accent" style={{ color: 'var(--accent)' }}>
                          Student: €{srv.student_price_eur}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-end">
            <Button
              disabled={!selectedService}
              rightIcon={<ChevronRight className="h-4 w-4" />}
              onClick={() => setStep(2)}
            >
              {t('nextStaff')}
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 2: Choose Specialist */}
      {step === 2 && (
        <Card>
          <Card.Header>
            <Card.Title>{t('step2Title')}</Card.Title>
            <Card.Description>
              {isSingleDiary ? t('singleDiaryNotice') : t('step2Subtitle')}
            </Card.Description>
          </Card.Header>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div
              onClick={() => setSelectedStaffId('first_available')}
              className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all hover:border-primary-500 ${
                selectedStaffId === 'first_available'
                  ? 'border-primary-600 bg-primary-50/30 ring-2 ring-primary-500'
                  : 'border-secondary-200 dark:border-[#2c2c3c] bg-white dark:bg-[#1a1a24]'
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-xl font-bold text-primary-700">
                ⚡
              </div>
              <div>
                <h4 className="font-bold text-secondary-900 dark:text-white">{t('firstAvailable')}</h4>
                <p className="text-xs text-secondary-500 dark:text-slate-400">{t('firstAvailableDesc')}</p>
              </div>
            </div>

            {store.state.staff.map((st) => {
              const isSel = selectedStaffId === st.id;
              const staffAvatar =
                st.name.toLowerCase().includes('issa') || st.name.toLowerCase().includes('osman')
                  ? '/images/staff-issa.svg'
                  : st.name.toLowerCase().includes('samira') || st.name.toLowerCase().includes('faya') || st.name.toLowerCase().includes('charlotte')
                  ? '/images/staff-samira.svg'
                  : st.name.toLowerCase().includes('violetta') || st.name.toLowerCase().includes('linda') || st.name.toLowerCase().includes('finn')
                  ? '/images/staff-violetta.svg'
                  : '/images/staff-issa.svg';

              return (
                <div
                  key={st.id}
                  onClick={() => setSelectedStaffId(st.id)}
                  className={`flex cursor-pointer items-center gap-4 rounded-xl border-2 p-4 transition-all hover:border-primary-500 ${
                    isSel ? 'border-primary-600 bg-primary-50/30 ring-2 ring-primary-500' : 'border-secondary-200 bg-white'
                  }`}
                >
                  <img
                    src={staffAvatar}
                    alt={st.name}
                    className="h-12 w-12 rounded-full object-cover border border-secondary-200 shadow-2xs shrink-0 bg-white"
                  />
                  <div>
                    <h4 className="font-bold text-secondary-900">{st.name}</h4>
                    <p className="text-xs text-secondary-500">{st.role}</p>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" leftIcon={<ChevronLeft className="h-4 w-4" />} onClick={() => setStep(1)}>
              {t('prevStep')}
            </Button>
            <Button rightIcon={<ChevronRight className="h-4 w-4" />} onClick={() => setStep(3)}>
              {t('nextDateTime')}
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 3: Pure Slot Engine Date & Time */}
      {step === 3 && (
        <Card>
          <Card.Header>
            <Card.Title>{t('step3Title')}</Card.Title>
            <Card.Description>
              {selectedService?.name} ({selectedService?.duration_min} {t('duration')} + {selectedService?.buffer_min}{' '}
              {t('buffer')})
            </Card.Description>
          </Card.Header>

          {/* Date Picker Chips */}
          <div className="mb-6">
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-secondary-600">
              {t('selectDay')}
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2">
              {calendarDays.map((d) => {
                const isSel = d.ymd === selectedDate;
                return (
                  <button
                    key={d.ymd}
                    type="button"
                    disabled={d.isClosed}
                    onClick={() => {
                      setSelectedDate(d.ymd);
                      setSelectedSlot(null);
                    }}
                    className={`flex min-w-20 shrink-0 flex-col items-center rounded-xl border-2 p-3 text-center transition-all ${
                      isSel
                        ? 'border-primary-600 bg-primary-600 text-white shadow-md'
                        : d.isClosed
                        ? 'cursor-not-allowed border-secondary-200 bg-secondary-100 opacity-50'
                        : 'border-secondary-200 bg-white hover:border-primary-400'
                    }`}
                  >
                    <span className="text-xs font-semibold uppercase">{d.dayName}</span>
                    <span className="text-lg font-black">{d.dayNum}</span>
                    <span className="text-[10px] font-medium">
                      {d.isClosed ? t('closed') : d.isByAppointment ? t('byAppointment') : t('open')}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Slots Grid */}
          <div className="mt-6 border-t border-secondary-100 pt-6">
            <div className="mb-3 flex items-center justify-between">
              <span className="text-sm font-bold text-secondary-800">
                {t('availableSlotsOn')} {selectedDate} (15m):
              </span>
              <span className="text-xs text-secondary-500">
                {availableSlots.length} {locale === 'nl' ? 'tijden beschikbaar' : 'slots available'}
              </span>
            </div>

            {availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 md:grid-cols-6">
                {availableSlots.map((slot) => {
                  const isSel = selectedSlot?.time === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`flex h-11 items-center justify-center rounded-lg border text-sm font-bold transition-all ${
                        isSel
                          ? 'border-primary-600 bg-primary-600 text-white shadow-md'
                          : 'border-secondary-200 bg-white text-secondary-900 hover:border-primary-500 hover:bg-primary-50/50'
                      }`}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-xl border border-dashed border-secondary-300 p-8 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-secondary-400" />
                <p className="mt-2 font-medium text-secondary-700">{t('noSlotsToday')}</p>
                {nextAvailableDay && (
                  <Button
                    variant="primary"
                    size="sm"
                    className="mt-4"
                    onClick={() => {
                      setSelectedDate(nextAvailableDay.dateStr);
                      setSelectedSlot(null);
                    }}
                  >
                    {t('viewNextAvailableDay')} ({nextAvailableDay.dateStr}) &rarr;
                  </Button>
                )}
              </div>
            )}
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" leftIcon={<ChevronLeft className="h-4 w-4" />} onClick={() => setStep(2)}>
              {t('prevStep')}
            </Button>
            <Button
              disabled={!selectedSlot}
              rightIcon={<ChevronRight className="h-4 w-4" />}
              onClick={() => setStep(4)}
            >
              {t('nextDetails')}
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 4: Contact & Intake Form */}
      {step === 4 && (
        <Card>
          <Card.Header>
            <Card.Title>{t('step4Title')}</Card.Title>
            <Card.Description>{t('step4Subtitle')}</Card.Description>
          </Card.Header>

          <form onSubmit={handleValidateStep4} className="space-y-6">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary-700">
                  {t('fullName')} *
                </label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  placeholder="Bijv. Lisa van Dijk"
                  className={`mt-1 w-full rounded-lg border p-2.5 text-sm ${
                    fieldErrors.clientName ? 'border-danger-500 bg-danger-50' : 'border-secondary-300'
                  }`}
                />
                {fieldErrors.clientName && (
                  <p className="mt-1 text-xs text-danger-600">{fieldErrors.clientName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-secondary-700">
                  {t('phone')} *
                </label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  placeholder="06-12345678"
                  className={`mt-1 w-full rounded-lg border p-2.5 text-sm ${
                    fieldErrors.clientPhone ? 'border-danger-500 bg-danger-50' : 'border-secondary-300'
                  }`}
                />
                {fieldErrors.clientPhone && (
                  <p className="mt-1 text-xs text-danger-600">{fieldErrors.clientPhone}</p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary-700">
                {t('email')} *
              </label>
              <input
                type="email"
                required
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="lisa@voorbeeld.nl"
                className={`mt-1 w-full rounded-lg border p-2.5 text-sm ${
                  fieldErrors.clientEmail ? 'border-danger-500 bg-danger-50' : 'border-secondary-300'
                }`}
              />
              {fieldErrors.clientEmail && (
                <p className="mt-1 text-xs text-danger-600">{fieldErrors.clientEmail}</p>
              )}
            </div>

            {/* Student Discount Toggle (Hair) */}
            {selectedService?.student_price_eur && (
              <div className="rounded-xl border border-secondary-200 bg-secondary-50 p-4">
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={isStudent}
                    onChange={(e) => setIsStudent(e.target.checked)}
                    className="h-4 w-4 rounded-sm text-primary-600"
                  />
                  <span className="text-sm font-semibold text-secondary-900">{t('studentOption')}</span>
                </label>
              </div>
            )}

            {/* Grooming Pet Profile Section */}
            {isGrooming && (
              <div className="rounded-2xl border border-secondary-200 bg-secondary-50/50 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" style={{ color: 'var(--accent)' }} />
                  <h4 className="font-bold text-secondary-900">{t('petProfileTitle')}</h4>
                </div>
                <p className="text-xs text-secondary-500">{t('petProfileSubtitle')}</p>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-700">
                      {t('petName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={petName}
                      onChange={(e) => setPetName(e.target.value)}
                      placeholder="Bijv. Max of Bella"
                      className="mt-1 w-full rounded-lg border border-secondary-300 p-2.5 text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-700">
                      {t('petSpecies')} *
                    </label>
                    <select
                      value={petSpecies}
                      onChange={(e) => setPetSpecies(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-secondary-300 p-2.5 text-sm bg-white"
                    >
                      <option value="Hond">{t('dog')}</option>
                      {(cfg.slug.includes('kat') || cfg.slug === 'trimsalon-het-hofje' || cfg.slug === 'trimsalon-limbo') && (
                        <option value="Kat">{t('cat')}</option>
                      )}
                      {cfg.slug === 'trimsalon-limbo' && <option value="Konijn">{t('rabbit')}</option>}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-700">
                      {t('petBreed')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={petBreed}
                      onChange={(e) => setPetBreed(e.target.value)}
                      placeholder="Bijv. Labradoodle / Poedel"
                      className="mt-1 w-full rounded-lg border border-secondary-300 p-2.5 text-sm bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-700">
                      {t('petCoat')}
                    </label>
                    <input
                      type="text"
                      value={petCoat}
                      onChange={(e) => setPetCoat(e.target.value)}
                      placeholder="Bijv. Klitten, Dichte rui"
                      className="mt-1 w-full rounded-lg border border-secondary-300 p-2.5 text-sm bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary-700">
                    {t('petBehaviour')}
                  </label>
                  <input
                    type="text"
                    value={petBehaviour}
                    onChange={(e) => setPetBehaviour(e.target.value)}
                    placeholder="Bijv. Angstig voor föhn, rustig bij knippen"
                    className="mt-1 w-full rounded-lg border border-secondary-300 p-2.5 text-sm bg-white"
                  />
                </div>

                {/* Medical flags */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary-700 mb-2">
                    {t('petMedical')}
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {[
                      { key: 'flagAllergy', label: t('flagAllergy') },
                      { key: 'flagJoints', label: t('flagJoints') },
                      { key: 'flagFleas', label: t('flagFleas') },
                      { key: 'flagHeat', label: t('flagHeat') },
                      { key: 'flagMatting', label: t('flagMatting') },
                    ].map((fl) => (
                      <label key={fl.key} className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-secondary-200">
                        <input
                          type="checkbox"
                          checked={petFlags.includes(fl.label)}
                          onChange={(e) => {
                            if (e.target.checked) setPetFlags([...petFlags, fl.label]);
                            else setPetFlags(petFlags.filter((f) => f !== fl.label));
                          }}
                          className="h-4 w-4 rounded-sm text-primary-600"
                        />
                        <span>{fl.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Cat separate room flag */}
                {cfg.features?.includes('cats_separate_room_flag') && (
                  <div className="bg-white p-3 rounded-lg border border-secondary-200">
                    <label className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={catQuietRoom}
                        onChange={(e) => setCatQuietRoom(e.target.checked)}
                        className="h-4 w-4 rounded-sm text-primary-600"
                      />
                      <span className="text-xs font-semibold text-secondary-900">{t('catQuietRoom')}</span>
                    </label>
                  </div>
                )}

                {/* Photo Picker (Prototype) */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-secondary-700 mb-1">
                    {t('photoPicker')}
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        const reader = new FileReader();
                        reader.onload = (ev) => setPetPhoto(ev.target?.result as string);
                        reader.readAsDataURL(e.target.files[0]);
                      }
                    }}
                    className="block w-full text-xs text-secondary-500 file:mr-3 file:py-2 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  />
                  {petPhoto && (
                    <img src={petPhoto} alt="Pet preview" className="mt-2 h-16 w-16 rounded-lg object-cover border" />
                  )}
                </div>
              </div>
            )}

            {/* Beauty Intake Section */}
            {isBeauty && (
              <div className="rounded-2xl border border-secondary-200 bg-secondary-50/50 p-6 space-y-4">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-accent" style={{ color: 'var(--accent)' }} />
                  <h4 className="font-bold text-secondary-900">{t('skinAnalysisTitle')}</h4>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-700">
                      {t('skinType')}
                    </label>
                    <select
                      value={skinType}
                      onChange={(e) => setSkinType(e.target.value)}
                      className="mt-1 w-full rounded-lg border border-secondary-300 p-2.5 text-sm bg-white"
                    >
                      <option value="Normaal">{t('normal')}</option>
                      <option value="Droog">{t('dry')}</option>
                      <option value="Gevoelig">{t('sensitive')}</option>
                      <option value="Gecombineerd">{t('combination')}</option>
                      <option value="Rijpere huid">{t('mature')}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-secondary-700">
                      {t('skinAllergies')}
                    </label>
                    <input
                      type="text"
                      value={skinAllergies}
                      onChange={(e) => setSkinAllergies(e.target.value)}
                      placeholder="Bijv. etherische oliën"
                      className="mt-1 w-full rounded-lg border border-secondary-300 p-2.5 text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="bg-white p-3 rounded-lg border border-secondary-200">
                  <label className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={startCourse}
                      onChange={(e) => setStartCourse(e.target.checked)}
                      className="h-4 w-4 rounded-sm text-primary-600"
                    />
                    <span className="text-xs font-semibold text-secondary-900">{t('startCourse')}</span>
                  </label>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-secondary-700">
                {t('notes')}
              </label>
              <textarea
                rows={3}
                value={clientNotes}
                onChange={(e) => setClientNotes(e.target.value)}
                placeholder="Bijzondere wensen of opmerkingen..."
                className="mt-1 w-full rounded-lg border border-secondary-300 p-2.5 text-sm"
              />
            </div>

            <div className="flex justify-between pt-4">
              <Button type="button" variant="outline" leftIcon={<ChevronLeft className="h-4 w-4" />} onClick={() => setStep(3)}>
                {t('prevStep')}
              </Button>
              <Button type="submit" rightIcon={<ChevronRight className="h-4 w-4" />}>
                {locale === 'nl' ? 'Volgende: Overzicht' : 'Next: Review'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* STEP 5: Review Summary & Confirm Dialog */}
      {step === 5 && selectedService && selectedSlot && (
        <Card>
          <Card.Header>
            <Card.Title>{t('step5Title')}</Card.Title>
            <Card.Description>{t('step5Subtitle')}</Card.Description>
          </Card.Header>

          <div className="divide-y divide-secondary-100 rounded-xl border border-secondary-200 bg-secondary-50/50 p-4 text-sm">
            <div className="flex justify-between py-2">
              <span className="text-secondary-500">{t('salon')}</span>
              <span className="font-bold text-secondary-900">{cfg.client} ({cfg.city})</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-secondary-500">{t('service')}</span>
              <span className="font-bold text-secondary-900">{selectedService.name}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-secondary-500">{t('duration')}</span>
              <span className="font-semibold text-secondary-800">
                {selectedService.duration_min}m (+ {selectedService.buffer_min}m buffer)
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-secondary-500">{t('dateTime')}</span>
              <span className="font-bold text-primary-700">{selectedDate} om {selectedSlot.time} uur</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-secondary-500">{t('priceSample')}</span>
              <span className="font-extrabold text-accent" style={{ color: 'var(--accent)' }}>
                €{isStudent && selectedService.student_price_eur ? selectedService.student_price_eur : selectedService.price_eur}
              </span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-secondary-500">{t('fullName')}</span>
              <span className="font-medium">{clientName} ({clientPhone})</span>
            </div>
            {isGrooming && petName && (
              <div className="flex justify-between py-2">
                <span className="text-secondary-500">{t('petName')}</span>
                <span className="font-medium">🐾 {petName} ({petBreed}, {petSpecies})</span>
              </div>
            )}
          </div>

          {/* Cancellation Notice */}
          <div className="mt-4 rounded-xl border border-info-200 bg-info-50 p-3.5 text-xs text-info-800">
            <strong>{t('cancellationPolicyNotice')}</strong> {cfg.cancellation_policy || 'Kosteloos annuleren tot 24 uur voor aanvang.'}
          </div>

          <div className="mt-8 flex justify-between">
            <Button variant="outline" leftIcon={<ChevronLeft className="h-4 w-4" />} onClick={() => setStep(4)}>
              {t('prevStep')}
            </Button>
            <Button variant="primary" onClick={handleConfirmBooking}>
              {t('confirmBookingBtn')} &rarr;
            </Button>
          </div>
        </Card>
      )}

      {/* STEP 6: Confirmation Screen & Post-Booking Actions */}
      {step === 6 && confirmedBooking && (
        <Card className="text-center p-8 sm:p-10">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-100 text-success-600 mb-4">
            <CheckCircle2 className="h-10 w-10" />
          </div>

          <h3 className="text-2xl font-black text-secondary-900">{t('confirmedTitle')}</h3>
          <p className="mt-1 text-sm text-secondary-600">{t('confirmedSubtitle')}</p>

          <div className="mx-auto my-6 max-w-md divide-y divide-secondary-100 rounded-xl border border-secondary-200 bg-secondary-50 p-4 text-left text-sm">
            <div className="flex justify-between py-2">
              <span className="text-secondary-500">{t('refNumber')}</span>
              <span className="font-mono font-bold text-secondary-900">#{confirmedBooking.id.toUpperCase()}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-secondary-500">{t('status')}</span>
              <Badge variant={confirmedBooking.status === 'confirmed' ? 'success' : 'danger'}>
                {confirmedBooking.status}
              </Badge>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-secondary-500">{t('service')}</span>
              <span className="font-semibold">{confirmedBooking.service_name}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-secondary-500">{t('dateTime')}</span>
              <span className="font-bold">{confirmedBooking.date} • {confirmedBooking.start_time}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Mail className="h-4 w-4" />}
              onClick={handleSimulateReminder}
            >
              {t('sendReminderSimulated')}
            </Button>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="h-4 w-4" />}
              onClick={handleReschedule}
            >
              {t('rescheduleBtn')}
            </Button>

            <Button
              variant="destructive"
              size="sm"
              leftIcon={<XCircle className="h-4 w-4" />}
              onClick={handleCancelBooking}
            >
              {t('cancelBookingBtn')}
            </Button>
          </div>

          {/* Rebooking Nudge Card */}
          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-accent/40 bg-surface/50 p-5 text-left shadow-xs">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-accent" style={{ color: 'var(--accent)' }} />
              <h4 className="font-bold text-secondary-900">
                {isHair ? t('nudgeHairTitle') : isBeauty ? t('nudgeBeautyTitle') : t('nudgeGroomingTitle')}
              </h4>
            </div>
            <p className="mt-1 text-xs text-secondary-600">
              {isHair ? t('nudgeHairDesc') : isBeauty ? t('nudgeBeautyDesc') : t('nudgeGroomingDesc')}
            </p>
            <Button size="sm" className="mt-3.5 w-full" onClick={handleRebook}>
              {t('rebookBtn')} &rarr;
            </Button>
          </div>

          <div className="mt-6">
            <button
              type="button"
              onClick={handleReset}
              className="text-xs font-semibold text-primary-600 hover:underline"
            >
              {t('newBookingBtn')}
            </button>
          </div>
        </Card>
      )}
    </div>
  );
}

