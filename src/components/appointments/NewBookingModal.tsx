import React, { useState, useMemo, useEffect } from 'react';
import { CalendarPlus, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  getAvailableSlots,
  formatDateYMD,
  parseDateYMD,
  getOpeningHoursForDay,
  getServiceBuffer,
  type SlotResult,
} from '@/core/slot-engine';
import type { SalonDataStore, BookingRecord, ServiceRecord } from '@/core/data-store';

// Subcomponents extracted for modularity & maintainability
import { CustomerStep } from './booking/CustomerStep';
import { TreatmentSpecialistStep } from './booking/TreatmentSpecialistStep';
import { GroomingPolicyChecklist } from './booking/GroomingPolicyChecklist';
import { TimeSlotPicker } from './booking/TimeSlotPicker';
import {
  BookingConfirmationDialog,
  type PendingBookingData,
} from './booking/BookingConfirmationDialog';

export interface NewBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: SalonDataStore;
  onBookingCreated?: (booking: BookingRecord) => void;
  isDark?: boolean;
  initialClientId?: string;
  isCustomerMode?: boolean;
}

export function NewBookingModal({
  isOpen,
  onClose,
  store,
  onBookingCreated,
  isDark = false,
  initialClientId,
  isCustomerMode = false,
}: NewBookingModalProps) {
  const { locale } = useI18n();
  const { toast } = useToast();

  const cfg = store.config;
  const isGrooming = Boolean(
    cfg?.type &&
      (cfg.type.toLowerCase().includes('animal') ||
        cfg.type.toLowerCase().includes('grooming') ||
        cfg.type.toLowerCase().includes('trim'))
  );

  // Default date
  const todayStr = useMemo(() => formatDateYMD(new Date()), []);

  // Form State
  const [clientMode, setClientMode] = useState<'existing' | 'new'>('existing');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [newClientName, setNewClientName] = useState<string>('');
  const [newClientPhone, setNewClientPhone] = useState<string>('');
  const [newClientEmail, setNewClientEmail] = useState<string>('');

  // Pet details if grooming
  const [petName, setPetName] = useState<string>('');
  const [petBreed, setPetBreed] = useState<string>('');

  // Domain Specialization states
  const [isStudentDiscount, setIsStudentDiscount] = useState<boolean>(false);
  const [agreeCancellation, setAgreeCancellation] = useState<boolean>(true);
  const [fleaTreated, setFleaTreated] = useState<boolean>(false);
  const [inHeat, setInHeat] = useState<boolean>(false);
  const [mattedCoat, setMattedCoat] = useState<boolean>(false);
  const [emergencyPhoneReachable, setEmergencyPhoneReachable] = useState<boolean>(true);
  const [catQuietRoom, setCatQuietRoom] = useState<boolean>(false);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Service, Staff, Date, Time
  const services = store.state.services || [];
  const staffList = store.config?.staff || [];
  const clients = store.state.clients || [];

  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [selectedStaffId, setSelectedStaffId] = useState<string>('first_available');
  const [selectedDate, setSelectedDate] = useState<string>(todayStr);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Stage 2 Confirm Dialog State & Pending Booking Data
  const [confirmDialogOpen, setConfirmDialogOpen] = useState<boolean>(false);
  const [pendingBooking, setPendingBooking] = useState<PendingBookingData | null>(null);

  // Initialize or reset when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialClientId) {
        setClientMode('existing');
        setSelectedClientId(initialClientId);
      } else if (clients.length > 0) {
        setClientMode('existing');
        setSelectedClientId(clients[0].id);
      } else {
        setClientMode('new');
        setSelectedClientId('');
      }
      if (services.length > 0 && !selectedServiceId) {
        setSelectedServiceId(services[0].id);
      }
      setSelectedDate(todayStr);
      setSelectedTime('');
      setNotes('');
      setNewClientName('');
      setNewClientPhone('');
      setNewClientEmail('');
      setPetName('');
      setPetBreed('');
      setIsStudentDiscount(false);
      setAgreeCancellation(true);
      setFleaTreated(false);
      setInHeat(false);
      setMattedCoat(false);
      setEmergencyPhoneReachable(true);
      setCatQuietRoom(false);
      setPhotoPreview(null);
      setConfirmDialogOpen(false);
      setPendingBooking(null);
    }
  }, [isOpen, todayStr]);

  // Selected Service object
  const currentService: ServiceRecord | undefined = useMemo(() => {
    return services.find((s) => s.id === selectedServiceId) || services[0];
  }, [services, selectedServiceId]);

  // Service buffer duration
  const bufferMin = useMemo(() => {
    return currentService ? getServiceBuffer(currentService) : 5;
  }, [currentService]);

  // Check if student pricing applies to this salon/service
  const hasStudentPricing = Boolean(
    cfg?.slug === 'kapsalon-van-haaren' ||
      cfg?.features?.includes('student_pricing') ||
      currentService?.student_price_eur
  );

  // Compute effective price reflecting student discount
  const effectivePrice = useMemo(() => {
    if (!currentService) return 0;
    if (isStudentDiscount && currentService.student_price_eur) {
      return currentService.student_price_eur;
    }
    return currentService.price_eur || 0;
  }, [currentService, isStudentDiscount]);

  // Compute available slots
  const slotData = useMemo(() => {
    if (!selectedDate || !currentService) {
      return { slots: [] as SlotResult[], isClosed: false };
    }
    const dateObj = parseDateYMD(selectedDate);
    const dayHours = getOpeningHoursForDay(store.config?.hours, dateObj.getDay());
    const isClosed = Boolean(dayHours.isClosed || !dayHours.isOpen);

    const slots = isClosed
      ? []
      : getAvailableSlots({
          clientConfig: store.config,
          service: currentService,
          staffId: selectedStaffId,
          dateStr: selectedDate,
          existingBookings: store.state.bookings,
        });

    return { slots, isClosed };
  }, [
    selectedDate,
    currentService,
    selectedStaffId,
    store.config,
    store.state.bookings,
  ]);

  // Handle client selection change
  const selectedExistingClient = useMemo(() => {
    return clients.find((c) => c.id === selectedClientId);
  }, [clients, selectedClientId]);

  // Step 1: Form Validation & Trigger Confirmation Dialog
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    let clientName = '';
    let clientPhone = '';
    let clientEmail = '';

    if (clientMode === 'existing') {
      if (!selectedExistingClient) {
        toast.error(locale === 'nl' ? 'Selecteer a.u.b. een klant.' : 'Please select a customer.');
        return;
      }
      clientName = selectedExistingClient.name;
      clientPhone = selectedExistingClient.phone;
      clientEmail = selectedExistingClient.email || '';
    } else {
      if (!newClientName.trim() || !newClientPhone.trim()) {
        toast.error(locale === 'nl' ? 'Vul minimaal klantnaam en telefoonnummer in.' : 'Please enter customer name and phone number.');
        return;
      }
      clientName = newClientName.trim();
      clientPhone = newClientPhone.trim();
      clientEmail = newClientEmail.trim();
    }

    if (!currentService) {
      toast.error(locale === 'nl' ? 'Selecteer een behandeling.' : 'Please select a treatment.');
      return;
    }

    if (!selectedDate) {
      toast.error(locale === 'nl' ? 'Selecteer een datum.' : 'Please select a date.');
      return;
    }

    if (!selectedTime) {
      toast.error(locale === 'nl' ? 'Selecteer een beschikbaar tijdslot.' : 'Please select an available time slot.');
      return;
    }

    if (!agreeCancellation) {
      toast.error(locale === 'nl' ? 'U dient akkoord te gaan met de 24-uurs annuleringsvoorwaarden.' : 'Please agree to the 24-hour cancellation policy.');
      return;
    }

    // Determine staff
    let assignedStaffId = selectedStaffId;
    let assignedStaffName = locale === 'nl' ? 'Eerst beschikbare specialist' : 'First available specialist';

    if (assignedStaffId === 'first_available') {
      const firstStaff = staffList[0];
      assignedStaffId = firstStaff ? firstStaff.id : 'staff-1';
      assignedStaffName = firstStaff ? firstStaff.name : (locale === 'nl' ? 'Eerst beschikbare specialist' : 'First available specialist');
    } else {
      const found = staffList.find((st) => st.id === assignedStaffId);
      if (found) assignedStaffName = found.name;
    }

    const petData =
      isGrooming && petName.trim()
        ? {
            name: petName.trim(),
            species:
              currentService.name.toLowerCase().includes('cat') ||
              currentService.name.toLowerCase().includes('kat')
                ? 'Kat'
                : 'Hond',
            breed: petBreed.trim() || 'Rasloos',
            separate_room_flag: catQuietRoom,
            photo_preview: photoPreview,
            medical_flags: [
              ...(fleaTreated ? ['Recent behandeld tegen vlooien/teken'] : []),
              ...(inHeat ? ['Momenteel loops'] : []),
              ...(mattedCoat ? ['Ernstige klitten / vilt aanwezig'] : []),
              ...(emergencyPhoneReachable ? ['Noodnummer direct bereikbaar'] : []),
            ],
          }
        : undefined;

    // Set pending data and open Confirmation Dialog
    setPendingBooking({
      clientName,
      clientPhone,
      clientEmail,
      assignedStaffId,
      assignedStaffName,
      service: currentService,
      date: selectedDate,
      time: selectedTime,
      price: effectivePrice,
      isStudent: isStudentDiscount,
      notes: notes.trim() || undefined,
      pet: petData,
    });

    setConfirmDialogOpen(true);
  };

  // Step 2: Final Confirmation & Database Store Write
  const handleExecuteBooking = () => {
    if (!pendingBooking) return;

    setSubmitting(true);
    try {
      const newBooking = store.addBooking({
        client_name: pendingBooking.clientName,
        client_phone: pendingBooking.clientPhone,
        client_email: pendingBooking.clientEmail,
        service_id: pendingBooking.service.id,
        service_name: pendingBooking.service.name,
        staff_id: pendingBooking.assignedStaffId,
        staff_name: pendingBooking.assignedStaffName,
        date: pendingBooking.date,
        start_time: pendingBooking.time,
        price_eur: pendingBooking.price,
        is_student: pendingBooking.isStudent,
        notes: pendingBooking.notes,
        pet: pendingBooking.pet,
        status: 'confirmed',
      });

      // Award loyalty points to client (10 points per 1 EUR spent)
      const pointsEarned = Math.round((pendingBooking.price || 35) * 10);
      const matchingClient = clients.find(
        (c) => c.name.toLowerCase() === pendingBooking.clientName.toLowerCase() || c.id === selectedClientId
      );
      if (matchingClient) {
        store.addLoyaltyPoints(matchingClient.id, pointsEarned);
      }

      toast.success(
        locale === 'nl'
          ? `Afspraak definitief bevestigd voor ${pendingBooking.clientName} op ${pendingBooking.date} om ${pendingBooking.time}! (+${pointsEarned} loyalty punten verdiend)`
          : `Appointment confirmed for ${pendingBooking.clientName} on ${pendingBooking.date} at ${pendingBooking.time}! (+${pointsEarned} loyalty points earned)`
      );

      onBookingCreated?.(newBooking);
      setConfirmDialogOpen(false);
      onClose();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : (locale === 'nl' ? 'Kon afspraak niet definitief inplannen.' : 'Could not create appointment.')
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          className={cn(
            'max-w-2xl w-full p-0 overflow-hidden rounded-2xl shadow-2xl border transition-all',
            isDark
              ? 'bg-[#14141c] border-[#292938] text-white'
              : 'bg-white border-secondary-200 text-secondary-900'
          )}
        >
          {/* Modal Header */}
          <DialogHeader
            className={cn(
              'px-6 py-4.5 border-b flex flex-row items-center justify-between',
              isDark
                ? 'bg-[#181822] border-[#262636]'
                : 'bg-secondary-50/80 border-secondary-200'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'p-2.5 rounded-xl shadow-xs flex items-center justify-center text-white',
                  isDark ? 'bg-[#7c3aed]' : 'bg-primary-600'
                )}
                style={!isDark ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
              >
                <CalendarPlus className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className={cn('text-base sm:text-lg font-bold leading-tight', isDark ? 'text-white' : 'text-secondary-900')}>
                  {locale === 'nl' ? 'Nieuwe Boeking Aanmaken' : 'Create New Booking'}
                </DialogTitle>
                <p className={cn('text-xs mt-0.5', isDark ? 'text-slate-400' : 'text-secondary-500')}>
                  {locale === 'nl'
                    ? 'Snel afspraak inplannen in de salonagenda met automatische tijdslotcontrole.'
                    : 'Fast appointment scheduling with automatic 15-minute slot engine validation.'}
                </p>
              </div>
            </div>
          </DialogHeader>

          {/* Modal Form Body */}
          <form onSubmit={handleSubmit} className="px-6 py-5 space-y-5 max-h-[78vh] overflow-y-auto">
            {/* Step 1: Customer Selection Subcomponent */}
            <CustomerStep
              clientMode={clientMode}
              setClientMode={setClientMode}
              selectedClientId={selectedClientId}
              setSelectedClientId={setSelectedClientId}
              clients={clients}
              selectedExistingClient={selectedExistingClient}
              newClientName={newClientName}
              setNewClientName={setNewClientName}
              newClientPhone={newClientPhone}
              setNewClientPhone={setNewClientPhone}
              newClientEmail={newClientEmail}
              setNewClientEmail={setNewClientEmail}
              isGrooming={isGrooming}
              petName={petName}
              setPetName={setPetName}
              petBreed={petBreed}
              setPetBreed={setPetBreed}
              isCustomerMode={isCustomerMode}
              isDark={isDark}
            />

            {/* Step 2: Treatment & Specialist Subcomponent */}
            <TreatmentSpecialistStep
              services={services}
              selectedServiceId={selectedServiceId}
              onSelectServiceId={(id) => {
                setSelectedServiceId(id);
                setSelectedTime('');
              }}
              currentService={currentService}
              staffList={staffList}
              selectedStaffId={selectedStaffId}
              onSelectStaffId={(id) => {
                setSelectedStaffId(id);
                setSelectedTime('');
              }}
              hasStudentPricing={hasStudentPricing}
              isStudentDiscount={isStudentDiscount}
              setIsStudentDiscount={setIsStudentDiscount}
              isDark={isDark}
            />

            {/* Step 3: Domain Specialization Grooming Checklist Subcomponent */}
            <GroomingPolicyChecklist
              isGrooming={isGrooming}
              config={cfg}
              currentService={currentService}
              photoPreview={photoPreview}
              setPhotoPreview={setPhotoPreview}
              fleaTreated={fleaTreated}
              setFleaTreated={setFleaTreated}
              mattedCoat={mattedCoat}
              setMattedCoat={setMattedCoat}
              inHeat={inHeat}
              setInHeat={setInHeat}
              emergencyPhoneReachable={emergencyPhoneReachable}
              setEmergencyPhoneReachable={setEmergencyPhoneReachable}
              catQuietRoom={catQuietRoom}
              setCatQuietRoom={setCatQuietRoom}
              isDark={isDark}
            />

            {/* Step 4: 15-Minute Slot Engine & Date Picker Subcomponent */}
            <TimeSlotPicker
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              todayStr={todayStr}
              slotData={slotData}
              currentService={currentService}
              bufferMin={bufferMin}
              isDark={isDark}
            />

            {/* Step 5: Notes (Optional) */}
            <div>
              <label className={cn('text-xs font-bold uppercase tracking-wider mb-1 flex items-center gap-1.5', isDark ? 'text-slate-300' : 'text-secondary-700')}>
                <span>{locale === 'nl' ? '5. Notities / Bijzonderheden (optioneel)' : '5. Notes (optional)'}</span>
              </label>
              <input
                type="text"
                placeholder={locale === 'nl' ? 'bijv. Klant heeft voorkeur voor koffie, gevoelige hoofdhuid...' : 'e.g. Sensitive skin, prefer quiet room...'}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className={cn(
                  'w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500',
                  isDark ? 'bg-[#14141c] border-[#36364a] text-white' : 'bg-white border-secondary-300'
                )}
              />
            </div>

            {/* Step 6: 24-Hour Cancellation Policy Acceptance */}
            <div className="pt-2 border-t border-secondary-200 dark:border-[#262636]">
              <label className="flex items-start gap-2.5 cursor-pointer select-none text-xs">
                <input
                  type="checkbox"
                  required
                  checked={agreeCancellation}
                  onChange={(e) => setAgreeCancellation(e.target.checked)}
                  className="h-4 w-4 rounded accent-primary-600 cursor-pointer mt-0.5"
                />
                <span className={cn('text-[11px] leading-snug', isDark ? 'text-slate-300' : 'text-secondary-600')}>
                  {locale === 'nl'
                    ? 'Ik ga akkoord met de 24-uurs annuleringsvoorwaarden (kosteloos annuleren tot 24 uur voor aanvang van de afspraak).'
                    : 'I agree to the 24-hour cancellation policy (free cancellation up to 24h prior to appointment).'}
                </span>
              </label>
            </div>

            {/* Footer Action Bar */}
            <DialogFooter
              className={cn(
                'pt-4 border-t flex flex-col sm:flex-row items-center justify-between gap-3',
                isDark ? 'border-[#262636]' : 'border-secondary-200'
              )}
            >
              {/* Total Summary */}
              <div className="text-xs text-secondary-500 min-w-0">
                {currentService ? (
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-secondary-600 dark:text-slate-400">
                      {locale === 'nl' ? 'Totaal:' : 'Total:'}
                    </span>
                    <span className="font-extrabold text-sm text-secondary-900 dark:text-white font-mono">
                      €{effectivePrice.toFixed(2)}
                    </span>
                    <span className="text-[11px] text-secondary-400">
                      ({currentService.duration_min} min)
                    </span>
                    {isStudentDiscount && (
                      <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/30">
                        Student
                      </Badge>
                    )}
                  </div>
                ) : null}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onClose}
                  disabled={submitting}
                >
                  {locale === 'nl' ? 'Annuleren' : 'Cancel'}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={submitting || !selectedTime || (clientMode === 'new' && (!newClientName.trim() || !newClientPhone.trim())) || !agreeCancellation}
                  className="font-bold text-white shadow-md transition-all hover:opacity-95"
                  style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
                >
                  <ArrowRight className="h-4 w-4 mr-1.5" />
                  {locale === 'nl' ? 'Afspraak Aanmaken' : 'Create Booking'}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stage 2: Dedicated Appointment Confirmation Dialog */}
      <BookingConfirmationDialog
        open={confirmDialogOpen}
        onOpenChange={setConfirmDialogOpen}
        pendingBooking={pendingBooking}
        onConfirm={handleExecuteBooking}
        submitting={submitting}
        isDark={isDark}
      />
    </>
  );
}
