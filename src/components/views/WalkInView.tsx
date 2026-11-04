import { useState } from 'react';
import {
  Clock3,
  User,
  Plus,
  CheckCircle,
  CheckCircle2,
  Trash2,
  MoreVertical,
  UserCheck,
} from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownSeparator,
} from '@/components/ui/Dropdown';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import type { SalonDataStore } from '@/core/data-store';

export interface WalkInViewProps {
  store: SalonDataStore;
}

export function WalkInView({ store }: WalkInViewProps) {
  const { t, locale } = useI18n();
  const { toast } = useToast();

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [clientName, setClientName] = useState('');
  const [serviceName, setServiceName] = useState('');
  const [waitTime, setWaitTime] = useState(20);

  const queue = store.state.walkInQueue || [];

  const waitingCount = queue.filter((q) => q.status === 'waiting').length;
  const inChairCount = queue.filter((q) => q.status === 'in_chair').length;
  const totalChairs = store.config.staff?.length || 4;
  const freeChairs = Math.max(0, totalChairs - inChairCount);
  const avgWaitMin = waitingCount > 0 ? Math.max(5, Math.round(waitingCount * (25 / Math.max(1, totalChairs)))) : 0;

  const handleAddWalkIn = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim()) return;

    const srv = serviceName || (store.config.services?.[0]?.name || 'Knippen');
    store.addWalkIn(clientName.trim(), srv, Number(waitTime));

    setAddModalOpen(false);
    setClientName('');
    toast({
      title: locale === 'nl' ? 'Inloopklant toegevoegd' : 'Walk-in added',
      description: locale === 'nl' ? `${clientName} is toegevoegd aan de wachtrij met ~${waitTime}m wachttijd.` : `${clientName} added to waitlist with ~${waitTime}m wait.`,
      variant: 'success',
    });
  };

  const handleUpdateStatus = (id: string, status: 'waiting' | 'in_chair' | 'completed') => {
    store.updateWalkInStatus(id, status);
    toast({
      title: locale === 'nl' ? 'Status bijgewerkt' : 'Status updated',
      description: locale === 'nl'
        ? status === 'in_chair' ? 'Klant is nu in de stoel genomen.' : 'Inloopbehandeling voltooid.'
        : 'Walk-in customer status changed.',
      variant: status === 'completed' ? 'success' : 'info',
    });
  };

  const handleRemove = (id: string) => {
    store.removeWalkIn(id);
    toast({
      title: locale === 'nl' ? 'Verwijderd uit wachtrij' : 'Removed from queue',
      description: locale === 'nl' ? 'Klant is verwijderd uit de actieve inlooplijst.' : 'Client removed from queue.',
      variant: 'info',
    });
  };

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader
        eyebrow={locale === 'nl' ? 'Inloop & Wachtrijbeheer' : 'Walk-in & Queue Manager'}
        title={locale === 'nl' ? 'Live Inloopwachtrij' : 'Live Walk-in Queue'}
        description={locale === 'nl'
          ? 'Real-time beheer van spontane inloopklanten, geschatte wachttijden, stoelbezetting en 3-dots actiemenu.'
          : 'Real-time queue tracking, estimated wait calculations, chair management, and 3-dots actions menu.'}
        actions={
          <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)} className="text-xs">
            <Plus className="h-3.5 w-3.5 mr-1" />
            {locale === 'nl' ? 'Inloopklant Aanmelden' : 'Add Walk-in'}
          </Button>
        }
      />

      {/* KPI Real-Time Queue & Chair Occupancy Metrics (Kapsalon ISSA) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Chair Occupancy */}
        <Card className="p-4 border-secondary-200 dark:border-[#272733] bg-white dark:bg-[#181820] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-500 block">
              {locale === 'nl' ? 'Stoelbezetting' : 'Chair Occupancy'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-secondary-900 dark:text-white font-mono">
                {inChairCount} / {totalChairs}
              </span>
              <span className="text-xs text-secondary-500">
                ({freeChairs} {locale === 'nl' ? 'vrij' : 'free'})
              </span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
            ✂️
          </div>
        </Card>

        {/* Dynamic Estimated Wait Time */}
        <Card className="p-4 border-secondary-200 dark:border-[#272733] bg-white dark:bg-[#181820] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-500 block">
              {locale === 'nl' ? 'Geschatte Wachttijd' : 'Estimated Wait'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-indigo-600 dark:text-indigo-400 font-mono">
                ~{avgWaitMin} min
              </span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-600 flex items-center justify-center font-bold">
            <Clock3 className="h-5 w-5" />
          </div>
        </Card>

        {/* Waiting Patrons */}
        <Card className="p-4 border-secondary-200 dark:border-[#272733] bg-white dark:bg-[#181820] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-500 block">
              {locale === 'nl' ? 'In de Wachtrij' : 'Waiting in Queue'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-secondary-900 dark:text-white font-mono">
                {waitingCount}
              </span>
              <span className="text-xs text-secondary-500">
                {locale === 'nl' ? 'klanten' : 'clients'}
              </span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
            <User className="h-5 w-5" />
          </div>
        </Card>

        {/* In Chair Status */}
        <Card className="p-4 border-secondary-200 dark:border-[#272733] bg-white dark:bg-[#181820] flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-500 block">
              {locale === 'nl' ? 'In Behandeling' : 'Currently in Chair'}
            </span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono">
                {inChairCount}
              </span>
              <span className="text-xs text-secondary-500">
                {locale === 'nl' ? 'bezig' : 'active'}
              </span>
            </div>
          </div>
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="h-5 w-5" />
          </div>
        </Card>
      </div>

      <Card className="p-0 border-secondary-200 overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-secondary-50 dark:bg-[#1c1c28] border-b border-secondary-200 dark:border-[#272733] text-secondary-600 dark:text-slate-400 font-semibold uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">{locale === 'nl' ? 'Klantnaam' : 'Client Name'}</th>
              <th className="py-3 px-4">{locale === 'nl' ? 'Gewenste Dienst' : 'Desired Service'}</th>
              <th className="py-3 px-4">{locale === 'nl' ? 'Binnenkomst' : 'Arrival Time'}</th>
              <th className="py-3 px-4">{locale === 'nl' ? 'Geschatte Wachttijd' : 'Estimated Wait'}</th>
              <th className="py-3 px-4">{locale === 'nl' ? 'Status' : 'Status'}</th>
              <th className="py-3 px-4 text-center w-16">{locale === 'nl' ? 'Acties' : 'Actions'}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100 dark:divide-[#272733]">
            {queue.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-secondary-500">
                  {locale === 'nl' ? 'Momenteel geen wachtende inloopklanten.' : 'No waiting walk-in customers.'}
                </td>
              </tr>
            ) : (
              queue.map((item) => (
                <tr key={item.id} className="hover:bg-secondary-50/70 dark:hover:bg-[#1e1e2a] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-secondary-900 dark:text-white">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-primary-600" />
                      <span>{item.client_name}</span>
                      {item.is_sample && <Badge variant="sample">SAMPLE</Badge>}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-secondary-700 dark:text-slate-300 font-medium">
                    {item.service_name}
                  </td>
                  <td className="py-3.5 px-4 font-mono text-secondary-600 dark:text-slate-400">
                    {item.arrival_time}
                  </td>
                  <td className="py-3.5 px-4 font-mono">
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      <Clock3 className="h-3.5 w-3.5" />
                      ~{item.wait_time_min} min
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <Badge
                      variant={
                        item.status === 'in_chair'
                          ? 'warning'
                          : item.status === 'completed'
                          ? 'success'
                          : 'default'
                      }
                    >
                      {item.status === 'in_chair'
                        ? (locale === 'nl' ? 'In de stoel' : 'In chair')
                        : item.status === 'completed'
                        ? (locale === 'nl' ? 'Afgerond' : 'Completed')
                        : (locale === 'nl' ? 'Wachtend' : 'Waiting')}
                    </Badge>
                  </td>

                  {/* Direct 1-Click Action & 3 Dots Menu Column */}
                  <td className="py-3.5 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      {item.status === 'waiting' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, 'in_chair')}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-primary-600 hover:bg-primary-700 text-white shadow-2xs transition-colors shrink-0 cursor-pointer"
                        >
                          {locale === 'nl' ? 'In Stoel' : 'Take Chair'}
                        </button>
                      )}
                      {item.status === 'in_chair' && (
                        <button
                          type="button"
                          onClick={() => handleUpdateStatus(item.id, 'completed')}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-colors shrink-0 cursor-pointer"
                        >
                          {locale === 'nl' ? 'Afronden' : 'Finish'}
                        </button>
                      )}

                      <Dropdown>
                        <DropdownTrigger
                          className="inline-flex h-7 w-7 items-center justify-center rounded-lg text-secondary-500 hover:bg-secondary-100 hover:text-secondary-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 cursor-pointer"
                          aria-label={`Acties voor ${item.client_name}`}
                        >
                          <MoreVertical className="h-4 w-4" />
                        </DropdownTrigger>
                        <DropdownContent align="end" width="sm">
                          {item.status === 'waiting' && (
                            <DropdownItem
                              icon={<UserCheck className="h-4 w-4 text-primary-600" />}
                              onClick={() => handleUpdateStatus(item.id, 'in_chair')}
                            >
                              {locale === 'nl' ? 'In de stoel nemen' : 'Take in chair'}
                            </DropdownItem>
                          )}
                          {item.status === 'in_chair' && (
                            <DropdownItem
                              icon={<CheckCircle className="h-4 w-4 text-emerald-600" />}
                              onClick={() => handleUpdateStatus(item.id, 'completed')}
                            >
                              {locale === 'nl' ? 'Afronden' : 'Finish treatment'}
                            </DropdownItem>
                          )}
                          <DropdownSeparator />
                          <DropdownItem
                            icon={<Trash2 className="h-4 w-4 text-rose-600" />}
                            variant="danger"
                            onClick={() => handleRemove(item.id)}
                          >
                            {locale === 'nl' ? 'Verwijder uit wachtrij' : 'Remove from queue'}
                          </DropdownItem>
                        </DropdownContent>
                      </Dropdown>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Add Walk-In Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">{locale === 'nl' ? 'Inloopklant Aanmelden' : 'Register Walk-In Customer'}</DialogTitle>
            <p className="text-xs text-secondary-500 mt-1">
              {locale === 'nl' ? 'Meld een klant zonder vooraf geboekte afspraak aan in de actieve wachtrij.' : 'Register a walk-in guest without a prior booking into the active queue.'}
            </p>
          </DialogHeader>
          <form onSubmit={handleAddWalkIn}>
            <div className="px-6 py-4 space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-secondary-800 mb-1.5">{locale === 'nl' ? 'Klantnaam *' : 'Client Name *'}</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full p-3 border border-secondary-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="bv. Dhr. Bakker"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-secondary-800 mb-1.5">{locale === 'nl' ? 'Behandeling' : 'Service'}</label>
                  <select
                    value={serviceName}
                    onChange={(e) => setServiceName(e.target.value)}
                    className="w-full p-3 border border-secondary-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  >
                    {(store.config.services || []).map((s, idx: number) => (
                      <option key={idx} value={s.name}>
                        {s.name} ({s.duration_min}m)
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-secondary-800 mb-1.5">{locale === 'nl' ? 'Geschatte wachttijd (minuten):' : 'Estimated wait (minutes):'}</label>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={waitTime}
                    onChange={(e) => setWaitTime(Number(e.target.value))}
                    className="w-full p-3 border border-secondary-300 rounded-xl text-sm font-mono focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
            </div>
            <DialogFooter className="px-6 py-4 bg-secondary-50/80 border-t border-secondary-200">
              <Button type="button" variant="secondary" onClick={() => setAddModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="primary">
                {locale === 'nl' ? 'Aanmelden in Wachtrij' : 'Add to Queue'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}
