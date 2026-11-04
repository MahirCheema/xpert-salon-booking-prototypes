import { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Scissors,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Bell,
  CalendarClock,
  Sparkles,
  Heart,
  CreditCard,
  FileText,
  UserX,
  Trash2,
  Plus,
  Send,
  MapPin,
  ExternalLink,
  Share2,
  Printer,
  HeartHandshake,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageContainer } from '@/components/layout/PageContainer';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import {
  getAvailableSlots,
  getOpeningHoursForDay,
  parseDateYMD,
} from '@/core/slot-engine';
import type { SalonDataStore, BookingRecord } from '@/core/data-store';

export interface AppointmentDetailViewProps {
  booking: BookingRecord;
  onBack: () => void;
  store: SalonDataStore;
  isDark?: boolean;
  userRole?: 'admin' | 'customer';
  customerClientId?: string;
  customerName?: string;
}

export function AppointmentDetailView({
  booking: initialBooking,
  onBack,
  store,
  isDark = false,
  userRole = 'admin',
  customerClientId,
  customerName,
}: AppointmentDetailViewProps) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const confirm = useConfirm();

  // Keep booking synchronized with store in case of status/reschedule changes
  const activeBooking =
    store.state.bookings.find((b) => b.id === initialBooking.id) || initialBooking;

  // Authorization check: Customer cannot view an appointment dossier belonging to someone else
  const isAuthorized =
    userRole === 'admin' ||
    (customerClientId && activeBooking.client_id === customerClientId) ||
    (customerName && activeBooking.client_name.toLowerCase().includes(customerName.toLowerCase().split(' ')[0]));

  if (!isAuthorized) {
    return (
      <PageContainer size="default" className="py-16 text-center">
        <Card className="p-8 border-rose-300 dark:border-rose-900/40 text-center space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600">
            <XCircle className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold">
            {locale === 'nl' ? 'Toegang Geweigerd' : 'Access Denied'}
          </h2>
          <p className="text-xs text-secondary-500 dark:text-slate-400 max-w-sm mx-auto">
            {locale === 'nl'
              ? 'U heeft geen autorisatie om het dossier van een andere klant in te zien.'
              : 'You do not have authorization to view another customer\'s appointment dossier.'}
          </p>
          <Button variant="primary" size="sm" onClick={onBack}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            {locale === 'nl' ? 'Terug naar overzicht' : 'Back to appointments'}
          </Button>
        </Card>
      </PageContainer>
    );
  }

  const cfg = store.config;
  const isGrooming = Boolean(
    cfg?.type &&
      (cfg.type.toLowerCase().includes('animal') ||
        cfg.type.toLowerCase().includes('grooming') ||
        cfg.type.toLowerCase().includes('trim'))
  );
  const isBeauty = Boolean(
    cfg?.type && cfg.type.toLowerCase().includes('beauty')
  );

  // Reschedule Modal State
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [reschedDate, setReschedDate] = useState('2026-11-04');
  const [reschedSlot, setReschedSlot] = useState<string>('');
  const [aftercareOpen, setAftercareOpen] = useState(false);

  // Internal Notes input
  const [newNoteText, setNewNoteText] = useState('');

  // Compute available slots for reschedule
  const service = store.state.services.find(
    (s) => s.id === activeBooking.service_id
  );
  const availableReschedSlots = useMemo(() => {
    if (!reschedDate || !service) return [];
    const dateObj = parseDateYMD(reschedDate);
    const dayHours = getOpeningHoursForDay(store.config?.hours, dateObj.getDay());
    if (dayHours.isClosed || !dayHours.isOpen) return [];

    return getAvailableSlots({
      clientConfig: store.config,
      service,
      staffId: activeBooking.staff_id,
      dateStr: reschedDate,
      existingBookings: store.state.bookings.filter(
        (b) => b.id !== activeBooking.id
      ),
    });
  }, [reschedDate, service, activeBooking, store.config, store.state.bookings]);

  // Actions
  const handleSendReminder = () => {
    store.simulateReminder(activeBooking.id);
    toast.success(
      locale === 'nl'
        ? `Herinneringsbericht verzonden naar ${activeBooking.client_name} (${activeBooking.client_phone}).`
        : `Reminder message dispatched to ${activeBooking.client_name} (${activeBooking.client_phone}).`
    );
  };

  const handleMarkStatus = (status: 'completed' | 'no_show') => {
    store.updateBookingStatus(activeBooking.id, status);
    toast.success(
      locale === 'nl'
        ? status === 'completed'
          ? 'Afspraak gemarkeerd als voltooid.'
          : 'Afspraak gemarkeerd als no-show.'
        : `Appointment marked as ${status}.`
    );
  };

  const handleCancelBooking = async () => {
    const confirmed = await confirm({
      title: locale === 'nl' ? 'Afspraak annuleren?' : 'Cancel appointment?',
      description:
        locale === 'nl'
          ? `Weet u zeker dat u de afspraak van ${activeBooking.client_name} voor "${activeBooking.service_name}" op ${activeBooking.date} om ${activeBooking.start_time} wilt annuleren?`
          : `Are you sure you want to cancel the booking for ${activeBooking.client_name} on ${activeBooking.date} at ${activeBooking.start_time}?`,
      confirmText: locale === 'nl' ? 'Annuleren bevestigen' : 'Confirm cancellation',
      cancelText: t('cancel'),
      variant: 'danger',
    });

    if (confirmed) {
      store.cancelBooking(activeBooking.id);
      toast.info(
        locale === 'nl'
          ? `Afspraak voor ${activeBooking.client_name} is geannuleerd.`
          : `Booking for ${activeBooking.client_name} cancelled.`
      );
    }
  };

  const handleConfirmReschedule = () => {
    if (!reschedSlot) return;
    store.rescheduleBooking(activeBooking.id, reschedDate, reschedSlot);
    setRescheduleOpen(false);
    toast.success(
      locale === 'nl'
        ? `Afspraak succesvol verplaatst naar ${reschedDate} om ${reschedSlot}.`
        : `Appointment successfully rescheduled to ${reschedDate} at ${reschedSlot}.`
    );
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    const timestamp = new Date().toLocaleDateString(locale === 'nl' ? 'nl-NL' : 'en-GB', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
    const appended = activeBooking.notes
      ? `${activeBooking.notes}\n[${timestamp}] ${newNoteText.trim()}`
      : `[${timestamp}] ${newNoteText.trim()}`;

    // Update in store
    activeBooking.notes = appended;
    store.saveState();
    setNewNoteText('');
    toast.success(locale === 'nl' ? 'Notitie toegevoegd aan dossier.' : 'Note added to record.');
  };

  return (
    <PageContainer size="wide" className="space-y-6">
      {/* Top Navigation Bar: Back Button & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-secondary-200 dark:border-[#272733]">
        <button
          type="button"
          onClick={onBack}
          className={cn(
            'inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs border',
            isDark
              ? 'bg-[#181822] border-[#2c2c3d] text-slate-300 hover:text-white hover:bg-[#222230]'
              : 'bg-white border-secondary-200 text-secondary-700 hover:text-secondary-900 hover:bg-secondary-50'
          )}
        >
          <ArrowLeft className="h-4 w-4" />
          <span>{locale === 'nl' ? 'Terug naar Alle Boekingen' : 'Back to All Appointments'}</span>
        </button>

        {/* Action Controls for this Booking */}
        <div className="flex flex-wrap items-center gap-2">
          {activeBooking.status !== 'cancelled' && (
            <>
              {/* Rebooking Nudge (4-6 weeks) - P0 Feature across all salons */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  toast.success(
                    locale === 'nl'
                      ? `Herhaal-nudge verzonden! Klant ${activeBooking.client_name} ontvangt een SMS/WhatsApp voor de volgende knip-/behandelcyclus over 4-6 weken.`
                      : `Rebooking nudge sent! ${activeBooking.client_name} invited to schedule their 4-6 week follow-up session.`
                  );
                }}
                className="text-xs font-semibold text-purple-700 hover:bg-purple-50 dark:text-purple-300"
              >
                <Sparkles className="h-3.5 w-3.5 mr-1.5 text-purple-600" />
                {locale === 'nl' ? 'Herhaal-nudge (4-6 wk)' : 'Rebooking Nudge'}
              </Button>

              {/* Homecare / Aftercare Advice Sheet */}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setAftercareOpen(true)}
                className="text-xs font-semibold text-indigo-700 hover:bg-indigo-50 dark:text-indigo-300"
              >
                <HeartHandshake className="h-3.5 w-3.5 mr-1.5 text-indigo-600" />
                {locale === 'nl' ? 'Nazorgadvies' : 'Aftercare Sheet'}
              </Button>

              {/* Admin-only staff actions */}
              {userRole === 'admin' && (
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={handleSendReminder}
                  className="text-xs font-semibold"
                >
                  <Bell className="h-3.5 w-3.5 mr-1.5 text-primary-600" />
                  {locale === 'nl' ? 'Herinnering Sturen' : 'Send Reminder'}
                </Button>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setReschedDate(activeBooking.date || '2026-11-04');
                  setReschedSlot('');
                  setRescheduleOpen(true);
                }}
                className="text-xs font-semibold"
              >
                <CalendarClock className="h-3.5 w-3.5 mr-1.5 text-sky-600" />
                {locale === 'nl' ? 'Verplaatsen' : 'Reschedule'}
              </Button>

              {userRole === 'admin' && activeBooking.status === 'confirmed' && (
                <>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleMarkStatus('completed')}
                    className="text-xs font-semibold text-emerald-700 hover:bg-emerald-50 dark:text-emerald-400"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-emerald-600" />
                    {locale === 'nl' ? 'Voltooid' : 'Complete'}
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleMarkStatus('no_show')}
                    className="text-xs font-semibold text-amber-700 hover:bg-amber-50 dark:text-amber-400"
                  >
                    <UserX className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                    No-Show
                  </Button>
                </>
              )}

              <Button
                variant="secondary"
                size="sm"
                onClick={handleCancelBooking}
                className="text-xs font-semibold text-rose-700 hover:bg-rose-50 dark:text-rose-400"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1.5 text-rose-600" />
                {locale === 'nl' ? 'Annuleren' : 'Cancel'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Hero Header Card */}
      <Card
        className={cn(
          'p-5 sm:p-6 rounded-2xl border transition-colors',
          isDark
            ? 'bg-[#181822] border-[#29293a] text-white shadow-lg'
            : 'bg-white border-secondary-200 text-secondary-900 shadow-xs'
        )}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-4">
            <div
              className={cn(
                'h-14 w-14 rounded-2xl flex items-center justify-center text-white text-xl font-extrabold shadow-md shrink-0',
                isDark ? 'bg-[#7c3aed]' : 'bg-primary-600'
              )}
              style={!isDark ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
            >
              {activeBooking.client_name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight font-sans">
                  {activeBooking.client_name}
                </h1>
                <Badge
                  variant={
                    activeBooking.status === 'confirmed'
                      ? 'success'
                      : activeBooking.status === 'completed'
                      ? 'info'
                      : activeBooking.status === 'cancelled'
                      ? 'danger'
                      : 'warning'
                  }
                >
                  {activeBooking.status.toUpperCase()}
                </Badge>
                {activeBooking.is_sample && <Badge variant="sample">SAMPLE</Badge>}
              </div>
              <p className={cn('text-xs mt-1 flex items-center gap-2 flex-wrap font-medium', isDark ? 'text-slate-400' : 'text-secondary-500')}>
                <span>Dossier #{activeBooking.id}</span>
                <span>•</span>
                <span>{activeBooking.service_name}</span>
                <span>•</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">
                  {activeBooking.price_eur ? `€${activeBooking.price_eur.toFixed(2)}` : 'Prijs op aanvraag'}
                </span>
              </p>
            </div>
          </div>

          {/* Timing Pill Highlight */}
          <div
            className={cn(
              'px-4 py-3 rounded-xl border flex items-center gap-3 shrink-0',
              isDark
                ? 'bg-[#1e1e2c] border-[#323246]'
                : 'bg-secondary-50 border-secondary-200'
            )}
          >
            <Calendar className="h-5 w-5 text-primary-600 shrink-0" />
            <div>
              <p className="text-xs font-bold leading-tight">
                {activeBooking.date}
              </p>
              <p className="text-xs font-mono font-semibold text-secondary-500 dark:text-slate-400 mt-0.5">
                {activeBooking.start_time} - {activeBooking.end_time} ({activeBooking.duration_min} min)
              </p>
            </div>
          </div>
        </div>
      </Card>

      {/* Osman Ambulant & Call Verification Banner (De Kleinste Kapsalon) */}
      {cfg?.slug === 'de-kleinste-kapsalon' && (
        <Card className="p-4 bg-amber-500/10 border-amber-500/30 text-amber-950 dark:text-amber-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Phone className="h-4 w-4 text-amber-600 shrink-0" />
              <div>
                <p className="font-bold text-xs">{locale === 'nl' ? 'Telefonische Verificatie door Osman' : 'Osman Telephone Verification'}</p>
                <p className="text-[11px] opacity-85">
                  {locale === 'nl'
                    ? 'Bescherming tegen ambulant werkschema: afspraak is telefonisch geverifieerd door Osman.'
                    : 'Protection against mobile visits: customer booking verbally confirmed by Osman.'}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
              ✓ {locale === 'nl' ? 'Telefonisch Bevestigd' : 'Phone Confirmed'}
            </span>
          </div>
        </Card>
      )}

      {/* Bento Grid: 4 Core Information Panels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Panel 1: Customer Contact Dossier */}
        <Card
          className={cn(
            'p-5 rounded-2xl border space-y-4',
            isDark ? 'bg-[#181820] border-[#272733]' : 'bg-white border-secondary-200 shadow-xs'
          )}
        >
          <div className="flex items-center gap-2 pb-2 border-b border-secondary-200 dark:border-[#272733]">
            <User className="h-4 w-4 text-primary-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              {locale === 'nl' ? 'Klantprofiel & Contact' : 'Customer & Contact'}
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <p className="text-secondary-400 text-[11px] font-semibold">{locale === 'nl' ? 'Volledige Naam' : 'Full Name'}</p>
              <p className="font-bold text-secondary-900 dark:text-white mt-0.5">{activeBooking.client_name}</p>
            </div>

            <div>
              <p className="text-secondary-400 text-[11px] font-semibold">{locale === 'nl' ? 'Telefoonnummer' : 'Phone'}</p>
              <a
                href={`tel:${activeBooking.client_phone}`}
                className="font-mono font-bold text-primary-600 hover:underline flex items-center gap-1.5 mt-0.5"
              >
                <Phone className="h-3.5 w-3.5" />
                <span>{activeBooking.client_phone || 'Geen telefoonnummer'}</span>
              </a>
            </div>

            <div>
              <p className="text-secondary-400 text-[11px] font-semibold">{locale === 'nl' ? 'E-mailadres' : 'Email'}</p>
              <a
                href={activeBooking.client_email ? `mailto:${activeBooking.client_email}` : '#'}
                className="font-medium text-secondary-700 dark:text-slate-300 hover:underline flex items-center gap-1.5 mt-0.5 truncate"
              >
                <Mail className="h-3.5 w-3.5 text-secondary-400" />
                <span>{activeBooking.client_email || 'Geen e-mailadres geregistreerd'}</span>
              </a>
            </div>

            <div className="pt-2 border-t border-dashed border-secondary-200 dark:border-[#272733]">
              <div className="flex items-center justify-between text-[11px] text-secondary-500">
                <span>Herinnering SMS/Email:</span>
                <span className={cn('font-bold', activeBooking.reminder_sent ? 'text-emerald-600' : 'text-secondary-400')}>
                  {activeBooking.reminder_sent ? '✓ Verzonden' : 'Nog niet verstuurd'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Panel 2: Treatment & Financials */}
        <Card
          className={cn(
            'p-5 rounded-2xl border space-y-4',
            isDark ? 'bg-[#181820] border-[#272733]' : 'bg-white border-secondary-200 shadow-xs'
          )}
        >
          <div className="flex items-center gap-2 pb-2 border-b border-secondary-200 dark:border-[#272733]">
            <Scissors className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              {locale === 'nl' ? 'Behandeling & Tarieven' : 'Treatment & Billing'}
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <p className="text-secondary-400 text-[11px] font-semibold">{locale === 'nl' ? 'Gekozen Behandeling' : 'Selected Service'}</p>
              <p className="font-bold text-secondary-900 dark:text-white mt-0.5">{activeBooking.service_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-secondary-400 text-[11px] font-semibold">{locale === 'nl' ? 'Behandelduur' : 'Duration'}</p>
                <p className="font-mono font-bold text-secondary-800 dark:text-slate-200 mt-0.5">
                  {activeBooking.duration_min} minuten
                </p>
              </div>
              <div>
                <p className="text-secondary-400 text-[11px] font-semibold">{locale === 'nl' ? 'Schoonmaakbuffer' : 'Buffer'}</p>
                <p className="font-mono font-bold text-secondary-800 dark:text-slate-200 mt-0.5">
                  {activeBooking.buffer_min || 5} minuten
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-secondary-50 dark:bg-[#14141c] border border-secondary-200 dark:border-[#29293a] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary-500">Subtotaal:</span>
                <span className="font-mono font-semibold">
                  {activeBooking.price_eur ? `€${(activeBooking.price_eur * 0.79).toFixed(2)}` : '€0.00'}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-secondary-500">BTW (21%):</span>
                <span className="font-mono font-semibold">
                  {activeBooking.price_eur ? `€${(activeBooking.price_eur * 0.21).toFixed(2)}` : '€0.00'}
                </span>
              </div>
              {activeBooking.is_student && (
                <div className="flex items-center justify-between text-xs text-blue-700 dark:text-blue-300 font-bold bg-blue-50 dark:bg-blue-950/60 px-2 py-1 rounded-lg border border-blue-200 dark:border-blue-900/50">
                  <span>🎓 Studententarief:</span>
                  <span>Geldig college-ID</span>
                </div>
              )}
              <div className="flex items-center justify-between text-xs font-bold pt-1 border-t border-secondary-200 dark:border-[#29293a]">
                <span>Totaalbedrag:</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">
                  {activeBooking.price_eur ? `€${activeBooking.price_eur.toFixed(2)}` : 'Op aanvraag'}
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Panel 3: Specialist & Scheduling Details */}
        <Card
          className={cn(
            'p-5 rounded-2xl border space-y-4',
            isDark ? 'bg-[#181820] border-[#272733]' : 'bg-white border-secondary-200 shadow-xs'
          )}
        >
          <div className="flex items-center gap-2 pb-2 border-b border-secondary-200 dark:border-[#272733]">
            <Clock className="h-4 w-4 text-sky-600" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              {locale === 'nl' ? 'Specialist & Planning' : 'Staff & Timing'}
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <p className="text-secondary-400 text-[11px] font-semibold">{locale === 'nl' ? 'Toegewezen Specialist' : 'Assigned Specialist'}</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="h-7 w-7 rounded-lg bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 font-bold flex items-center justify-center text-xs">
                  {activeBooking.staff_name.charAt(0)}
                </div>
                <span className="font-bold text-secondary-900 dark:text-white">{activeBooking.staff_name}</span>
              </div>
            </div>

            <div>
              <p className="text-secondary-400 text-[11px] font-semibold">{locale === 'nl' ? 'Datum' : 'Date'}</p>
              <p className="font-mono font-bold text-secondary-900 dark:text-white mt-0.5">{activeBooking.date}</p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-secondary-400 text-[11px] font-semibold">{locale === 'nl' ? 'Aanvangstijd' : 'Start Time'}</p>
                <p className="font-mono font-bold text-primary-600 mt-0.5">{activeBooking.start_time}</p>
              </div>
              <div>
                <p className="text-secondary-400 text-[11px] font-semibold">{locale === 'nl' ? 'Verwacht Einde' : 'End Time'}</p>
                <p className="font-mono font-bold text-secondary-700 dark:text-slate-300 mt-0.5">{activeBooking.end_time}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-dashed border-secondary-200 dark:border-[#272733] text-[11px] text-secondary-500">
              <span>Slot-controle: <strong>15-minuten interval gevalideerd</strong></span>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 2: Specialized Pet/Beauty Dossier & Salon Notes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Specialized Dossier (Grooming / Beauty / Hair) */}
        {isGrooming && activeBooking.pet_data ? (
          <Card
            className={cn(
              'p-5 rounded-2xl border space-y-3.5',
              isDark ? 'bg-[#181820] border-[#272733]' : 'bg-rose-50/50 border-rose-200'
            )}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-rose-200 dark:border-[#272733]">
              <Heart className="h-4 w-4 text-rose-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-950 dark:text-rose-300">
                {locale === 'nl' ? 'Gekoppeld Huisdierdossier' : 'Associated Pet Record'}
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-rose-950 dark:text-slate-300">
              <div className="flex items-center justify-between">
                <span className="font-bold text-base text-rose-900 dark:text-white">
                  🐾 {activeBooking.pet_data.name}
                </span>
                <Badge variant="default">
                  {activeBooking.pet_data.species} • {activeBooking.pet_data.breed}
                </Badge>
              </div>

              {activeBooking.pet_data.coat && (
                <p className="text-xs">
                  <strong>Vachttype:</strong> {activeBooking.pet_data.coat}
                </p>
              )}

              {activeBooking.pet_data.behaviour_notes && (
                <p className="text-xs">
                  <strong>Gedrag & Omvang:</strong> {activeBooking.pet_data.behaviour_notes}
                </p>
              )}

              {/* Grooming Health & Pre-Visit Flags (Hofje, Limbo, Finn, Violetta) */}
              {activeBooking.pet_data.medical_flags && activeBooking.pet_data.medical_flags.length > 0 && (
                <div className="pt-1.5 border-t border-rose-200/80 dark:border-rose-900/40 space-y-1">
                  <p className="font-bold text-rose-900 dark:text-rose-400 text-[11px]">Intake Gezondheid & Vlaggen:</p>
                  <div className="flex flex-wrap gap-1">
                    {activeBooking.pet_data.medical_flags.map((fl: string, idx: number) => (
                      <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                        ✓ {fl}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {activeBooking.intake_notes && (
                <div className="p-2.5 rounded-lg bg-white/80 dark:bg-[#121218] border border-rose-200 dark:border-[#2b2b3b] text-xs">
                  <p className="font-bold text-rose-900 dark:text-rose-400 mb-0.5">Intake Opmerking:</p>
                  <p>{activeBooking.intake_notes}</p>
                </div>
              )}
            </div>
          </Card>
        ) : (
          <Card
            className={cn(
              'p-5 rounded-2xl border space-y-3.5',
              isDark ? 'bg-[#181820] border-[#272733]' : 'bg-white border-secondary-200 shadow-xs'
            )}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-secondary-200 dark:border-[#272733]">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {locale === 'nl' ? 'Salon Dossier & Receptuur' : 'Treatment & Formula Dossier'}
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              {/* Chemical Hair Colour Formula (Kapsalon Headline & Hair Salons) */}
              <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/25 text-purple-950 dark:text-purple-200">
                <p className="font-bold text-xs flex items-center gap-1.5">
                  <Scissors className="h-3.5 w-3.5 text-purple-600" />
                  <span>{locale === 'nl' ? 'Kleur- & Behandelreceptuur' : 'Colour & Treatment Formula'}</span>
                </p>
                <p className="text-[11px] mt-1 font-mono">
                  {activeBooking.service_name.toLowerCase().includes('colour') ||
                  activeBooking.service_name.toLowerCase().includes('kleur') ||
                  activeBooking.service_name.toLowerCase().includes('highlight')
                    ? 'Formule: Majirel 7.1 (30g) + 20 Vol (45g) • Gloss toner 9.21 • Inwerktijd: 35 min'
                    : 'Standaard knip- en stylingprotocol. Geen chemische kleurbehandeling geregistreerd.'}
                </p>
              </div>

              {/* Next Cut Cycle (4-6 weeks) */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary-50 dark:bg-[#121218] border border-secondary-200 dark:border-[#272733]">
                <div>
                  <p className="font-bold text-secondary-900 dark:text-white">{locale === 'nl' ? 'Aanbevolen Knipcyclus' : 'Next Cut Cycle'}</p>
                  <p className="text-[10px] text-secondary-500">{locale === 'nl' ? 'Optimale interval voor modelbehoud' : 'Optimal interval for style retention'}</p>
                </div>
                <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400">
                  4 - 6 {locale === 'nl' ? 'weken' : 'weeks'}
                </span>
              </div>
            </div>
          </Card>
        )}

        {/* Panel: Internal Notes for Admin OR Customer Booking Guidelines */}
        {userRole === 'admin' ? (
          <Card
            className={cn(
              'p-5 rounded-2xl border space-y-4',
              isDark ? 'bg-[#181820] border-[#272733]' : 'bg-white border-secondary-200 shadow-xs'
            )}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-secondary-200 dark:border-[#272733]">
              <FileText className="h-4 w-4 text-violet-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {locale === 'nl' ? 'Interne Salon Notities' : 'Internal Salon Notes'}
              </h3>
            </div>

            {/* Existing notes */}
            <div className="min-h-24 p-3 rounded-xl bg-secondary-50 dark:bg-[#121218] border border-secondary-200 dark:border-[#282838] text-xs space-y-1">
              {activeBooking.notes ? (
                <pre className="whitespace-pre-wrap font-sans text-secondary-800 dark:text-slate-200">
                  {activeBooking.notes}
                </pre>
              ) : (
                <p className="text-secondary-400 italic">
                  {locale === 'nl' ? 'Nog geen notities genoteerd voor deze afspraak.' : 'No notes recorded yet.'}
                </p>
              )}
            </div>

            {/* Add new note form */}
            <form onSubmit={handleAddNote} className="flex gap-2">
              <input
                type="text"
                placeholder={locale === 'nl' ? 'Notitie toevoegen aan dossier...' : 'Add a note to dossier...'}
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className={cn(
                  'flex-1 px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500',
                  isDark ? 'bg-[#121218] border-[#36364a] text-white' : 'bg-white border-secondary-300'
                )}
              />
              <Button type="submit" variant="primary" size="sm" className="shrink-0 text-xs font-bold">
                <Send className="h-3 w-3 mr-1" />
                {locale === 'nl' ? 'Toevoegen' : 'Add'}
              </Button>
            </form>
          </Card>
        ) : (
          <Card
            className={cn(
              'p-5 rounded-2xl border space-y-4',
              isDark ? 'bg-[#181820] border-[#272733]' : 'bg-white border-secondary-200 shadow-xs'
            )}
          >
            <div className="flex items-center gap-2 pb-2 border-b border-secondary-200 dark:border-[#272733]">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {locale === 'nl' ? 'Klantengarantie & Servicevoorwaarden' : 'Customer Guarantee & Terms'}
              </h3>
            </div>
            <div className="space-y-3 text-xs leading-relaxed text-secondary-600 dark:text-slate-300">
              <p>
                ✓ <strong>{locale === 'nl' ? 'Kosteloos Verplaatsen:' : 'Free Rescheduling:'}</strong>{' '}
                {locale === 'nl'
                  ? 'U kunt uw afspraak tot 24 uur van tevoren kosteloos verplaatsen of annuleren via dit portaal.'
                  : 'You can reschedule or cancel free of charge up to 24 hours prior to your visit.'}
              </p>
              <p>
                ✓ <strong>{locale === 'nl' ? '100% Tevredenheidsgarantie:' : '100% Satisfaction Guarantee:'}</strong>{' '}
                {locale === 'nl'
                  ? 'Niet geheel tevreden over uw knip-, kleur- of trimresultaat? Kom binnen 7 dagen langs voor een gratis correctie.'
                  : 'Not completely satisfied? Return within 7 days for a complimentary touch-up.'}
              </p>
              <div className="p-3 rounded-xl bg-primary-50 dark:bg-purple-950/40 border border-primary-200 dark:border-purple-800/40 text-primary-900 dark:text-purple-300 font-semibold text-[11px]">
                {locale === 'nl'
                  ? 'Spaarpunten worden direct bij het afrekenen in de salon bijgeschreven op uw loyalty saldo.'
                  : 'Loyalty points are credited directly to your account upon checkout.'}
              </div>
            </div>
          </Card>
        )}
      </div>

      {/* Reschedule Modal */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{locale === 'nl' ? 'Afspraak Verplaatsen' : 'Reschedule Booking'}</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-4 space-y-4 text-xs">
            <div className="p-3 rounded-lg bg-secondary-50 dark:bg-[#191924] border border-secondary-200 dark:border-[#2b2b3b]">
              <p className="font-bold text-secondary-900 dark:text-white">{activeBooking.client_name}</p>
              <p className="text-secondary-600 dark:text-slate-400">
                {activeBooking.service_name} • Huidig: {activeBooking.date} om {activeBooking.start_time}
              </p>
            </div>

            <div>
              <label className="block font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                {locale === 'nl' ? 'Selecteer nieuwe datum:' : 'Select new date:'}
              </label>
              <input
                type="date"
                value={reschedDate}
                onChange={(e) => {
                  setReschedDate(e.target.value);
                  setReschedSlot('');
                }}
                className={cn(
                  'w-full p-2 border rounded-lg text-xs',
                  isDark ? 'bg-[#121218] border-[#333345] text-white' : 'bg-white border-secondary-300'
                )}
              />
            </div>

            <div>
              <label className="block font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                {locale === 'nl' ? 'Kies nieuw tijdslot (15-minuten interval):' : 'Choose new slot (15m interval):'}
              </label>
              {availableReschedSlots.length === 0 ? (
                <p className="text-rose-600 py-2">
                  {locale === 'nl'
                    ? 'Geen beschikbare tijden op deze dag.'
                    : 'No slots available on this date.'}
                </p>
              ) : (
                <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                  {availableReschedSlots.map((s) => (
                    <button
                      key={s.time}
                      type="button"
                      onClick={() => setReschedSlot(s.time)}
                      className={cn(
                        'p-2 rounded border text-center font-mono text-xs font-semibold cursor-pointer transition-colors',
                        reschedSlot === s.time
                          ? 'bg-primary-600 text-white border-primary-600'
                          : isDark
                          ? 'bg-[#191924] border-[#2f2f40] text-slate-200 hover:border-primary-500'
                          : 'border-secondary-300 hover:border-primary-500 bg-white text-secondary-900'
                      )}
                      style={
                        reschedSlot === s.time && !isDark
                          ? { backgroundColor: 'var(--primary, #2563eb)' }
                          : undefined
                      }
                    >
                      {s.time}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setRescheduleOpen(false)}>
              {t('cancel')}
            </Button>
            <Button
              variant="primary"
              disabled={!reschedSlot}
              onClick={handleConfirmReschedule}
            >
              {locale === 'nl' ? 'Verplaatsen Bevestigen' : 'Confirm Reschedule'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Post-Treatment Homecare Advice Sheet Modal */}
      <Dialog open={aftercareOpen} onOpenChange={setAftercareOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base">
              <HeartHandshake className="h-5 w-5 text-indigo-600" />
              <span>{locale === 'nl' ? 'Thuisverzorgings- & Nazorgprotocol' : 'Post-Treatment Homecare Advice Sheet'}</span>
            </DialogTitle>
            <p className="text-xs text-secondary-500 mt-0.5">
              {locale === 'nl'
                ? `Officieel nazorgadvies voor ${activeBooking.client_name} na ${activeBooking.service_name}.`
                : `Official aftercare instructions for ${activeBooking.client_name} for ${activeBooking.service_name}.`}
            </p>
          </DialogHeader>

          <div className="px-6 py-4 space-y-4 text-xs">
            {isGrooming ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 space-y-1.5 text-amber-900 dark:text-amber-200">
                  <h4 className="font-bold flex items-center gap-1.5">
                    🐾 {locale === 'nl' ? 'Vachtverzorging na de trimbeurt' : 'Coat care post-grooming'}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                    <li>{locale === 'nl' ? 'Wacht minimaal 48 uur voordat u het dier opnieuw in bad doet of laat zwemmen.' : 'Wait 48 hours before bathing or swimming.'}</li>
                    <li>{locale === 'nl' ? 'Borstel gevoelige wrijvingszones (oksels, achter de oren, broek) dagelijks met een slickerborstel.' : 'Brush friction zones daily (armpits, ears, trousers) with a slicker brush.'}</li>
                    <li>{locale === 'nl' ? 'Droog de vacht na regen met een handdoek; vermijd kammen in natte vilten vacht.' : 'Towel dry after rain; avoid combing soaked matted fur.'}</li>
                  </ul>
                </div>
              </div>
            ) : isBeauty ? (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-900/50 space-y-1.5 text-purple-900 dark:text-purple-200">
                  <h4 className="font-bold flex items-center gap-1.5">
                    ✨ {locale === 'nl' ? 'Klinisch huid- & laser nazorgprotocol' : 'Clinical skin & laser aftercare'}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                    <li>{locale === 'nl' ? 'Vermijd 48 uur lang directe zon, zonnebank, sauna en intensieve workouts.' : 'Avoid direct sun, sunbeds, saunas, and intense workouts for 48 hours.'}</li>
                    <li>{locale === 'nl' ? 'Breng dagelijks een breedspectrum SPF50 zonbescherming aan, ook binnenshuis.' : 'Apply broad-spectrum SPF50 daily, even indoors.'}</li>
                    <li>{locale === 'nl' ? 'Gebruik uitsluitend kalmerende barrièrecrème (panthenol/hyaluronzuur); vermijd scrubs/retinol 5 dagen.' : 'Use calming barrier cream; avoid scrubs/retinoids for 5 days.'}</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900/50 space-y-1.5 text-blue-900 dark:text-blue-200">
                  <h4 className="font-bold flex items-center gap-1.5">
                    ✂️ {locale === 'nl' ? 'Kleurbehoud & Haarstyling nazorg' : 'Color lock & styling care'}
                  </h4>
                  <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                    <li>{locale === 'nl' ? 'Was het haar de eerste 48 uur niet om de kleurpigmenten optimaal in te sluiten.' : 'Do not wash hair for the first 48 hours to seal pigment.'}</li>
                    <li>{locale === 'nl' ? 'Gebruik een sulfaatvrije shampoo en lauw water om dofheid te voorkomen.' : 'Use sulfate-free shampoo and lukewarm water.'}</li>
                    <li>{locale === 'nl' ? 'Gebruik altijd een hittebeschermer tot 230°C vóór het föhnen of stijlen.' : 'Apply thermal heat protectant spray up to 230°C before blow-drying.'}</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-wrap items-center justify-between gap-2 px-6 py-4 bg-secondary-50 dark:bg-[#151520] border-t border-secondary-200 dark:border-[#272733]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== 'undefined') window.print();
              }}
              className="text-xs"
            >
              <Printer className="h-3.5 w-3.5 mr-1.5" />
              {locale === 'nl' ? 'Afdrukken' : 'Print'}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => {
                toast.success(
                  locale === 'nl'
                    ? `Nazorgadvies gekopieerd naar klembord voor ${activeBooking.client_name}!`
                    : `Aftercare text copied to clipboard for ${activeBooking.client_name}!`
                );
                setAftercareOpen(false);
              }}
              className="text-xs font-bold"
            >
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              {locale === 'nl' ? 'Kopieer voor WhatsApp/SMS' : 'Copy for WhatsApp/SMS'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

