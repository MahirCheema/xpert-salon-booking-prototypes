import { useState, useEffect } from 'react';
import {
  CalendarCheck,
  Search,
  Plus,
  Clock,
  User,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Mail,
  Phone,
  MoreVertical,
  Eye,
  Bell,
  CalendarClock,
  UserX,
  Trash2,
  Sparkles,
  Heart,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from '@/components/ui/Dropdown';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import type { SalonDataStore, BookingRecord } from '@/core/data-store';
import { getAvailableSlots, type SlotResult } from '@/core/slot-engine';
import { NewBookingModal } from '@/components/appointments/NewBookingModal';
import { AppointmentDetailView } from '@/components/views/AppointmentDetailView';

export interface AppointmentsViewProps {
  store: SalonDataStore;
  onNewBookingClick?: () => void;
  openNewBookingInitially?: boolean;
  onCloseNewBookingModal?: () => void;
  initialDetailBookingId?: string | null;
  isDark?: boolean;
  customerMode?: boolean;
  customerClientId?: string;
  customerName?: string;
}

export function AppointmentsView({
  store,
  onNewBookingClick,
  openNewBookingInitially = false,
  onCloseNewBookingModal,
  initialDetailBookingId = null,
  isDark = false,
  customerMode = false,
  customerClientId,
  customerName,
}: AppointmentsViewProps) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const confirm = useConfirm();

  const [selectedDetailBooking, setSelectedDetailBooking] = useState<BookingRecord | null>(() => {
    if (initialDetailBookingId) {
      return store.state.bookings.find((b) => b.id === initialDetailBookingId) || null;
    }
    return null;
  });
  const [isNewBookingModalOpen, setIsNewBookingModalOpen] = useState(openNewBookingInitially);

  // Sync openNewBookingInitially if triggered dynamically from an external CTA
  useEffect(() => {
    if (openNewBookingInitially) {
      setIsNewBookingModalOpen(true);
      // Immediately reset parent state so it functions as a one-time trigger
      onCloseNewBookingModal?.();
    }
  }, [openNewBookingInitially, onCloseNewBookingModal]);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);

  // Reschedule state
  const [rescheduleOpen, setRescheduleOpen] = useState(false);
  const [reschedDate, setReschedDate] = useState('2026-11-04');
  const [reschedSlot, setReschedSlot] = useState<string>('');

  const filteredBookings = store.state.bookings.filter((b) => {
    if (customerMode) {
      const matchCustomer =
        b.client_id === customerClientId ||
        b.client_name.toLowerCase().includes((customerName || '').toLowerCase().split(' ')[0]);
      if (!matchCustomer) return false;
    }
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchSearch =
      b.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.service_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.staff_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleCancelBooking = async (b: BookingRecord) => {
    const confirmed = await confirm({
      title: locale === 'nl' ? 'Afspraak annuleren?' : 'Cancel appointment?',
      description: locale === 'nl'
        ? `Weet u zeker dat u de afspraak van ${b.client_name} voor "${b.service_name}" op ${b.date} om ${b.start_time} wilt annuleren?`
        : `Are you sure you want to cancel the booking for ${b.client_name} on ${b.date} at ${b.start_time}?`,
      confirmText: locale === 'nl' ? 'Annuleren bevestigen' : 'Confirm cancellation',
      cancelText: t('cancel'),
      variant: 'danger',
    });

    if (confirmed) {
      store.cancelBooking(b.id);
      toast({
        title: locale === 'nl' ? 'Boeking geannuleerd' : 'Booking cancelled',
        description: locale === 'nl' ? `Afspraak voor ${b.client_name} is geannuleerd.` : `Booking for ${b.client_name} cancelled.`,
        variant: 'info',
      });
    }
  };

  const handleSendReminder = (b: BookingRecord) => {
    store.simulateReminder(b.id);
    toast({
      title: locale === 'nl' ? 'Herinnering verzonden (prototype)' : 'Reminder sent (prototype)',
      description: locale === 'nl'
        ? `Herinneringsbericht verzonden naar ${b.client_name} (${b.client_phone}).`
        : `Reminder message dispatched to ${b.client_name} (${b.client_phone}).`,
      variant: 'success',
    });
  };

  const handleMarkStatus = (bookingId: string, status: 'completed' | 'no_show') => {
    store.updateBookingStatus(bookingId, status);
    toast({
      title: locale === 'nl' ? 'Status bijgewerkt' : 'Status updated',
      description: locale === 'nl'
        ? status === 'completed'
          ? 'Afspraak gemarkeerd als voltooid.'
          : 'Afspraak gemarkeerd als no-show.'
        : `Appointment marked as ${status}.`,
      variant: status === 'completed' ? 'success' : 'warning',
    });
  };

  const handleViewDetails = (b: BookingRecord) => {
    setSelectedBooking(b);
    setSelectedDetailBooking(b);
  };

  const handleOpenReschedule = (b: BookingRecord) => {
    setSelectedBooking(b);
    setReschedDate('2026-11-04');
    setReschedSlot('');
    setRescheduleOpen(true);
  };

  const handleConfirmReschedule = async () => {
    if (!selectedBooking || !reschedSlot) return;
    const srv = store.state.services.find((s) => s.id === selectedBooking.service_id);
    const duration = srv ? srv.duration_min : 45;

    const confirmed = await confirm({
      title: locale === 'nl' ? 'Afspraak verplaatsen?' : 'Reschedule appointment?',
      description: locale === 'nl'
        ? `Wilt u de afspraak van ${selectedBooking.client_name} verplaatsen naar ${reschedDate} om ${reschedSlot}?`
        : `Do you want to reschedule ${selectedBooking.client_name}'s booking to ${reschedDate} at ${reschedSlot}?`,
      confirmText: locale === 'nl' ? 'Verplaatsen bevestigen' : 'Confirm reschedule',
      cancelText: t('cancel'),
      variant: 'primary',
    });

    if (confirmed) {
      try {
        store.rescheduleBooking(selectedBooking.id, reschedDate, reschedSlot, selectedBooking.staff_id);
        setRescheduleOpen(false);
        toast({
          title: locale === 'nl' ? 'Boeking verplaatst!' : 'Booking rescheduled!',
          description: locale === 'nl'
            ? `Nieuw tijdstip: ${reschedDate} om ${reschedSlot}.`
            : `New time: ${reschedDate} at ${reschedSlot}.`,
          variant: 'success',
        });
      } catch (err: unknown) {
        toast({
          title: t('toastErrorTitle'),
          description: err instanceof Error ? err.message : 'Error rescheduling',
          variant: 'danger',
        });
      }
    }
  };

  const selectedService = selectedBooking
    ? store.state.services.find((s) => s.id === selectedBooking.service_id) || { id: 'srv-default', name: selectedBooking.service_name, duration_min: 45, price_eur: selectedBooking.price_eur || 30 }
    : null;

  const availableReschedSlots: SlotResult[] = (selectedBooking && selectedService)
    ? getAvailableSlots({
        clientConfig: store.config,
        service: selectedService,
        dateStr: reschedDate,
        staffId: selectedBooking.staff_id,
        existingBookings: store.state.bookings.filter((b) => b.id !== selectedBooking.id),
      })
    : [];

  // If a booking is selected for details, render the dedicated Appointment Detail Page
  if (selectedDetailBooking) {
    return (
      <AppointmentDetailView
        booking={selectedDetailBooking}
        onBack={() => setSelectedDetailBooking(null)}
        store={store}
        isDark={isDark}
        userRole={customerMode ? 'customer' : 'admin'}
        customerClientId={customerClientId}
      />
    );
  }

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader
        eyebrow={customerMode ? (locale === 'nl' ? 'Mijn Afsprakenoverzicht' : 'Personal Appointments') : (locale === 'nl' ? 'Beheerdersagenda' : 'Appointments Registry')}
        title={customerMode ? (locale === 'nl' ? 'Mijn Salonafspraken' : 'My Appointments') : (locale === 'nl' ? 'Alle Boekingen & Afspraken' : 'All Bookings & Appointments')}
        description={customerMode
          ? (locale === 'nl'
              ? 'Bekijk uw geboekte behandelingen, verzet eenvoudig een datum of annuleer kosteloos tot 24 uur van tevoren.'
              : 'Review your scheduled visits, reschedule dates easily or cancel free of charge up to 24h prior.')
          : (locale === 'nl'
              ? 'Volledig overzicht en beheer van salonafspraken, statussen, 3-dots actiemenu, verplaatsingen en herinneringen.'
              : 'Complete management of salon bookings, status filtering, 3-dots actions menu, rescheduling, and customer reminders.')}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsNewBookingModalOpen(true)}
            className="text-xs font-bold text-white shadow-xs"
            style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {locale === 'nl' ? 'Nieuwe Boeking Maken' : 'New Booking'}
          </Button>
        }
      />

      {/* Filter and Search Bar */}
      <Card className="p-4 border-secondary-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Status Tabs */}
          <div className="flex flex-wrap items-center gap-1.5">
            {[
              { id: 'all', label: locale === 'nl' ? 'Alle' : 'All' },
              { id: 'confirmed', label: locale === 'nl' ? 'Bevestigd' : 'Confirmed' },
              { id: 'completed', label: locale === 'nl' ? 'Voltooid' : 'Completed' },
              { id: 'cancelled', label: locale === 'nl' ? 'Geannuleerd' : 'Cancelled' },
              { id: 'no_show', label: 'No-Show' },
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterStatus(f.id)}
                style={filterStatus === f.id ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
                className={cn(
                  'px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer',
                  filterStatus === f.id
                    ? 'text-white shadow-xs font-bold'
                    : 'text-secondary-600 dark:text-slate-400 hover:bg-secondary-100 dark:hover:bg-[#222230] hover:text-secondary-900 dark:hover:text-white'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-60">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary-400" />
            <input
              type="text"
              placeholder={locale === 'nl' ? 'Zoek op klant, dienst of specialist...' : 'Search by client, service or staff...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-secondary-300 dark:border-[#323244] bg-white dark:bg-[#1a1a24] text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>
      </Card>

      {/* Bookings Table Card with 3-Dots Action Dropdown matching Reference Architecture */}
      <Card className="p-0 border-secondary-200 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary-50 dark:bg-[#1c1c28] border-b border-secondary-200 dark:border-[#272733] text-secondary-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3 px-4">{locale === 'nl' ? 'Klant' : 'Client'}</th>
                <th className="py-3 px-4">{locale === 'nl' ? 'Behandeling' : 'Service'}</th>
                <th className="py-3 px-4">{locale === 'nl' ? 'Datum & Tijd' : 'Date & Time'}</th>
                <th className="py-3 px-4">{locale === 'nl' ? 'Specialist' : 'Specialist'}</th>
                <th className="py-3 px-4">{locale === 'nl' ? 'Status' : 'Status'}</th>
                <th className="py-3 px-4 text-center w-16">{locale === 'nl' ? 'Acties' : 'Actions'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-100 dark:divide-[#272733]">
              {filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-secondary-500">
                    {locale === 'nl' ? 'Geen boekingen gevonden die voldoen aan de filtercriteria.' : 'No bookings found matching filter.'}
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-secondary-50/70 dark:hover:bg-[#1e1e2a] transition-colors">
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => handleViewDetails(b)}
                        className="font-bold text-secondary-900 dark:text-white cursor-pointer hover:underline hover:text-primary-600 transition-colors"
                        title={locale === 'nl' ? 'Dossier inzien' : 'View details'}
                      >
                        {b.client_name}
                      </div>
                      <div className="text-[11px] text-secondary-500 dark:text-slate-400">{b.client_phone}</div>
                      {b.pet_data && (
                        <div className="text-[11px] text-rose-700 font-medium mt-0.5">
                          🐾 {b.pet_data.name} ({b.pet_data.breed || b.pet_data.species})
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-secondary-900 dark:text-white">{b.service_name}</div>
                      <div className="text-[11px] text-secondary-500 dark:text-slate-400">{b.price_eur ? `€${b.price_eur}` : 'Prijs op aanvraag'}</div>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <div className="font-bold text-secondary-900 dark:text-white">{b.date}</div>
                      <div className="text-[11px] text-secondary-600 dark:text-slate-400">{b.start_time} - {b.end_time}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-secondary-800 dark:text-slate-300">{b.staff_name}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <Badge
                          variant={
                            b.status === 'confirmed'
                              ? 'success'
                              : b.status === 'completed'
                              ? 'info'
                              : b.status === 'cancelled'
                              ? 'danger'
                              : 'warning'
                          }
                        >
                          {b.status}
                        </Badge>
                        {b.is_sample && <Badge variant="sample">SAMPLE</Badge>}
                      </div>
                    </td>

                    {/* 3 Dots Actions Dropdown Column */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="flex justify-center">
                        <Dropdown>
                          <DropdownTrigger
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-secondary-500 hover:bg-secondary-100 hover:text-secondary-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
                            aria-label={`Acties voor afspraak van ${b.client_name}`}
                          >
                            <MoreVertical className="h-4 w-4" />
                          </DropdownTrigger>
                          <DropdownContent align="end" width="sm">
                            <DropdownItem
                              icon={<Eye className="h-4 w-4 text-secondary-500" />}
                              onClick={() => handleViewDetails(b)}
                            >
                              {locale === 'nl' ? 'Details bekijken' : 'View details'}
                            </DropdownItem>
                            {/* Staff-only actions */}
                            {!customerMode && (
                              <DropdownItem
                                icon={<Bell className="h-4 w-4 text-secondary-500" />}
                                onClick={() => handleSendReminder(b)}
                              >
                                {locale === 'nl' ? 'Herinnering sturen' : 'Send reminder'}
                              </DropdownItem>
                            )}
                            {b.status !== 'cancelled' && (
                              <DropdownItem
                                icon={<CalendarClock className="h-4 w-4 text-secondary-500" />}
                                onClick={() => handleOpenReschedule(b)}
                              >
                                {locale === 'nl' ? 'Afspraak verplaatsen' : 'Reschedule'}
                              </DropdownItem>
                            )}
                            {!customerMode && b.status === 'confirmed' && (
                              <DropdownItem
                                icon={<CheckCircle2 className="h-4 w-4 text-emerald-600" />}
                                onClick={() => handleMarkStatus(b.id, 'completed')}
                              >
                                {locale === 'nl' ? 'Markeren als voltooid' : 'Mark as completed'}
                              </DropdownItem>
                            )}
                            {!customerMode && b.status === 'confirmed' && (
                              <DropdownItem
                                icon={<UserX className="h-4 w-4 text-amber-600" />}
                                onClick={() => handleMarkStatus(b.id, 'no_show')}
                              >
                                {locale === 'nl' ? 'Markeren als no-show' : 'Mark as no-show'}
                              </DropdownItem>
                            )}
                            {b.status !== 'cancelled' && (
                              <>
                                <DropdownSeparator />
                                <DropdownItem
                                  icon={<Trash2 className="h-4 w-4 text-rose-600" />}
                                  variant="danger"
                                  onClick={() => handleCancelBooking(b)}
                                >
                                  {locale === 'nl' ? 'Afspraak annuleren' : 'Cancel appointment'}
                                </DropdownItem>
                              </>
                            )}
                          </DropdownContent>
                        </Dropdown>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Appointment Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5 text-primary-600" />
              <span>{locale === 'nl' ? 'Afspraak Dossier Details' : 'Appointment Details'}</span>
            </DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="px-6 py-4 space-y-4 text-xs">
              {/* Header Box */}
              <div className="p-3.5 rounded-xl bg-secondary-50 border border-secondary-200 flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-secondary-900">{selectedBooking.client_name}</h4>
                  <p className="text-secondary-500">{selectedBooking.client_phone} {selectedBooking.client_email && `• ${selectedBooking.client_email}`}</p>
                </div>
                <div className="flex items-center gap-1.5">
                  <Badge variant={selectedBooking.status === 'confirmed' ? 'success' : 'default'}>
                    {selectedBooking.status}
                  </Badge>
                  {selectedBooking.is_sample && <Badge variant="sample">SAMPLE</Badge>}
                </div>
              </div>

              {/* Service & Specialist Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg border border-secondary-200 bg-white">
                  <p className="text-secondary-500 text-[11px] font-semibold uppercase">{locale === 'nl' ? 'Behandeling' : 'Service'}</p>
                  <p className="font-bold text-secondary-900 mt-0.5">{selectedBooking.service_name}</p>
                  <p className="text-secondary-600 font-mono mt-0.5">
                    {selectedBooking.price_eur ? `€${selectedBooking.price_eur}` : 'Prijs op aanvraag'}
                  </p>
                </div>
                <div className="p-3 rounded-lg border border-secondary-200 bg-white">
                  <p className="text-secondary-500 text-[11px] font-semibold uppercase">{locale === 'nl' ? 'Toegewezen Specialist' : 'Specialist'}</p>
                  <p className="font-bold text-secondary-900 mt-0.5">{selectedBooking.staff_name}</p>
                  <p className="text-secondary-600 font-mono mt-0.5">{selectedBooking.date} om {selectedBooking.start_time}</p>
                </div>
              </div>

              {/* Pet Details if Grooming */}
              {selectedBooking.pet_data && (
                <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-200 text-rose-950 space-y-1">
                  <p className="font-bold flex items-center gap-1.5 text-xs text-rose-900">
                    <Heart className="h-3.5 w-3.5 text-rose-600" />
                    <span>{locale === 'nl' ? 'Gekoppeld Huisdierdossier' : 'Associated Pet Record'}</span>
                  </p>
                  <p className="text-xs">
                    <span className="font-semibold">{selectedBooking.pet_data.name}</span> ({selectedBooking.pet_data.species} • {selectedBooking.pet_data.breed})
                  </p>
                  {selectedBooking.pet_data.coat && (
                    <p className="text-[11px] text-rose-800">Vachttype: {selectedBooking.pet_data.coat}</p>
                  )}
                  {selectedBooking.pet_data.behaviour_notes && (
                    <p className="text-[11px] text-rose-800">Gedrag: {selectedBooking.pet_data.behaviour_notes}</p>
                  )}
                </div>
              )}

              {/* Reminder status */}
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-secondary-50 text-secondary-600 text-xs">
                <span>{locale === 'nl' ? 'Herinneringsstatus:' : 'Reminder status:'}</span>
                <span className={cn('font-semibold', selectedBooking.reminder_sent ? 'text-emerald-700' : 'text-secondary-500')}>
                  {selectedBooking.reminder_sent ? (locale === 'nl' ? '✓ Verzonden' : '✓ Sent') : (locale === 'nl' ? 'Nog niet verzonden' : 'Not sent yet')}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setDetailsModalOpen(false)}>
              {locale === 'nl' ? 'Sluiten' : 'Close'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reschedule Modal */}
      <Dialog open={rescheduleOpen} onOpenChange={setRescheduleOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{locale === 'nl' ? 'Afspraak Verplaatsen' : 'Reschedule Booking'}</DialogTitle>
          </DialogHeader>
          {selectedBooking && (
            <div className="px-6 py-4 space-y-4 text-xs">
              <div className="p-3 rounded-lg bg-secondary-50 border border-secondary-200">
                <p className="font-bold text-secondary-900">{selectedBooking.client_name}</p>
                <p className="text-secondary-600">{selectedBooking.service_name} • Huidig: {selectedBooking.date} om {selectedBooking.start_time}</p>
              </div>

              <div>
                <label className="block font-semibold text-secondary-700 mb-1">
                  {locale === 'nl' ? 'Selecteer nieuwe datum:' : 'Select new date:'}
                </label>
                <input
                  type="date"
                  value={reschedDate}
                  onChange={(e) => {
                    setReschedDate(e.target.value);
                    setReschedSlot('');
                  }}
                  className="w-full p-2 border border-secondary-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-secondary-700 mb-1">
                  {locale === 'nl' ? 'Kies nieuw tijdslot (15-minuten interval):' : 'Choose new slot (15m interval):'}
                </label>
                {availableReschedSlots.length === 0 ? (
                  <p className="text-rose-600 py-2">{locale === 'nl' ? 'Geen beschikbare tijden op deze dag.' : 'No slots available on this date.'}</p>
                ) : (
                  <div className="grid grid-cols-4 gap-2 max-h-48 overflow-y-auto p-1">
                    {availableReschedSlots.map((s: SlotResult) => (
                      <button
                        key={s.time}
                        type="button"
                        onClick={() => setReschedSlot(s.time)}
                        className={cn(
                          'p-2 rounded border text-center font-mono text-xs font-semibold cursor-pointer',
                          reschedSlot === s.time
                            ? 'bg-primary-600 text-white border-primary-600'
                            : 'border-secondary-300 hover:border-primary-500 bg-white text-secondary-900'
                        )}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
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

      {/* New Booking Modal Form */}
      <NewBookingModal
        isOpen={isNewBookingModalOpen}
        onClose={() => {
          setIsNewBookingModalOpen(false);
          onCloseNewBookingModal?.();
        }}
        store={store}
        isDark={isDark}
        isCustomerMode={customerMode}
        initialClientId={customerMode ? customerClientId : undefined}
      />
    </PageContainer>
  );
}
