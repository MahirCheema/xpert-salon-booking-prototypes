import { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Phone,
  Mail,
  CalendarCheck,
  FileText,
  ShieldCheck,
  UserPlus,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import type { SalonDataStore } from '@/core/data-store';

export interface ClientsViewProps {
  store: SalonDataStore;
  onBookForClient: (clientName: string) => void;
}

export function ClientsView({ store, onBookForClient }: ClientsViewProps) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [addModalOpen, setAddModalOpen] = useState(false);

  // New client form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [notes, setNotes] = useState('');

  const clients = store.state.clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast({
        title: locale === 'nl' ? 'Incomplete gegevens' : 'Incomplete fields',
        description: locale === 'nl' ? 'Vul minimaal een naam en telefoonnummer in.' : 'Please enter a name and phone number.',
        variant: 'danger',
      });
      return;
    }

    const newClient = store.addClient(name, phone, email, notes);
    setAddModalOpen(false);
    setName('');
    setPhone('');
    setEmail('');
    setNotes('');

    toast({
      title: locale === 'nl' ? 'Klant toegevoegd' : 'Client created',
      description: locale === 'nl' ? `Dossier voor ${newClient.name} is aangemaakt.` : `Profile for ${newClient.name} created.`,
      variant: 'success',
    });
  };

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader
        eyebrow={locale === 'nl' ? 'Klantbeheer & CRM' : 'Client Management'}
        title={locale === 'nl' ? 'Klanten & Dossiers' : 'Clients & Records'}
        description={locale === 'nl'
          ? 'Overzicht van vaste klanten, contactgegevens, bezoekhistorie en persoonlijke salonnotities.'
          : 'Overview of registered salon clients, contact details, appointment histories, and preferences.'}
        actions={
          <Button variant="primary" size="sm" onClick={() => setAddModalOpen(true)} className="text-xs">
            <UserPlus className="h-3.5 w-3.5 mr-1" />
            {locale === 'nl' ? 'Nieuwe Klant Toevoegen' : 'Add New Client'}
          </Button>
        }
      />

      {/* Search Bar */}
      <Card className="p-4 border-secondary-200">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary-400" />
          <input
            type="text"
            placeholder={locale === 'nl' ? 'Zoek op klantnaam, telefoonnummer of e-mail...' : 'Search by name, phone or email...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-secondary-300 dark:border-[#323244] bg-white dark:bg-[#1a1a24] dark:text-white placeholder-secondary-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </Card>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {clients.length === 0 ? (
          <div className="col-span-full py-12 text-center text-secondary-500 text-sm">
            {locale === 'nl' ? 'Geen klanten gevonden.' : 'No clients found.'}
          </div>
        ) : (
          clients.map((c) => {
            const clientBookings = store.state.bookings.filter((b) => b.client_id === c.id || b.client_name === c.name);
            const bookingsCount = clientBookings.length;
            const noShowCount = clientBookings.filter((b) => b.status === 'no_show').length;
            const hasDepositRequirement = noShowCount > 0 || c.notes?.toLowerCase().includes('no-show');

            return (
              <Card key={c.id} className="p-5 border-secondary-200 flex flex-col justify-between hover:shadow-xs transition-shadow">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-primary-700 font-bold text-sm">
                        {c.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-secondary-900 dark:text-white text-sm">{c.name}</h4>
                        <span className="text-[10px] text-secondary-500 dark:text-slate-400">ID: {c.id}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {hasDepositRequirement ? (
                        <span className="text-[10px] font-bold text-rose-800 bg-rose-100 dark:bg-rose-950/50 dark:text-rose-300 px-2 py-0.5 rounded-full border border-rose-300">
                          ⚠️ Aanbetaling Vereist
                        </span>
                      ) : bookingsCount >= 3 ? (
                        <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-300">
                          ⭐ Vaste Klant (VIP)
                        </span>
                      ) : null}
                      {c.is_sample && <Badge variant="sample">SAMPLE</Badge>}
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-secondary-600 dark:text-slate-300">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-secondary-400" />
                      <span className="font-mono">{c.phone}</span>
                    </div>
                    {c.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-3.5 w-3.5 text-secondary-400" />
                        <span className="truncate">{c.email}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CalendarCheck className="h-3.5 w-3.5 text-secondary-400" />
                        <span>{bookingsCount} {locale === 'nl' ? 'afspraken' : 'visits'}</span>
                      </div>
                      {noShowCount > 0 && (
                        <span className="text-[10px] font-bold text-rose-600 font-mono">
                          {noShowCount} no-show(s)
                        </span>
                      )}
                    </div>
                  </div>

                  {c.notes && (
                    <div className="rounded-lg bg-secondary-50 dark:bg-[#13131c] p-2 text-xs text-secondary-700 dark:text-slate-300 border border-secondary-200/60 dark:border-[#272733]">
                      <p className="font-semibold text-[11px] text-secondary-800 dark:text-slate-200 mb-0.5">Notities:</p>
                      <p className="text-secondary-600 line-clamp-2">{c.notes}</p>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-2 border-t border-secondary-100 dark:border-[#272733] flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBookForClient(c.name)}
                    className="text-xs"
                  >
                    {locale === 'nl' ? 'Boeking starten' : 'Book appointment'}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Add Client Modal */}
      <Dialog open={addModalOpen} onOpenChange={setAddModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-lg">{locale === 'nl' ? 'Nieuw Klantdossier Toevoegen' : 'Add New Client Record'}</DialogTitle>
            <p className="text-xs text-secondary-500 mt-1">
              {locale === 'nl' ? 'Voeg een nieuwe klant toe aan het digitale salonbestand met contactgegevens en voorkeuren.' : 'Add a new client to the digital salon database with contact information and preferences.'}
            </p>
          </DialogHeader>
          <form onSubmit={handleAddClient}>
            <div className="px-6 py-4 space-y-4 text-sm">
              <div>
                <label className="block font-semibold text-secondary-800 mb-1.5">{locale === 'nl' ? 'Volledige naam *' : 'Full Name *'}</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-3 border border-secondary-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="bv. Lisa van Dijk"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-secondary-800 mb-1.5">{locale === 'nl' ? 'Telefoonnummer *' : 'Phone Number *'}</label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-3 border border-secondary-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="06-12345678"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-secondary-800 mb-1.5">{locale === 'nl' ? 'E-mailadres' : 'Email Address'}</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-secondary-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                    placeholder="lisa@example.nl"
                  />
                </div>
              </div>
              <div>
                <label className="block font-semibold text-secondary-800 mb-1.5">{locale === 'nl' ? 'Behandelnotities / Wensen' : 'Treatment Notes & Preferences'}</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                  className="w-full p-3 border border-secondary-300 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="bv. Gevoelige hoofdhuid, vaste koffiewens, allergieën..."
                />
              </div>
            </div>
            <DialogFooter className="px-6 py-4 bg-secondary-50/80 border-t border-secondary-200">
              <Button type="button" variant="secondary" onClick={() => setAddModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="primary">
                {locale === 'nl' ? 'Klant Opslaan' : 'Save Client'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

