import { useState } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Users,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Mail,
  Plus,
  Search,
} from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import type { SalonDataStore, BookingRecord } from '@/core/data-store';

interface AdminDashboardProps {
  store: SalonDataStore;
  onNewBookingClick: () => void;
}

export function AdminDashboard({ store, onNewBookingClick }: AdminDashboardProps) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const confirm = useConfirm();

  const cfg = store.config;
  const hasCourses = cfg.features?.includes('treatment_course_tracking');
  const hasWalkIn = cfg.features?.includes('walk_in_queue_view');

  const [tab, setTab] = useState<'day' | 'bookings' | 'clients' | 'courses' | 'walkin'>('day');
  const [targetDate, setTargetDate] = useState<string>('2026-11-03');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedBooking, setSelectedBooking] = useState<BookingRecord | null>(null);

  // Filtered bookings
  const filteredBookings = store.state.bookings.filter((b) => {
    const matchStatus = filterStatus === 'all' || b.status === filterStatus;
    const matchSearch =
      b.client_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.service_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchStatus && matchSearch;
  });

  const handleCancelBooking = async (id: string, clientName: string) => {
    const ok = await confirm({
      title: t('confirmCancelTitle'),
      description: `${t('confirmCancelDesc')} (${clientName})`,
      confirmText: t('confirmCancelBtn'),
      cancelText: t('cancel'),
      variant: 'danger',
    });

    if (!ok) return;

    store.cancelBooking(id);
    toast({
      title: t('toastCancelledSuccess'),
      variant: 'info',
    });
  };

  const handleMarkStatus = async (id: string, status: 'completed' | 'no_show') => {
    const ok = await confirm({
      title: status === 'completed' ? 'Markeer als voltooid?' : 'Markeer als no-show?',
      description: status === 'completed' ? 'Is deze behandeling afgerond?' : 'Heeft de klant niet opgedaagd?',
      confirmText: status === 'completed' ? 'Afronden' : 'No-show registreren',
      cancelText: t('cancel'),
      variant: status === 'completed' ? 'primary' : 'warning',
    });

    if (!ok) return;

    store.markStatus(id, status);
    toast({
      title: status === 'completed' ? 'Behandeling voltooid' : 'No-show geregistreerd',
      variant: 'info',
    });
  };

  const handleSimulateReminder = (id: string) => {
    store.simulateReminder(id);
    toast({
      title: t('toastReminderSent'),
      variant: 'info',
    });
  };

  const hoursTimeline = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

  return (
    <div className="space-y-6 py-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-black text-secondary-900">{t('adminTitle')}</h2>
          <p className="text-xs text-secondary-500">{t('adminSubtitle')}</p>
        </div>
        <Button onClick={onNewBookingClick} size="sm" leftIcon={<Plus className="h-4 w-4" />}>
          {t('newBookingAdmin')}
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto border-b border-secondary-200 pb-2">
        <button
          type="button"
          onClick={() => setTab('day')}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            tab === 'day' ? 'bg-primary-600 text-white shadow-xs' : 'bg-white text-secondary-600 hover:bg-secondary-100'
          }`}
        >
          {t('tabDay')}
        </button>

        <button
          type="button"
          onClick={() => setTab('bookings')}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            tab === 'bookings'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'bg-white text-secondary-600 hover:bg-secondary-100'
          }`}
        >
          {t('tabBookings')} ({store.state.bookings.length})
        </button>

        <button
          type="button"
          onClick={() => setTab('clients')}
          className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
            tab === 'clients'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'bg-white text-secondary-600 hover:bg-secondary-100'
          }`}
        >
          {t('tabClients')} ({store.state.clients.length})
        </button>

        {hasCourses && (
          <button
            type="button"
            onClick={() => setTab('courses')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              tab === 'courses'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white text-secondary-600 hover:bg-secondary-100'
            }`}
          >
            {t('tabCourses')} ({store.state.treatmentCourses.length})
          </button>
        )}

        {hasWalkIn && (
          <button
            type="button"
            onClick={() => setTab('walkin')}
            className={`rounded-lg px-4 py-2 text-xs font-bold transition-all ${
              tab === 'walkin'
                ? 'bg-primary-600 text-white shadow-xs'
                : 'bg-white text-secondary-600 hover:bg-secondary-100'
            }`}
          >
            {t('tabWalkin')} ({store.state.walkInQueue.length})
          </button>
        )}
      </div>

      {/* TAB: DAY TIMELINE */}
      {tab === 'day' && (
        <Card className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-bold text-secondary-900">Agenda voor {targetDate}</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="font-medium text-secondary-600">Datum:</span>
              <input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
                className="rounded-md border border-secondary-300 p-1.5 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-secondary-200">
            <div className="flex border-b border-secondary-200 bg-secondary-50 font-bold text-xs text-secondary-700">
              <div className="w-20 shrink-0 border-r border-secondary-200 p-2.5 text-center">Tijd</div>
              {store.state.staff.map((st) => (
                <div key={st.id} className="flex-1 border-r border-secondary-200 p-2.5 last:border-r-0">
                  {st.name}
                </div>
              ))}
            </div>

            <div className="divide-y divide-secondary-100">
              {hoursTimeline.map((hour) => {
                const hourPrefix = hour.slice(0, 2);
                return (
                  <div key={hour} className="flex min-h-14 items-stretch">
                    <div className="w-20 shrink-0 border-r border-secondary-200 bg-secondary-50/50 p-2 text-center text-xs font-semibold text-secondary-500">
                      {hour}
                    </div>
                    {store.state.staff.map((st) => {
                      const bookingsInSlot = store.state.bookings.filter(
                        (b) =>
                          b.date === targetDate &&
                          b.staff_id === st.id &&
                          b.start_time.startsWith(hourPrefix)
                      );
                      return (
                        <div key={st.id} className="relative flex-1 border-r border-secondary-100 p-1.5 last:border-r-0">
                          {bookingsInSlot.map((b) => (
                            <div
                              key={b.id}
                              onClick={() => setSelectedBooking(b)}
                              className={`mb-1 cursor-pointer rounded-lg border p-2 text-xs shadow-2xs transition-all hover:scale-[1.01] ${
                                b.status === 'confirmed'
                                  ? 'border-primary-300 bg-primary-50/90 text-primary-900'
                                  : b.status === 'completed'
                                  ? 'border-success-300 bg-success-50 text-success-900'
                                  : 'border-secondary-200 bg-secondary-100 opacity-60 line-through'
                              }`}
                            >
                              <div className="font-bold">
                                {b.start_time} - {b.end_time}
                              </div>
                              <div className="truncate font-medium">{b.client_name}</div>
                              <div className="truncate text-[11px] text-secondary-500">{b.service_name}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* TAB: ALL BOOKINGS */}
      {tab === 'bookings' && (
        <Card className="p-4 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-lg border border-secondary-300 p-2 text-xs font-semibold"
              >
                <option value="all">Alle statussen</option>
                <option value="confirmed">Bevestigd</option>
                <option value="completed">Voltooid</option>
                <option value="cancelled">Geannuleerd</option>
                <option value="no_show">No-Show</option>
              </select>
            </div>

            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-secondary-400" />
              <input
                type="text"
                placeholder="Zoek klant of dienst..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-56 rounded-lg border border-secondary-300 pl-8 pr-3 py-1.5 text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-secondary-200 bg-secondary-50 text-secondary-700 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3">Datum &amp; Tijd</th>
                  <th className="p-3">Klant</th>
                  <th className="p-3">Behandeling</th>
                  <th className="p-3">Medewerker</th>
                  <th className="p-3">Tarief</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Acties</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-100">
                {filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-secondary-50/50">
                    <td className="p-3 font-semibold">
                      {b.date}
                      <span className="block text-[11px] text-secondary-500">{b.start_time} - {b.end_time}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-secondary-900">{b.client_name}</span>
                      {b.is_sample && <Badge variant="sample" className="ml-2">SAMPLE</Badge>}
                      <span className="block text-secondary-500">{b.client_phone}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-medium text-secondary-800">{b.service_name}</span>
                      {b.pet_data && (
                        <span className="block text-[11px] text-accent" style={{ color: 'var(--accent)' }}>
                          🐾 {b.pet_data.name} ({b.pet_data.breed})
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-medium text-secondary-700">{b.staff_name}</td>
                    <td className="p-3 font-extrabold text-secondary-900">€{b.price_eur || 0}</td>
                    <td className="p-3">
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
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1.5">
                        <Button variant="outline" size="sm" onClick={() => setSelectedBooking(b)}>
                          {t('details')}
                        </Button>
                        {b.status === 'confirmed' && (
                          <>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={() => handleMarkStatus(b.id, 'completed')}
                            >
                              ✓
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleCancelBooking(b.id, b.client_name)}
                            >
                              ✕
                            </Button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* TAB: CLIENTS & PETS */}
      {tab === 'clients' && (
        <Card className="p-4 sm:p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
            {store.state.clients.map((c) => {
              const clientPets = store.state.pets.filter((p) => p.client_id === c.id);
              const count = store.state.bookings.filter((b) => b.client_id === c.id).length;
              return (
                <div key={c.id} className="rounded-xl border border-secondary-200 bg-secondary-50/40 p-4">
                  <div className="flex items-start justify-between">
                    <h4 className="font-bold text-secondary-900">{c.name}</h4>
                    {c.is_sample && <Badge variant="sample">SAMPLE</Badge>}
                  </div>
                  <div className="mt-2 text-xs text-secondary-600">
                    <div>📞 {c.phone}</div>
                    <div>✉️ {c.email}</div>
                  </div>
                  {c.notes && (
                    <p className="mt-2 rounded-md bg-white p-2 text-xs text-secondary-700 border border-secondary-100">
                      {c.notes}
                    </p>
                  )}

                  {clientPets.length > 0 && (
                    <div className="mt-3 border-t border-secondary-200 pt-2 text-xs">
                      <span className="font-bold uppercase text-[10px] text-accent" style={{ color: 'var(--accent)' }}>
                        Huisdieren:
                      </span>
                      {clientPets.map((p) => (
                        <div key={p.id} className="mt-1">
                          🐾 <strong>{p.name}</strong> ({p.breed}, {p.species})
                          {p.medical_flags?.length > 0 && (
                            <span className="block text-[10px] text-danger-600">
                              ⚠ {p.medical_flags.join(', ')}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="mt-3 text-[11px] text-secondary-500">Afspraken: {count}</div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TAB: COURSES */}
      {tab === 'courses' && (
        <Card className="p-4 sm:p-6 space-y-4">
          <h3 className="text-lg font-bold text-secondary-900">{t('tabCourses')}</h3>
          <div className="space-y-4">
            {store.state.treatmentCourses.map((tc) => {
              const pct = Math.round((tc.completed_sessions / tc.total_sessions) * 100);
              return (
                <div key={tc.id} className="rounded-xl border border-secondary-200 bg-white p-5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-secondary-900">{tc.client_name}</h4>
                      <p className="text-xs text-secondary-500">{tc.service_name}</p>
                    </div>
                    <Badge variant="info">
                      Sessie {tc.completed_sessions} van {tc.total_sessions} voltooid
                    </Badge>
                  </div>

                  {/* Progress bar */}
                  <div className="my-3 h-2.5 w-full rounded-full bg-secondary-100 overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: `${pct}%`, backgroundColor: 'var(--accent)' }}
                    />
                  </div>

                  {/* Skin Notes Log */}
                  <div className="rounded-lg bg-secondary-50 p-3 text-xs space-y-1.5">
                    <span className="font-bold text-secondary-700">Huidanalyse &amp; Voortgang per bezoek:</span>
                    {tc.skin_analysis_notes.map((sn, idx) => (
                      <div key={idx} className="border-b border-secondary-200/50 pb-1 last:border-b-0">
                        <strong>{sn.date}:</strong> {sn.note}
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const note = prompt('Nieuwe huidanalyse notitie:');
                        if (note) {
                          store.addSkinAnalysisNote(tc.id, note);
                          toast({ title: 'Notitie opgeslagen', variant: 'success' });
                        }
                      }}
                    >
                      + Notitie toevoegen
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        store.advanceCourseSession(tc.id);
                        toast({ title: 'Sessie voltooid gemarkeerd', variant: 'info' });
                      }}
                    >
                      ✓ Sessie afronden
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* TAB: WALK-IN QUEUE */}
      {tab === 'walkin' && (
        <Card className="p-4 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-bold text-secondary-900">{t('tabWalkin')}</h3>
            <Button
              size="sm"
              onClick={() => {
                const name = prompt('Naam van inloopklant:');
                if (name) {
                  const srv = prompt('Behandeling:', 'Knippen') || 'Knippen';
                  store.addWalkIn(name, srv, 15);
                  toast({ title: 'Inloopklant toegevoegd', variant: 'success' });
                }
              }}
            >
              {t('addWalkIn')}
            </Button>
          </div>

          <div className="divide-y divide-secondary-100">
            {store.state.walkInQueue.map((wq) => (
              <div key={wq.id} className="flex items-center justify-between py-3 text-xs">
                <div>
                  <span className="font-bold text-secondary-900">{wq.client_name}</span>
                  <span className="ml-2 text-secondary-500">({wq.service_name})</span>
                  <span className="block text-[11px] text-secondary-400">
                    Binnenkomst: {wq.arrival_time} • Geschatte wachttijd: {wq.wait_time_min}m
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={wq.status === 'in_chair' ? 'success' : 'warning'}>
                    {wq.status === 'in_chair' ? 'In de stoel' : 'Wachtend'}
                  </Badge>
                  {wq.status === 'waiting' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        store.updateWalkInStatus(wq.id, 'in_chair');
                        toast({ title: 'Klant in de stoel genomen', variant: 'info' });
                      }}
                    >
                      {t('inChair')}
                    </Button>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        store.removeWalkIn(wq.id);
                        toast({ title: 'Behandeling afgerond', variant: 'success' });
                      }}
                    >
                      {t('finish')}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Booking Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-slate-900/60" onClick={() => setSelectedBooking(null)} />
          <div className="relative z-50 w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <h3 className="text-lg font-bold text-secondary-900">
              Boekingsdetails #{selectedBooking.id.toUpperCase()}
            </h3>

            <div className="mt-4 divide-y divide-secondary-100 text-xs">
              <div className="flex justify-between py-2">
                <span className="text-secondary-500">Klant</span>
                <span className="font-bold text-secondary-900">{selectedBooking.client_name}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-secondary-500">Telefoon / E-mail</span>
                <span>{selectedBooking.client_phone} • {selectedBooking.client_email}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-secondary-500">Behandeling</span>
                <span className="font-semibold">{selectedBooking.service_name}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-secondary-500">Datum &amp; Tijd</span>
                <span>{selectedBooking.date} om {selectedBooking.start_time} - {selectedBooking.end_time}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-secondary-500">Specialist</span>
                <span>{selectedBooking.staff_name}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-secondary-500">Herinnering status</span>
                <span>{selectedBooking.reminder_sent ? 'Verzonden (prototype)' : 'Niet verzonden'}</span>
              </div>

              {selectedBooking.pet_data && (
                <div className="py-2">
                  <span className="font-bold text-accent" style={{ color: 'var(--accent)' }}>🐾 Huisdier Profiel:</span>
                  <p className="mt-1 text-secondary-600">
                    Naam: {selectedBooking.pet_data.name} ({selectedBooking.pet_data.breed}, {selectedBooking.pet_data.species})<br />
                    Vacht: {selectedBooking.pet_data.coat || 'Normaal'}<br />
                    Gedrag: {selectedBooking.pet_data.behaviour_notes || 'Geen'}<br />
                    {Boolean(selectedBooking.pet_data.medical_flags && selectedBooking.pet_data.medical_flags.length > 0) && (
                      <span className="text-danger-600 font-bold">
                        Bijzonderheden: {selectedBooking.pet_data.medical_flags!.join(', ')}
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  handleSimulateReminder(selectedBooking.id);
                  setSelectedBooking(null);
                }}
              >
                {t('sendReminderSimulated')}
              </Button>
              <Button variant="secondary" size="sm" onClick={() => setSelectedBooking(null)}>
                {t('close')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

