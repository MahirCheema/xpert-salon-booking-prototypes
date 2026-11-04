import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Award,
  Clock,
  ExternalLink,
  Check,
  Copy,
  Smartphone,
  Volume2,
  KeyRound,
  LogOut,
  CheckCircle2,
  User,
  Lock,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/Toast';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogFooter } from '@/components/ui/Dialog';
import type { SalonConfig } from '@/types';

export interface SpecialistProfileModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentSlug: string;
  config: SalonConfig;
  defaultManager: {
    name: string;
    role: string;
    email: string;
    phone: string;
    cert: string;
    chair: string;
    kvk: string;
  };
}

export function SpecialistProfileModal({
  open,
  onOpenChange,
  currentSlug,
  config,
  defaultManager,
}: SpecialistProfileModalProps) {
  const { t, locale } = useI18n();
  const { toast } = useToast();

  const [profileTab, setProfileTab] = useState<'personal' | 'roster' | 'security'>('personal');
  const [profileName, setProfileName] = useState(defaultManager.name);
  const [profileEmail, setProfileEmail] = useState(defaultManager.email);
  const [profilePhone, setProfilePhone] = useState(defaultManager.phone);
  const [profileRole, setProfileRole] = useState(defaultManager.role);
  const [copiedLink, setCopiedLink] = useState(false);
  const [smsAlerts, setSmsAlerts] = useState(true);
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [quickPin, setQuickPin] = useState('1234');
  const [workDays, setWorkDays] = useState<Record<string, boolean>>({ ma: true, di: true, wo: true, do: true, vr: true, za: true, zo: false });

  // Sync state when switching salons
  useEffect(() => {
    setProfileName(defaultManager.name);
    setProfileEmail(defaultManager.email);
    setProfilePhone(defaultManager.phone);
    setProfileRole(defaultManager.role);
  }, [defaultManager]);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    onOpenChange(false);
    toast({
      title: locale === 'nl' ? 'Profiel succesvol bijgewerkt' : 'Profile updated successfully',
      description: locale === 'nl' ? `Gegevens voor ${profileName} zijn opgeslagen.` : `Settings saved for ${profileName}.`,
      variant: 'success',
    });
  };

  const handleCopyBookingLink = () => {
    const link = `https://xpert-booking.nl/${currentSlug}/specialist/${profileName.toLowerCase()}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(link);
    }
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
    toast({
      title: locale === 'nl' ? 'Boekingslink gekopieerd' : 'Booking link copied',
      description: link,
      variant: 'info',
    });
  };

  const handleSimulateLogout = () => {
    onOpenChange(false);
    toast({
      title: locale === 'nl' ? 'Sessie beëindigd' : 'Session ended',
      description: locale === 'nl' ? `Tot ziens ${profileName}! U bent veilig afgemeld.` : `Goodbye ${profileName}! Successfully signed out.`,
      variant: 'info',
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl overflow-hidden p-0">
        {/* Header Banner */}
        <div className="relative p-6 bg-linear-to-r from-primary-700 via-indigo-700 to-purple-800 text-white">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 text-white font-black text-2xl flex items-center justify-center shadow-lg">
                  {profileName.charAt(0)}
                </div>
                <span className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-400 border-2 border-white shadow-xs" title="Online" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black">{profileName}</h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 backdrop-blur-md px-2 py-0.5 rounded-full border border-white/30 text-emerald-200">
                    <ShieldCheck className="h-3 w-3" /> Geverifieerd
                  </span>
                </div>
                <p className="text-xs text-white/90 font-medium mt-0.5">{profileRole}</p>
                <p className="text-[11px] text-white/70 mt-1 font-mono">
                  📍 {config.client} • {config.city}
                </p>
              </div>
            </div>

            {/* Quick KPI stats badge */}
            <div className="hidden sm:flex items-center gap-3 bg-black/20 backdrop-blur-md p-2.5 rounded-xl border border-white/10 text-xs">
              <div className="text-center px-2">
                <span className="text-[10px] text-white/70 block">Afspraken</span>
                <span className="font-mono font-bold text-sm">142</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="text-center px-2">
                <span className="text-[10px] text-white/70 block">Score</span>
                <span className="font-mono font-bold text-sm text-amber-300">★ 4.9</span>
              </div>
              <div className="w-px h-6 bg-white/20" />
              <div className="text-center px-2">
                <span className="text-[10px] text-white/70 block">Status</span>
                <span className="font-bold text-[11px] text-emerald-300">Actief</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 mt-6 border-b border-white/20 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setProfileTab('personal')}
              className={cn(
                "pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
                profileTab === 'personal'
                  ? "border-white text-white font-bold"
                  : "border-transparent text-white/70 hover:text-white"
              )}
            >
              <User className="h-3.5 w-3.5" />
              <span>{locale === 'nl' ? 'Persoonlijk & Salon' : 'Personal & Salon'}</span>
            </button>
            <button
              type="button"
              onClick={() => setProfileTab('roster')}
              className={cn(
                "pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
                profileTab === 'roster'
                  ? "border-white text-white font-bold"
                  : "border-transparent text-white/70 hover:text-white"
              )}
            >
              <Clock className="h-3.5 w-3.5" />
              <span>{locale === 'nl' ? 'Werkrooster & Boekingslink' : 'Roster & Link'}</span>
            </button>
            <button
              type="button"
              onClick={() => setProfileTab('security')}
              className={cn(
                "pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5",
                profileTab === 'security'
                  ? "border-white text-white font-bold"
                  : "border-transparent text-white/70 hover:text-white"
              )}
            >
              <Lock className="h-3.5 w-3.5" />
              <span>{locale === 'nl' ? 'Meldingen & Beveiliging' : 'Alerts & Security'}</span>
            </button>
          </div>
        </div>

        {/* Form Content Body */}
        <form onSubmit={handleSaveProfile}>
          <div className="p-6 space-y-4 max-h-[55vh] overflow-y-auto text-xs">
            {/* TAB 1: PERSONAL & SALON */}
            {profileTab === 'personal' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-secondary-800 dark:text-slate-200 block mb-1">
                      {locale === 'nl' ? 'Volledige Naam Specialist:' : 'Full Name:'}
                    </label>
                    <input
                      type="text"
                      required
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-secondary-300 dark:border-[#323244] bg-white dark:bg-[#1a1a24] text-secondary-900 dark:text-white font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-secondary-800 dark:text-slate-200 block mb-1">
                      {locale === 'nl' ? 'Functie / Specialistische Titel:' : 'Role:'}
                    </label>
                    <input
                      type="text"
                      required
                      value={profileRole}
                      onChange={(e) => setProfileRole(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-secondary-300 dark:border-[#323244] bg-white dark:bg-[#1a1a24] text-secondary-900 dark:text-white font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-secondary-800 dark:text-slate-200 block mb-1">
                      {locale === 'nl' ? 'Zakelijk E-mailadres:' : 'Email Address:'}
                    </label>
                    <input
                      type="email"
                      required
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-secondary-300 dark:border-[#323244] bg-white dark:bg-[#1a1a24] text-secondary-900 dark:text-white font-mono"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-secondary-800 dark:text-slate-200 block mb-1">
                      {locale === 'nl' ? 'Direct Telefoonnummer:' : 'Phone Number:'}
                    </label>
                    <input
                      type="tel"
                      required
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      className="w-full p-2.5 rounded-lg border border-secondary-300 dark:border-[#323244] bg-white dark:bg-[#1a1a24] text-secondary-900 dark:text-white font-mono"
                    />
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-secondary-200 dark:border-[#2b2b3d] bg-secondary-50 dark:bg-[#151520] space-y-2">
                  <div className="flex items-center gap-2 font-bold text-secondary-900 dark:text-white text-xs">
                    <Award className="h-4 w-4 text-primary-600" />
                    <span>{locale === 'nl' ? 'Beroepskwalificatie & Toewijzing' : 'Professional Certification & Chair'}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-[11px]">
                    <div>
                      <span className="text-secondary-500 block">Vakdiploma / Registratie:</span>
                      <span className="font-bold text-secondary-800 dark:text-slate-200">{defaultManager.cert}</span>
                    </div>
                    <div>
                      <span className="text-secondary-500 block">Vaste Behandelplek / Stoel:</span>
                      <span className="font-bold text-secondary-800 dark:text-slate-200">{defaultManager.chair}</span>
                    </div>
                    <div>
                      <span className="text-secondary-500 block">KVK Handelsregisternummer:</span>
                      <span className="font-mono font-bold text-secondary-800 dark:text-slate-200">{defaultManager.kvk}</span>
                    </div>
                    <div>
                      <span className="text-secondary-500 block">Vestigingslocatie:</span>
                      <span className="font-bold text-secondary-800 dark:text-slate-200">{config.city}, Nederland</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: ROSTER & LINK */}
            {profileTab === 'roster' && (
              <div className="space-y-4">
                {/* Working Days Checkboxes */}
                <div>
                  <label className="font-bold text-secondary-800 dark:text-slate-200 block mb-1.5">
                    {locale === 'nl' ? 'Actieve Werkdagen in het Salonrooster:' : 'Active Working Days in Roster:'}
                  </label>
                  <div className="grid grid-cols-7 gap-1.5">
                    {[
                      { key: 'ma', label: 'Ma' },
                      { key: 'di', label: 'Di' },
                      { key: 'wo', label: 'Wo' },
                      { key: 'do', label: 'Do' },
                      { key: 'vr', label: 'Vr' },
                      { key: 'za', label: 'Za' },
                      { key: 'zo', label: 'Zo' },
                    ].map((day) => (
                      <button
                        key={day.key}
                        type="button"
                        onClick={() => setWorkDays((prev) => ({ ...prev, [day.key]: !prev[day.key] }))}
                        className={cn(
                          "py-2 rounded-lg text-center font-bold text-xs border transition-all cursor-pointer",
                          workDays[day.key]
                            ? "bg-primary-600 text-white border-primary-600 shadow-xs"
                            : "bg-secondary-100 dark:bg-[#1a1a24] text-secondary-400 border-secondary-200 dark:border-[#323244]"
                        )}
                      >
                        {day.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl border border-secondary-200 dark:border-[#2b2b3d] bg-secondary-50 dark:bg-[#151520]">
                    <span className="font-bold text-secondary-800 dark:text-slate-200 block mb-0.5">
                      {locale === 'nl' ? 'Standaard Lunchpauze:' : 'Lunch Break:'}
                    </span>
                    <span className="font-mono text-secondary-600 dark:text-slate-400 text-xs">
                      12:30 - 13:00 (30 min geblokkeerd)
                    </span>
                  </div>
                  <div className="p-3 rounded-xl border border-secondary-200 dark:border-[#2b2b3d] bg-secondary-50 dark:bg-[#151520]">
                    <span className="font-bold text-secondary-800 dark:text-slate-200 block mb-0.5">
                      {locale === 'nl' ? 'Behandelbuffer:' : 'Buffer Time:'}
                    </span>
                    <span className="font-mono text-secondary-600 dark:text-slate-400 text-xs">
                      10 min na intensieve behandelingen
                    </span>
                  </div>
                </div>

                {/* Personal Direct Booking Link */}
                <div className="p-3.5 rounded-xl border border-indigo-200 dark:border-indigo-900/50 bg-indigo-50/70 dark:bg-indigo-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-indigo-950 dark:text-indigo-200 flex items-center gap-1.5">
                      <ExternalLink className="h-4 w-4 text-indigo-600" />
                      {locale === 'nl' ? 'Persoonlijke Directe Boekingslink voor Klanten' : 'Direct Booking Link for Clients'}
                    </span>
                    <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-semibold bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded-full">
                      Live
                    </span>
                  </div>
                  <p className="text-[11px] text-indigo-900/80 dark:text-indigo-300">
                    {locale === 'nl'
                      ? 'Deel deze link in WhatsApp of e-mail. Klanten boeken direct bij u in het rooster:'
                      : 'Share this link with clients to book appointments directly with you:'}
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={`https://xpert-booking.nl/${currentSlug}/specialist/${profileName.toLowerCase()}`}
                      className="flex-1 p-2 rounded-lg border border-indigo-200 dark:border-indigo-800 bg-white dark:bg-[#151520] font-mono text-[11px] text-indigo-900 dark:text-indigo-200 select-all"
                    />
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      onClick={handleCopyBookingLink}
                      className="text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                    >
                      {copiedLink ? <Check className="h-3.5 w-3.5 mr-1" /> : <Copy className="h-3.5 w-3.5 mr-1" />}
                      {copiedLink ? (locale === 'nl' ? 'Gekopieerd!' : 'Copied!') : (locale === 'nl' ? 'Kopieer' : 'Copy')}
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 3: SECURITY & ALERTS */}
            {profileTab === 'security' && (
              <div className="space-y-4">
                {/* Notification Toggles */}
                <div className="space-y-2.5">
                  <label className="font-bold text-secondary-800 dark:text-slate-200 block">
                    {locale === 'nl' ? 'Notificatievoorkeuren:' : 'Notification Preferences:'}
                  </label>

                  <div className="p-3 rounded-xl border border-secondary-200 dark:border-[#2b2b3d] bg-white dark:bg-[#181820] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Smartphone className="h-4 w-4 text-primary-600" />
                      <div>
                        <span className="font-bold block text-secondary-900 dark:text-white">
                          {locale === 'nl' ? 'SMS-Alert bij Nieuwe Boeking' : 'SMS Alert on New Booking'}
                        </span>
                        <span className="text-[10px] text-secondary-500">
                          {locale === 'nl' ? 'Direct sms-bericht bij online reservering.' : 'Instant text message upon online booking.'}
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={smsAlerts}
                      onChange={(e) => setSmsAlerts(e.target.checked)}
                      className="h-4 w-4 text-primary-600 rounded cursor-pointer"
                    />
                  </div>

                  <div className="p-3 rounded-xl border border-secondary-200 dark:border-[#2b2b3d] bg-white dark:bg-[#181820] flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <Volume2 className="h-4 w-4 text-primary-600" />
                      <div>
                        <span className="font-bold block text-secondary-900 dark:text-white">
                          {locale === 'nl' ? 'Geluidssignaal bij Inloopklant' : 'Chime on Walk-in Arrival'}
                        </span>
                        <span className="text-[10px] text-secondary-500">
                          {locale === 'nl' ? 'Speel een zacht belgeluid af op de salon-tablet.' : 'Audio chime when a walk-in is queued.'}
                        </span>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={soundAlerts}
                      onChange={(e) => setSoundAlerts(e.target.checked)}
                      className="h-4 w-4 text-primary-600 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {/* Security PIN & 2FA */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl border border-secondary-200 dark:border-[#2b2b3d] bg-secondary-50 dark:bg-[#151520] space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-secondary-900 dark:text-white">
                      <ShieldCheck className="h-4 w-4 text-emerald-600" />
                      <span>2-Staps Verificatie (2FA)</span>
                    </div>
                    <p className="text-[10px] text-secondary-600 dark:text-slate-400">
                      {locale === 'nl' ? 'Beveiligd via Google Authenticator app.' : 'Secured via Authenticator app.'}
                    </p>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded">
                      ✓ Actief Ingeschakeld
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl border border-secondary-200 dark:border-[#2b2b3d] bg-secondary-50 dark:bg-[#151520] space-y-1.5">
                    <div className="flex items-center gap-2 font-bold text-secondary-900 dark:text-white">
                      <KeyRound className="h-4 w-4 text-indigo-600" />
                      <span>{locale === 'nl' ? 'Kassa Snel-PIN:' : 'Terminal Quick PIN:'}</span>
                    </div>
                    <input
                      type="password"
                      maxLength={4}
                      value={quickPin}
                      onChange={(e) => setQuickPin(e.target.value)}
                      className="w-full p-1.5 rounded border border-secondary-300 dark:border-[#323244] bg-white dark:bg-[#1a1a24] text-center font-mono font-bold tracking-widest text-sm"
                    />
                    <span className="text-[10px] text-secondary-500 block text-center">
                      {locale === 'nl' ? '4-cijferige pincode' : '4-digit unlock PIN'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <DialogFooter className="px-6 py-4 bg-secondary-50 dark:bg-[#151520] border-t border-secondary-200 dark:border-[#2b2b3d] flex items-center justify-between">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleSimulateLogout}
              className="text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200"
            >
              <LogOut className="h-3.5 w-3.5 mr-1 text-rose-600" />
              {locale === 'nl' ? 'Afmelden' : 'Log Out'}
            </Button>

            <div className="flex items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={() => onOpenChange(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="primary" size="sm" className="font-bold">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                {locale === 'nl' ? 'Profiel Opslaan' : 'Save Profile'}
              </Button>
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

