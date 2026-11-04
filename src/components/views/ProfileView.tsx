import React, { useState, useMemo, useEffect } from 'react';
import {
  User,
  ShieldCheck,
  Award,
  Phone,
  Mail,
  Building2,
  Clock,
  ExternalLink,
  Copy,
  Check,
  CheckCircle2,
  Smartphone,
  Volume2,
  KeyRound,
  Lock,
  LogOut,
  Calendar,
  Sparkles,
  Sliders,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/Toast';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import type { SalonDataStore, ClientRecord } from '@/core/data-store';
import type { NavTabId } from '@/components/layout/Sidebar';

export interface ProfileViewProps {
  store: SalonDataStore;
  currentSlug: string;
  isDark?: boolean;
  onSelectTab?: (tab: NavTabId) => void;
  userRole?: 'admin' | 'customer';
  selectedCustomer?: ClientRecord;
}

function CustomerProfileContent({
  store,
  currentSlug,
  isDark = false,
  onSelectTab,
  customer,
}: {
  store: SalonDataStore;
  currentSlug: string;
  isDark?: boolean;
  onSelectTab?: (tab: NavTabId) => void;
  customer?: ClientRecord;
}) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const cfg = store.config;

  const activeCust = customer || store.state.clients[0] || {
    id: 'client-sample-1',
    name: 'Sophie van Dijk',
    phone: '06-12345678',
    email: 'sophie.vandijk@example.nl',
    loyalty_points: 380,
    loyalty_tier: 'silver',
    total_spent_eur: 245.0,
  };

  const [custName, setCustName] = useState(activeCust.name);
  const [custPhone, setCustPhone] = useState(activeCust.phone);
  const [custEmail, setCustEmail] = useState(activeCust.email || '');
  const [smsReminders, setSmsReminders] = useState(true);
  const [emailConfirmations, setEmailConfirmations] = useState(true);
  const [allergies, setAllergies] = useState('Geen bekende allergieën of huidgevoeligheden.');

  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      locale === 'nl'
        ? 'Uw persoonlijke klantgegevens en voorkeuren zijn succesvol bijgewerkt!'
        : 'Your personal customer profile and preferences have been updated successfully!'
    );
  };

  const handleExportData = () => {
    const exportPayload = {
      customer: {
        id: activeCust.id,
        name: custName,
        phone: custPhone,
        email: custEmail,
        loyalty_points: activeCust.loyalty_points || 380,
        loyalty_tier: activeCust.loyalty_tier || 'silver',
      },
      bookings: store.state.bookings.filter(
        (b) =>
          b.client_id === activeCust.id ||
          b.client_name.toLowerCase().includes(custName.toLowerCase().split(' ')[0])
      ),
      exportDate: new Date().toISOString(),
      salon: cfg.client,
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `persoonsgegevens-${activeCust.id}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success(
      locale === 'nl'
        ? 'AVG/GDPR gegevensdossier succesvol geëxporteerd als JSON.'
        : 'GDPR personal data dossier exported successfully.'
    );
  };

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader
        eyebrow={locale === 'nl' ? 'Persoonlijk Account & Voorkeuren' : 'Personal Account & Preferences'}
        title={locale === 'nl' ? 'Mijn Klantenprofiel' : 'My Customer Profile'}
        description={locale === 'nl'
          ? `Beheer uw contactgegevens, loyalty-status, communicatievoorkeuren en privacy-instellingen bij ${cfg.client}.`
          : `Manage your contact details, loyalty status, communication preferences, and data privacy with ${cfg.client}.`}
      />

      {/* Customer Header Summary Card */}
      <div
        className={cn(
          'p-6 rounded-2xl border transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6',
          isDark ? 'bg-[#181822] border-[#29293a]' : 'bg-white border-secondary-200'
        )}
      >
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-linear-to-tr from-purple-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-md">
            {custName.charAt(0)}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-bold">{custName}</h2>
              <Badge variant="primary">
                {(activeCust.loyalty_tier || 'Silver').toUpperCase()} VIP
              </Badge>
              <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-300 border border-purple-500/30">
                {activeCust.loyalty_points || 380} Pts
              </span>
            </div>
            <p className={cn('text-xs mt-1', isDark ? 'text-slate-400' : 'text-secondary-500')}>
              {custEmail} • {custPhone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => onSelectTab?.('appointments')}
            className="flex-1 md:flex-initial text-xs font-semibold"
          >
            <Calendar className="h-4 w-4 mr-1.5" />
            {locale === 'nl' ? 'Mijn Afspraken' : 'My Appointments'}
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => onSelectTab?.('loyalty')}
            className="flex-1 md:flex-initial text-xs font-bold text-white shadow-xs"
            style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
          >
            <Award className="h-4 w-4 mr-1.5" />
            {locale === 'nl' ? 'Spaarpunten Inzien' : 'View Rewards'}
          </Button>
        </div>
      </div>

      {/* Profile Form */}
      <form onSubmit={handleSaveCustomer} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Contact Details */}
          <Card className="p-5 sm:p-6 space-y-4 border-secondary-200">
            <div className="flex items-center gap-2 pb-2 border-b border-secondary-200 dark:border-[#282838]">
              <User className="h-4 w-4 text-primary-600" />
              <h3 className="text-sm font-bold uppercase tracking-wider">
                {locale === 'nl' ? 'Contact- & Persoonsgegevens' : 'Contact & Personal Details'}
              </h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold mb-1">
                  {locale === 'nl' ? 'Volledige Naam' : 'Full Name'}
                </label>
                <input
                  type="text"
                  value={custName}
                  onChange={(e) => setCustName(e.target.value)}
                  className={cn(
                    'w-full p-2.5 rounded-lg border text-xs focus:ring-2 focus:ring-primary-500',
                    isDark ? 'bg-[#121218] border-[#323245] text-white' : 'bg-white border-secondary-300'
                  )}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {locale === 'nl' ? 'Telefoonnummer (voor SMS herinnering)' : 'Phone Number (for SMS)'}
                </label>
                <input
                  type="tel"
                  value={custPhone}
                  onChange={(e) => setCustPhone(e.target.value)}
                  className={cn(
                    'w-full p-2.5 rounded-lg border text-xs focus:ring-2 focus:ring-primary-500 font-mono',
                    isDark ? 'bg-[#121218] border-[#323245] text-white' : 'bg-white border-secondary-300'
                  )}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {locale === 'nl' ? 'E-mailadres (voor afspraakbevestigingen)' : 'Email Address (for Confirmations)'}
                </label>
                <input
                  type="email"
                  value={custEmail}
                  onChange={(e) => setCustEmail(e.target.value)}
                  className={cn(
                    'w-full p-2.5 rounded-lg border text-xs focus:ring-2 focus:ring-primary-500',
                    isDark ? 'bg-[#121218] border-[#323245] text-white' : 'bg-white border-secondary-300'
                  )}
                  required
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">
                  {locale === 'nl' ? 'Persoonlijke Notities & Huidsensitiviteit' : 'Personal Preferences & Sensitivities'}
                </label>
                <textarea
                  rows={2}
                  value={allergies}
                  onChange={(e) => setAllergies(e.target.value)}
                  className={cn(
                    'w-full p-2.5 rounded-lg border text-xs focus:ring-2 focus:ring-primary-500',
                    isDark ? 'bg-[#121218] border-[#323245] text-white' : 'bg-white border-secondary-300'
                  )}
                />
              </div>
            </div>
          </Card>

          {/* Card 2: Notifications & Privacy */}
          <div className="space-y-6">
            <Card className="p-5 sm:p-6 space-y-4 border-secondary-200">
              <div className="flex items-center gap-2 pb-2 border-b border-secondary-200 dark:border-[#282838]">
                <Smartphone className="h-4 w-4 text-emerald-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  {locale === 'nl' ? 'Meldingen & Communicatie' : 'Notifications & Alerts'}
                </h3>
              </div>

              <div className="space-y-3 text-xs">
                <label className="flex items-center justify-between p-3 rounded-xl border border-secondary-200 dark:border-[#2d2d3e] cursor-pointer">
                  <div>
                    <p className="font-bold">{locale === 'nl' ? 'SMS Afspraakherinnering (24u vooraf)' : 'SMS Reminder (24h before)'}</p>
                    <p className="text-[11px] text-secondary-500 dark:text-slate-400">
                      {locale === 'nl' ? 'Ontvang 1 dag vooraf een gratis herinnerings-SMS.' : 'Receive automated free SMS 1 day prior.'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsReminders}
                    onChange={(e) => setSmsReminders(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary-600 cursor-pointer"
                  />
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-secondary-200 dark:border-[#2d2d3e] cursor-pointer">
                  <div>
                    <p className="font-bold">{locale === 'nl' ? 'E-mail Boekingsbevestiging & Factuur' : 'Email Confirmation & Invoice'}</p>
                    <p className="text-[11px] text-secondary-500 dark:text-slate-400">
                      {locale === 'nl' ? 'Directe afspraakbevestiging en digitale salonfactuur.' : 'Instant booking email and salon digital receipt.'}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={emailConfirmations}
                    onChange={(e) => setEmailConfirmations(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary-600 cursor-pointer"
                  />
                </label>
              </div>
            </Card>

            <Card className="p-5 sm:p-6 space-y-4 border-secondary-200">
              <div className="flex items-center gap-2 pb-2 border-b border-secondary-200 dark:border-[#282838]">
                <ShieldCheck className="h-4 w-4 text-indigo-600" />
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  {locale === 'nl' ? 'Privacy & AVG / GDPR Rechten' : 'Privacy & Data Rights'}
                </h3>
              </div>

              <div className="space-y-3 text-xs text-secondary-600 dark:text-slate-300">
                <p className="text-[11px] leading-relaxed">
                  {locale === 'nl'
                    ? 'Conform de AVG (Algemene Verordening Gegevensbescherming) heeft u te allen tijde het recht om uw persoonlijke afsprakengeschiedenis en persoonsgegevens in te zien en te exporteren.'
                    : 'In compliance with GDPR, you have the right to inspect and export your personal appointment history and data.'}
                </p>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleExportData}
                  className="text-xs font-semibold"
                >
                  <Copy className="h-3.5 w-3.5 mr-1.5" />
                  {locale === 'nl' ? 'Download Mijn Gegevens (JSON)' : 'Download My Data (JSON)'}
                </Button>
              </div>
            </Card>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-secondary-200 dark:border-[#29293a]">
          <Button
            type="submit"
            variant="primary"
            className="text-xs font-bold text-white shadow-md cursor-pointer"
            style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            {locale === 'nl' ? 'Klantprofiel Opslaan' : 'Save Customer Profile'}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

export function ProfileView({
  store,
  currentSlug,
  isDark = false,
  onSelectTab,
  userRole = 'admin',
  selectedCustomer,
}: ProfileViewProps) {
  if (userRole === 'customer') {
    return (
      <CustomerProfileContent
        store={store}
        currentSlug={currentSlug}
        isDark={isDark}
        onSelectTab={onSelectTab}
        customer={selectedCustomer}
      />
    );
  }

  const { t, locale } = useI18n();
  const { toast } = useToast();
  const cfg = store.config;

  const [activeTab, setActiveTab] = useState<'personal' | 'roster' | 'security'>('personal');

  // Compute default manager per salon
  const defaultManager = useMemo(() => {
    switch (currentSlug) {
      case 'de-kleinste-kapsalon':
        return { name: 'Osman', role: 'Eigenaar & Meesterkapper', email: 'osman@dekleinstekapsalon.nl', phone: '010-4123891', cert: 'Kapper diploma KOC / Meester', chair: 'Stoel 1 (Hoofdwerkplek)', kvk: '24398102' };
      case 'violettas-dog-grooming':
        return { name: 'Violetta', role: 'Gediplomeerd Hondentrimmer', email: 'violetta@trimsalonzuidhorn.nl', phone: '0594-502189', cert: 'ABHB Vakdiploma Hondentoiletteren', chair: 'Trimtafel 1 (Hydraulisch)', kvk: '01128491' };
      case 'kapsalon-issa':
        return { name: 'Issa', role: 'Zaakvoerder & Hoofdkapper', email: 'contact@kapsalon-issa.nl', phone: '010-4658231', cert: 'ANVR / KOC Erkend Kapper', chair: 'Stoel 1 (Inloop & Styling)', kvk: '51298412' };
      case 'salonyourbeauty':
        return { name: 'Tamara', role: 'Klinisch Huidspecialist & Eigenaar', email: 'info@salonyourbeauty.nl', phone: '020-6712398', cert: 'Cidesco / ANBOS Dermatologie', chair: 'Behandelkamer A (Klinisch)', kvk: '34198210' };
      case 'feel-smooth':
        return { name: 'Sarah', role: 'Lasertherapeut & Salonmanager', email: 'afspraak@feelsmooth.nl', phone: '030-2345678', cert: 'Gecertificeerd Diode Laser Specialist', chair: 'Lasercabine 1 (Diode 808nm)', kvk: '30248192' };
      case 'polat-beauty':
        return { name: 'Derya Polat', role: 'Schoonheidsspecialiste & Eigenaar', email: 'info@polatbeauty.nl', phone: '010-8451290', cert: 'ANBOS Allround Schoonheidsspecialist', chair: 'Kamer 1 (Gezichtsbehandeling)', kvk: '55198204' };
      case 'hondentrimsalon-finn':
        return { name: 'Marloes', role: 'Allround Trimsalonspecialist', email: 'marloes@hondentrimsalonfinn.nl', phone: '06-12345678', cert: 'Rijksgediplomeerd Trimmer & Puppy Coach', chair: 'Trimstation Finn (Groot & Klein)', kvk: '61298401' };
      case 'trimsalon-limbo':
        return { name: 'Anita', role: 'Solo Kattentrimmer & Groomer', email: 'anita@trimsalonlimbo.nl', phone: '043-3219876', cert: 'Kattengedragskunde & Vachtverzorging', chair: 'Enkele Salonagenda (Solo)', kvk: '14109284' };
      case 'trimsalon-het-hofje':
        return { name: 'Chantal', role: 'Hoofd Dierverzorging', email: 'chantal@trimsalonhethofje.nl', phone: '023-5312345', cert: 'VBN Erkend Trimbeheerder', chair: 'Trimruimte & Kattenzone', kvk: '34281920' };
      case 'kapsalon-faya':
        return { name: 'Faya', role: 'Krullen- & Stijlspecialist', email: 'info@kapsalonfaya.nl', phone: '020-7891234', cert: 'Curly Girl Method & Texture Expert', chair: 'Stoel 2 (Krullenstation)', kvk: '54289102' };
      case 'kapsalon-van-haaren':
        return { name: 'Dhr. Van Haaren', role: 'Directeur & Stylist', email: 'service@kapsalonvanhaaren.nl', phone: '073-6123456', cert: 'Kappersbond Nederland Meester', chair: 'Stoel 1 (Directie)', kvk: '17129840' };
      case 'kapsalon-headline':
        return { name: 'Mark', role: 'Senior Stylist & Salonbeheerder', email: 'mark@kapsalonheadline.nl', phone: '010-5012345', cert: 'L\'Oréal Professionnel Colour Expert', chair: 'Stoel 1 (Kleurspecialist)', kvk: '24189204' };
      default:
        return { name: cfg.staff?.[0]?.name || 'Beheerder', role: 'Salon Manager', email: `admin@${cfg.slug}.nl`, phone: '06-20000000', cert: 'Geregistreerd Vakspecialist', chair: 'Hoofdwerkplek', kvk: '12345678' };
    }
  }, [currentSlug, cfg.staff, cfg.slug]);

  // Form State
  const [name, setName] = useState(defaultManager.name);
  const [role, setRole] = useState(defaultManager.role);
  const [email, setEmail] = useState(defaultManager.email);
  const [phone, setPhone] = useState(defaultManager.phone);
  const [cert, setCert] = useState(defaultManager.cert);
  const [chair, setChair] = useState(defaultManager.chair);
  const [kvk, setKvk] = useState(defaultManager.kvk);

  // Roster & booking link state
  const [copiedLink, setCopiedLink] = useState(false);
  const [workDays, setWorkDays] = useState<Record<string, boolean>>({ ma: true, di: true, wo: true, do: true, vr: true, za: true, zo: false });
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [lunchBreak, setLunchBreak] = useState('12:30 - 13:00');

  // Security & alerts state
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [quickPin, setQuickPin] = useState('1234');

  // Sync on salon switch
  useEffect(() => {
    setName(defaultManager.name);
    setRole(defaultManager.role);
    setEmail(defaultManager.email);
    setPhone(defaultManager.phone);
    setCert(defaultManager.cert);
    setChair(defaultManager.chair);
    setKvk(defaultManager.kvk);
  }, [defaultManager]);

  const bookingUrl = `https://xpert-booking.nl/${currentSlug}/specialist/${encodeURIComponent(name.toLowerCase().replace(/\s+/g, '-'))}`;

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(bookingUrl);
    setCopiedLink(true);
    toast.success(
      locale === 'nl'
        ? 'Persoonlijke boekingslink gekopieerd naar klembord!'
        : 'Personal booking URL copied to clipboard!'
    );
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success(
      locale === 'nl'
        ? `Specialist profiel voor ${name} succesvol opgeslagen!`
        : `Specialist profile for ${name} saved successfully!`
    );
  };

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader
        eyebrow={locale === 'nl' ? 'Account & Specialist Beheer' : 'Account & Specialist Settings'}
        title={locale === 'nl' ? 'Mijn Specialist Profiel' : 'My Specialist Profile'}
        description={locale === 'nl'
          ? `Beheer uw persoonlijke vakgegevens, diploma's, werkrooster en directe boekingslink voor ${cfg.client}.`
          : `Manage your personal qualifications, diplomas, working roster, and direct booking URL for ${cfg.client}.`}
      />

      {/* Profile Overview Header Card */}
      <div
        className={cn(
          'p-6 rounded-2xl border transition-all shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6',
          isDark ? 'bg-[#181822] border-[#29293a]' : 'bg-white border-secondary-200'
        )}
      >
        <div className="flex items-center gap-4">
          <div className="relative">
            <div
              className="h-16 w-16 rounded-2xl text-white font-extrabold text-2xl flex items-center justify-center shadow-md shadow-primary-500/20"
              style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
            >
              {name.charAt(0)}
            </div>
            <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 ring-2 ring-white dark:ring-[#181822]" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className={cn('text-xl font-bold leading-tight', isDark ? 'text-white' : 'text-secondary-900')}>
                {name}
              </h2>
              <Badge variant="primary" className="text-xs font-semibold">
                {role}
              </Badge>
              <Badge variant="success" className="text-[10px]">
                {locale === 'nl' ? 'Actief & Ingelogd' : 'Active & Logged In'}
              </Badge>
            </div>
            <p className={cn('text-xs mt-1 flex items-center gap-2', isDark ? 'text-slate-400' : 'text-secondary-500')}>
              <Building2 className="h-3.5 w-3.5 text-primary-500" />
              <span>{cfg.client} ({cfg.city})</span>
              <span>•</span>
              <span>{chair}</span>
            </p>
          </div>
        </div>

        {/* Quick Personal Booking Link Card */}
        <div className={cn(
          'p-3.5 rounded-xl border max-w-md w-full flex items-center justify-between gap-3',
          isDark ? 'bg-[#13131c] border-[#2a2a3c]' : 'bg-secondary-50/80 border-secondary-200'
        )}>
          <div className="min-w-0 flex-1">
            <p className="text-[10px] font-bold uppercase tracking-wider text-secondary-500">
              {locale === 'nl' ? 'Directe Boekingslink' : 'Direct Booking Link'}
            </p>
            <p className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400 truncate mt-0.5">
              {bookingUrl}
            </p>
          </div>
          <Button
            size="sm"
            variant="outline"
            onClick={handleCopyLink}
            className="shrink-0 text-xs font-semibold"
          >
            {copiedLink ? <Check className="h-3.5 w-3.5 mr-1 text-emerald-500" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
            {copiedLink ? (locale === 'nl' ? 'Gekopieerd' : 'Copied') : (locale === 'nl' ? 'Kopieer' : 'Copy')}
          </Button>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 border-b border-secondary-200 dark:border-[#262638] pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('personal')}
          className={cn(
            'px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'personal'
              ? isDark
                ? 'bg-[#7c3aed] text-white shadow-xs'
                : 'bg-primary-600 text-white shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-[#1a1a24]'
              : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
          )}
          style={activeTab === 'personal' && !isDark ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
        >
          <User className="h-4 w-4" />
          <span>{locale === 'nl' ? '1. Persoonlijk & Vakdiploma' : '1. Personal & Certifications'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('roster')}
          className={cn(
            'px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'roster'
              ? isDark
                ? 'bg-[#7c3aed] text-white shadow-xs'
                : 'bg-primary-600 text-white shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-[#1a1a24]'
              : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
          )}
          style={activeTab === 'roster' && !isDark ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
        >
          <Clock className="h-4 w-4" />
          <span>{locale === 'nl' ? '2. Werkrooster & Boekingslink' : '2. Roster & Booking Link'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('security')}
          className={cn(
            'px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer',
            activeTab === 'security'
              ? isDark
                ? 'bg-[#7c3aed] text-white shadow-xs'
                : 'bg-primary-600 text-white shadow-xs'
              : isDark
              ? 'text-slate-400 hover:text-white hover:bg-[#1a1a24]'
              : 'text-secondary-600 hover:text-secondary-900 hover:bg-secondary-100'
          )}
          style={activeTab === 'security' && !isDark ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
        >
          <ShieldCheck className="h-4 w-4" />
          <span>{locale === 'nl' ? '3. Meldingen & Beveiliging (2FA)' : '3. Alerts & Security (2FA)'}</span>
        </button>
      </div>

      {/* Tab Content Area */}
      <form onSubmit={handleSaveProfile}>
        {activeTab === 'personal' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4 border-secondary-200">
              <h3 className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                <User className="h-4 w-4 text-primary-600" />
                <span>{locale === 'nl' ? 'Specialist Contactgegevens' : 'Specialist Contact Details'}</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                    {locale === 'nl' ? 'Volledige Naam' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className={cn(
                      'w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500',
                      isDark ? 'bg-[#121218] border-[#343446] text-white' : 'bg-white border-secondary-300'
                    )}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                    {locale === 'nl' ? 'Functietitel / Rol in de Salon' : 'Role in Salon'}
                  </label>
                  <input
                    type="text"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    required
                    className={cn(
                      'w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500',
                      isDark ? 'bg-[#121218] border-[#343446] text-white' : 'bg-white border-secondary-300'
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                      {locale === 'nl' ? 'E-mailadres' : 'Email Address'}
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className={cn(
                        'w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500',
                        isDark ? 'bg-[#121218] border-[#343446] text-white' : 'bg-white border-secondary-300'
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                      {locale === 'nl' ? 'Telefoon / WhatsApp' : 'Phone / WhatsApp'}
                    </label>
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                      className={cn(
                        'w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500',
                        isDark ? 'bg-[#121218] border-[#343446] text-white' : 'bg-white border-secondary-300'
                      )}
                    />
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4 border-secondary-200">
              <h3 className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                <Award className="h-4 w-4 text-primary-600" />
                <span>{locale === 'nl' ? 'Vakdiploma & Salonstation' : 'Certifications & Station'}</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                    {locale === 'nl' ? 'Erkend Vakdiploma / Beroepskwalificatie' : 'Trade Diploma / Qualification'}
                  </label>
                  <input
                    type="text"
                    value={cert}
                    onChange={(e) => setCert(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500',
                      isDark ? 'bg-[#121218] border-[#343446] text-white' : 'bg-white border-secondary-300'
                    )}
                  />
                  <p className="text-[10px] text-secondary-500 mt-1">
                    {locale === 'nl' ? 'bijv. KOC, ABHB, ANBOS, Cidesco of Rijksgediplomeerd Meester' : 'e.g. KOC, ABHB, ANBOS, Cidesco, Master'}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                    {locale === 'nl' ? 'Toegewezen Stoel / Behandelkamer' : 'Assigned Chair / Cabin'}
                  </label>
                  <input
                    type="text"
                    value={chair}
                    onChange={(e) => setChair(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500',
                      isDark ? 'bg-[#121218] border-[#343446] text-white' : 'bg-white border-secondary-300'
                    )}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                    {locale === 'nl' ? 'KVK Registratienummer' : 'Chamber of Commerce (KVK)'}
                  </label>
                  <input
                    type="text"
                    value={kvk}
                    onChange={(e) => setKvk(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 text-xs font-mono rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500',
                      isDark ? 'bg-[#121218] border-[#343446] text-white' : 'bg-white border-secondary-300'
                    )}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'roster' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4 border-secondary-200">
              <h3 className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                <Calendar className="h-4 w-4 text-primary-600" />
                <span>{locale === 'nl' ? 'Persoonlijke Werkdagen' : 'Personal Working Days'}</span>
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { key: 'ma', nl: 'Maandag', en: 'Monday' },
                  { key: 'di', nl: 'Dinsdag', en: 'Tuesday' },
                  { key: 'wo', nl: 'Woensdag', en: 'Wednesday' },
                  { key: 'do', nl: 'Donderdag', en: 'Thursday' },
                  { key: 'vr', nl: 'Vrijdag', en: 'Friday' },
                  { key: 'za', nl: 'Zaterdag', en: 'Saturday' },
                  { key: 'zo', nl: 'Zondag', en: 'Sunday' },
                ].map(({ key, nl, en }) => {
                  const isChecked = workDays[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setWorkDays((prev) => ({ ...prev, [key]: !prev[key] }))}
                      className={cn(
                        'p-2.5 rounded-xl border text-xs font-semibold transition-all text-center cursor-pointer',
                        isChecked
                          ? isDark
                            ? 'bg-purple-950/40 border-purple-500/40 text-purple-200'
                            : 'bg-primary-50 border-primary-300 text-primary-800'
                          : isDark
                          ? 'bg-[#151520] border-[#2c2c3e] text-slate-500 opacity-60'
                          : 'bg-secondary-50 border-secondary-200 text-secondary-400 opacity-60'
                      )}
                    >
                      <div className="font-bold">{locale === 'nl' ? nl.slice(0, 2) : en.slice(0, 2)}</div>
                      <div className="text-[10px] mt-0.5">{isChecked ? (locale === 'nl' ? 'Actief' : 'Open') : (locale === 'nl' ? 'Vrij' : 'Off')}</div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-secondary-100 dark:border-[#252535] grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                    {locale === 'nl' ? 'Aanvang Werktijd' : 'Shift Start'}
                  </label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 text-xs font-mono rounded-lg border focus:outline-hidden',
                      isDark ? 'bg-[#121218] border-[#343446] text-white' : 'bg-white border-secondary-300'
                    )}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                    {locale === 'nl' ? 'Einde Werktijd' : 'Shift End'}
                  </label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className={cn(
                      'w-full px-3 py-2 text-xs font-mono rounded-lg border focus:outline-hidden',
                      isDark ? 'bg-[#121218] border-[#343446] text-white' : 'bg-white border-secondary-300'
                    )}
                  />
                </div>
              </div>
            </Card>

            <Card className="p-6 space-y-4 border-secondary-200">
              <h3 className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                <ExternalLink className="h-4 w-4 text-primary-600" />
                <span>{locale === 'nl' ? 'Directe Boekingspagina Klanten' : 'Direct Booking Page'}</span>
              </h3>

              <div className="space-y-3">
                <p className={cn('text-xs leading-relaxed', isDark ? 'text-slate-400' : 'text-secondary-600')}>
                  {locale === 'nl'
                    ? 'Deel deze persoonlijke URL met uw vaste klanten. Klanten boeken direct in uw persoonlijke agenda zonder door de algemene salonlijst te bladeren.'
                    : 'Share this personal URL with regular clients so they book directly into your chair without searching the salon roster.'}
                </p>

                <div className={cn(
                  'p-3 rounded-xl border flex items-center justify-between gap-3',
                  isDark ? 'bg-[#121218] border-[#343446]' : 'bg-secondary-50 border-secondary-300'
                )}>
                  <span className="font-mono text-xs font-bold text-primary-600 dark:text-primary-400 truncate">
                    {bookingUrl}
                  </span>
                  <Button
                    size="sm"
                    variant="primary"
                    type="button"
                    onClick={handleCopyLink}
                    className="shrink-0 text-xs font-semibold"
                    style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
                  >
                    {copiedLink ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                    {copiedLink ? (locale === 'nl' ? 'Gekopieerd' : 'Copied') : (locale === 'nl' ? 'Kopieer' : 'Copy')}
                  </Button>
                </div>

                <div className="rounded-xl p-3 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>
                    {locale === 'nl'
                      ? 'Automatische 15-minuten slot engine integratie actief voor deze link.'
                      : 'Automatic 15-minute slot engine active on this booking URL.'}
                  </span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 space-y-4 border-secondary-200">
              <h3 className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                <Smartphone className="h-4 w-4 text-primary-600" />
                <span>{locale === 'nl' ? 'Meldingen & Notificaties' : 'Alerts & Notifications'}</span>
              </h3>

              <div className="space-y-3">
                <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-secondary-200 dark:border-[#2b2b3d] cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-secondary-900 dark:text-white block">
                      {locale === 'nl' ? 'SMS-alert bij nieuwe boeking' : 'SMS alert on new booking'}
                    </span>
                    <span className="text-[11px] text-secondary-500">
                      {locale === 'nl' ? 'Ontvang direct een sms op uw telefoon zodra een klant boekt.' : 'Receive an instant text on mobile when booked.'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={smsAlerts}
                    onChange={(e) => setSmsAlerts(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary-600 mt-1 cursor-pointer"
                  />
                </label>

                <label className="flex items-start justify-between gap-3 p-3 rounded-xl border border-secondary-200 dark:border-[#2b2b3d] cursor-pointer">
                  <div>
                    <span className="text-xs font-bold text-secondary-900 dark:text-white block">
                      {locale === 'nl' ? 'Geluidssignaal bij inloopklant' : 'Audio chime on walk-in arrival'}
                    </span>
                    <span className="text-[11px] text-secondary-500">
                      {locale === 'nl' ? 'Speel een subtiele toon af wanneer een klant binnenkomt.' : 'Play subtle chime when client enters salon.'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={soundAlerts}
                    onChange={(e) => setSoundAlerts(e.target.checked)}
                    className="h-4 w-4 rounded accent-primary-600 mt-1 cursor-pointer"
                  />
                </label>
              </div>
            </Card>

            <Card className="p-6 space-y-4 border-secondary-200">
              <h3 className="text-sm font-bold text-secondary-900 dark:text-white flex items-center gap-2">
                <Lock className="h-4 w-4 text-primary-600" />
                <span>{locale === 'nl' ? 'Beveiliging & Snelle Pincode' : 'Security & Terminal PIN'}</span>
              </h3>

              <div className="space-y-4">
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-xs text-purple-900 dark:text-purple-200 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-purple-600 shrink-0" />
                  <div>
                    <p className="font-bold">{locale === 'nl' ? 'Twee-factor Authenticatie (2FA)' : 'Two-Factor Authentication'}</p>
                    <p className="text-[11px] opacity-85">{locale === 'nl' ? 'Ingelogd met veilige hardware-token & sms-bevestiging.' : 'Protected by hardware token & verification.'}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-secondary-700 dark:text-slate-300 mb-1">
                    {locale === 'nl' ? '4-cijferige Kassa / Tablet Snelle Ontgrendelcode' : '4-digit Tablet Quick PIN'}
                  </label>
                  <input
                    type="password"
                    maxLength={4}
                    value={quickPin}
                    onChange={(e) => setQuickPin(e.target.value)}
                    className={cn(
                      'w-32 px-3 py-2 text-center text-sm font-mono tracking-widest font-bold rounded-lg border focus:outline-hidden',
                      isDark ? 'bg-[#121218] border-[#343446] text-white' : 'bg-white border-secondary-300'
                    )}
                  />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Action Toolbar */}
        <div className="mt-6 flex items-center justify-between pt-4 border-t border-secondary-200 dark:border-[#262638]">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              toast.success(
                locale === 'nl'
                  ? `Succesvol afgemeld als ${name}.`
                  : `Successfully logged out as ${name}.`
              );
              onSelectTab?.('dashboard');
            }}
            className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50"
          >
            <LogOut className="h-3.5 w-3.5 mr-1.5" />
            {locale === 'nl' ? 'Afmelden' : 'Logout'}
          </Button>

          <Button
            type="submit"
            variant="primary"
            className="text-xs font-bold text-white shadow-md"
            style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            {locale === 'nl' ? 'Profiel & Instellingen Opslaan' : 'Save Profile & Settings'}
          </Button>
        </div>
      </form>
    </PageContainer>
  );
}

