import React, { useState } from 'react';
import {
  Sparkles,
  Search,
  Plus,
  CheckCircle,
  Clock,
  User,
  FileText,
  CalendarCheck,
  CreditCard,
  Ticket,
  ShieldCheck,
  Activity,
  Droplet,
  Layers,
  Award,
  Calendar,
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
import type { SalonDataStore, TreatmentCourseRecord } from '@/core/data-store';

export interface CoursesViewProps {
  store: SalonDataStore;
}

export function CoursesView({ store }: CoursesViewProps) {
  const { t, locale } = useI18n();
  const { toast } = useToast();

  const [selectedCourse, setSelectedCourse] = useState<TreatmentCourseRecord | null>(null);
  const [noteModalOpen, setNoteModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');

  // Clinical skin parameters for Schoonheidssalon Yourbeauty
  const [fitzpatrick, setFitzpatrick] = useState('Type II (Licht)');
  const [hydrationLevel, setHydrationLevel] = useState('Vochtarm (40-69%)');
  const [sebumProfile, setSebumProfile] = useState('Gecombineerd');
  const [peelAcid, setPeelAcid] = useState('Kalahari D-Peel (Mild)');
  const [erythemaReaction, setErythemaReaction] = useState('Milde erytheem (normaal)');

  // Prepaid Packages / Strippenkaarten for Feel Smooth & Polat Beauty
  const [packages, setPackages] = useState([
    {
      id: 'pkg-1',
      client_name: 'Sophie van Dijk',
      service_title: 'Laser Diode Ontharing 6-Rittenkaart (Oksels & Bikinilijn)',
      total_credits: 6,
      used_credits: 4,
      package_price_eur: 280,
      savings_eur: 70,
      expiry_date: '2027-05-15',
    },
    {
      id: 'pkg-2',
      client_name: 'Elena Rostova',
      service_title: 'Kalahari C-Peel 5-Behandelingen Strippenkaart',
      total_credits: 5,
      used_credits: 2,
      package_price_eur: 340,
      savings_eur: 60,
      expiry_date: '2027-08-01',
    },
    {
      id: 'pkg-3',
      client_name: 'Laura Visser',
      service_title: 'HydraFacial Glow & Peel 4-Sessies Pakket',
      total_credits: 4,
      used_credits: 1,
      package_price_eur: 220,
      savings_eur: 45,
      expiry_date: '2027-03-30',
    },
  ]);
  const [newPackageModalOpen, setNewPackageModalOpen] = useState(false);
  const [newPkgClient, setNewPkgClient] = useState('');
  const [newPkgTitle, setNewPkgTitle] = useState('Laser Ontharing 6-Rittenkaart');
  const [newPkgCredits, setNewPkgCredits] = useState(6);
  const [newPkgPrice, setNewPkgPrice] = useState(280);

  const courses = store.state.treatmentCourses || [];

  const handleAdvanceSession = (course: TreatmentCourseRecord) => {
    store.advanceCourseSession(course.id);
    toast({
      title: locale === 'nl' ? 'Sessie geregistreerd' : 'Session recorded',
      description: locale === 'nl'
        ? `Sessie ${course.completed_sessions + 1} van ${course.total_sessions} voltooid voor ${course.client_name}.`
        : `Session ${course.completed_sessions + 1} of ${course.total_sessions} completed for ${course.client_name}.`,
      variant: 'success',
    });
  };

  const handleDeductCredit = (pkgId: string) => {
    setPackages((prev) =>
      prev.map((pkg) => {
        if (pkg.id === pkgId && pkg.used_credits < pkg.total_credits) {
          const nextUsed = pkg.used_credits + 1;
          const remaining = pkg.total_credits - nextUsed;
          toast({
            title: locale === 'nl' ? 'Sessie afgeboekt van strippenkaart' : 'Session credit redeemed',
            description: locale === 'nl'
              ? `1 tegoed verbruikt voor ${pkg.client_name}. Resterend saldo: ${remaining} sessie(s).`
              : `1 credit redeemed for ${pkg.client_name}. Remaining balance: ${remaining} session(s).`,
            variant: 'success',
          });
          return { ...pkg, used_credits: nextUsed };
        }
        return pkg;
      })
    );
  };

  const handleCreatePackage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgClient.trim()) return;

    const newPkg = {
      id: `pkg-${Date.now()}`,
      client_name: newPkgClient.trim(),
      service_title: newPkgTitle,
      total_credits: Number(newPkgCredits),
      used_credits: 0,
      package_price_eur: Number(newPkgPrice),
      savings_eur: 50,
      expiry_date: '2027-12-31',
    };

    setPackages((prev) => [newPkg, ...prev]);
    setNewPackageModalOpen(false);
    setNewPkgClient('');
    toast({
      title: locale === 'nl' ? 'Nieuwe strippenkaart uitgegeven' : 'Prepaid package issued',
      description: locale === 'nl'
        ? `${newPkgTitle} (${newPkgCredits} sessies) succesvol geactiveerd voor ${newPkgClient}.`
        : `Package (${newPkgCredits} sessions) issued for ${newPkgClient}.`,
      variant: 'success',
    });
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourse) return;

    const formattedNote = `[Fitzpatrick: ${fitzpatrick} | Hydratatie: ${hydrationLevel} | Sebum: ${sebumProfile} | Peeling: ${peelAcid} | Reactie: ${erythemaReaction}] ${newNote.trim()}`;
    store.addSkinAnalysisNote(selectedCourse.id, formattedNote);
    setNoteModalOpen(false);
    setNewNote('');
    toast({
      title: locale === 'nl' ? 'Huidanalyse notitie opgeslagen' : 'Skin analysis note added',
      description: locale === 'nl' ? 'Klinische parameters gekoppeld aan de kuurbehandeling.' : 'Clinical skin metrics recorded in treatment course history.',
      variant: 'success',
    });
  };

  return (
    <PageContainer size="wide" className="space-y-8">
      {/* Top Header with New Package Button */}
      <PageHeader
        eyebrow={locale === 'nl' ? 'Schoonheid, Laser & Kuurbeheer' : 'Beauty, Laser & Aesthetic Courses'}
        title={locale === 'nl' ? 'Kuurbehandelingen & Strippenkaarten' : 'Treatment Courses & Prepaid Packages'}
        description={locale === 'nl'
          ? 'Beheer van prepaid rittenkaarten (Feel Smooth & Polat Beauty), meer-sessies kuurtracking en dermatologische huidanalyse-observaties (Schoonheidssalon Yourbeauty).'
          : 'Prepaid package management (Feel Smooth & Polat Beauty), multi-session course progression, and clinical skin analysis dossiers (Schoonheidssalon Yourbeauty).'}
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setNewPackageModalOpen(true)}
            className="text-xs font-bold"
          >
            <Ticket className="h-3.5 w-3.5 mr-1.5" />
            {locale === 'nl' ? 'Nieuwe Strippenkaart Uitgeven' : 'Issue Prepaid Package'}
          </Button>
        }
      />

      {/* SECTION 1: Prepaid Packages / Strippenkaarten Balance Manager */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ticket className="h-5 w-5 text-indigo-600" />
            <h3 className="text-base font-bold text-secondary-900 dark:text-white">
              {locale === 'nl' ? 'Actieve Strippenkaarten & Saldo Tegoeden' : 'Prepaid Packages & Balance Passes'}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              {packages.length} {locale === 'nl' ? 'pakketten' : 'packages'}
            </span>
          </div>
          <span className="text-xs text-secondary-500 font-medium hidden sm:inline">
            {locale === 'nl' ? '✓ Saldo direct afboekbaar per bezoek' : '✓ 1-Click credit deduction per visit'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {packages.map((pkg) => {
            const remaining = pkg.total_credits - pkg.used_credits;
            const pct = Math.round((pkg.used_credits / pkg.total_credits) * 100);

            return (
              <Card
                key={pkg.id}
                className="p-5 border-secondary-200 dark:border-[#272733] bg-white dark:bg-[#181820] flex flex-col justify-between hover:shadow-xs transition-shadow relative overflow-hidden"
              >
                {/* Accent line on top */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-indigo-500 to-purple-600" />

                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-indigo-700 bg-indigo-50 dark:bg-indigo-950/50 dark:text-indigo-300 px-2 py-0.5 rounded uppercase">
                        <CreditCard className="h-3 w-3" />
                        {locale === 'nl' ? 'Prepaid Tegoed' : 'Prepaid Pass'}
                      </span>
                      <h4 className="font-bold text-sm text-secondary-900 dark:text-white mt-1">
                        {pkg.service_title}
                      </h4>
                      <p className="text-xs font-semibold text-secondary-700 dark:text-slate-300 mt-0.5">
                        👤 {pkg.client_name}
                      </p>
                    </div>
                    <Badge variant="sample">SAMPLE</Badge>
                  </div>

                  {/* Pricing & Savings */}
                  <div className="flex items-center justify-between text-xs bg-secondary-50 dark:bg-[#121217] p-2.5 rounded-lg border border-secondary-100 dark:border-[#272733]">
                    <div>
                      <span className="text-[10px] text-secondary-500 block">
                        {locale === 'nl' ? 'Pakketprijs' : 'Package Total'}
                      </span>
                      <span className="font-bold text-secondary-900 dark:text-white font-mono">
                        €{pkg.package_price_eur}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-emerald-600 block font-semibold">
                        {locale === 'nl' ? 'Klantvoordeel' : 'Client Savings'}
                      </span>
                      <span className="font-bold text-emerald-600 font-mono">
                        -€{pkg.savings_eur}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar of Sessions */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold">
                      <span className="text-secondary-600 dark:text-slate-400">
                        {locale === 'nl' ? 'Tegoed verbruikt:' : 'Credits used:'}
                      </span>
                      <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
                        {pkg.used_credits} / {pkg.total_credits} ({remaining} {locale === 'nl' ? 'over' : 'left'})
                      </span>
                    </div>
                    <div className="w-full bg-secondary-100 dark:bg-[#272733] h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>

                  <p className="text-[11px] text-secondary-500 dark:text-slate-400">
                    {locale === 'nl' ? 'Geldig tot:' : 'Valid until:'} <span className="font-mono font-medium">{pkg.expiry_date}</span>
                  </p>
                </div>

                {/* Redeem Credit Action */}
                <div className="pt-3 mt-3 border-t border-secondary-100 dark:border-[#272733] flex items-center justify-between">
                  <span className="text-[11px] font-bold text-secondary-600 dark:text-slate-400">
                    {remaining === 0
                      ? (locale === 'nl' ? 'Strippenkaart verbruikt' : 'Package exhausted')
                      : `${remaining} ${locale === 'nl' ? 'sessie(s) resterend' : 'session(s) left'}`}
                  </span>
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={remaining === 0}
                    onClick={() => handleDeductCredit(pkg.id)}
                    className="text-xs bg-indigo-600 hover:bg-indigo-700 text-white font-bold"
                  >
                    <CheckCircle className="h-3.5 w-3.5 mr-1" />
                    {locale === 'nl' ? 'Sessie Afboeken (-1)' : 'Redeem 1 Credit'}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* SECTION 2: Clinical Treatment Courses & Skin Analysis */}
      <div className="space-y-4 pt-4 border-t border-secondary-200 dark:border-[#272733]">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <h3 className="text-base font-bold text-secondary-900 dark:text-white">
              {locale === 'nl' ? 'Kuurbehandelingen & Klinische Huidanalyses' : 'Treatment Courses & Clinical Skin Dossiers'}
            </h3>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              Schoonheidssalon Yourbeauty
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.length === 0 ? (
            <div className="col-span-full py-12 text-center text-secondary-500 text-sm">
              {locale === 'nl' ? 'Geen actieve kuurbehandelingen geregistreerd.' : 'No active treatment courses registered.'}
            </div>
          ) : (
            courses.map((c) => {
              const percentage = Math.round((c.completed_sessions / c.total_sessions) * 100);

              return (
                <Card key={c.id} className="p-6 border-secondary-200 space-y-4 hover:shadow-xs transition-shadow">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-pink-500 via-purple-500 to-indigo-600 text-white shadow-2xs shrink-0">
                        <Sparkles className="h-6 w-6 text-amber-200" />
                      </div>
                      <div>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase">
                          <Sparkles className="h-3 w-3" />
                          {locale === 'nl' ? 'Kuurbehandeling' : 'Treatment Course'}
                        </span>
                        <h4 className="text-base font-bold text-secondary-900 dark:text-white mt-0.5">{c.service_name}</h4>
                        <p className="text-xs text-secondary-600 dark:text-slate-400 font-medium">{c.client_name}</p>
                      </div>
                    </div>
                    {c.is_sample && <Badge variant="sample">SAMPLE</Badge>}
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-semibold text-secondary-700 dark:text-slate-300">
                      <span>{locale === 'nl' ? 'Sessie Voortgang' : 'Session Progress'}</span>
                      <span className="font-mono text-primary-600">
                        {c.completed_sessions} / {c.total_sessions} ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full bg-secondary-100 dark:bg-[#272733] h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-primary-600 h-full rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Next due date */}
                  {c.next_due_date && (
                    <div className="flex items-center gap-2 text-xs text-secondary-600 dark:text-slate-300 bg-secondary-50 dark:bg-[#13131c] p-2.5 rounded-lg border border-secondary-200/60 dark:border-[#272733]">
                      <Clock className="h-4 w-4 text-secondary-500" />
                      <span>{locale === 'nl' ? 'Aanbevolen volgende sessie:' : 'Recommended next session:'}</span>
                      <span className="font-bold text-secondary-900 dark:text-white font-mono">{c.next_due_date}</span>
                    </div>
                  )}

                  {/* Skin analysis notes with clinical tags */}
                  <div className="space-y-2 pt-2 border-t border-secondary-100 dark:border-[#272733]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-secondary-800 dark:text-slate-200 flex items-center gap-1.5">
                        <Activity className="h-3.5 w-3.5 text-primary-600" />
                        {locale === 'nl' ? 'Dermatologische Dossiers & Observaties' : 'Skin Analysis Dossier'}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCourse(c);
                          setNoteModalOpen(true);
                        }}
                        className="text-xs text-primary-600 hover:text-primary-700 font-bold cursor-pointer"
                      >
                        + {locale === 'nl' ? 'Klinische Notitie' : 'Add Note'}
                      </button>
                    </div>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {c.skin_analysis_notes.map((n, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 text-[11px] text-amber-950 dark:text-amber-200 space-y-1">
                          <div className="flex items-center justify-between font-mono font-bold text-amber-800 dark:text-amber-400">
                            <span>📅 {n.date}</span>
                            <span className="text-[10px] bg-amber-100 dark:bg-amber-900/50 px-1.5 py-0.5 rounded">Geverifieerd</span>
                          </div>
                          <p className="leading-relaxed">{n.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-secondary-100 dark:border-[#272733] flex items-center justify-between">
                    <span className="text-xs text-secondary-500">
                      {c.completed_sessions >= c.total_sessions
                        ? (locale === 'nl' ? 'Kuur voltooid' : 'Course complete')
                        : `${c.total_sessions - c.completed_sessions} ${locale === 'nl' ? 'sessies te gaan' : 'sessions remaining'}`}
                    </span>
                    {c.completed_sessions < c.total_sessions && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleAdvanceSession(c)}
                        className="text-xs"
                      >
                        <CheckCircle className="h-3.5 w-3.5 mr-1" />
                        {locale === 'nl' ? 'Volgende Sessie Voltooien' : 'Complete Session'}
                      </Button>
                    )}
                  </div>
                </Card>
              );
            })
          )}
        </div>
      </div>

      {/* Add Clinical Skin Analysis Note Modal */}
      <Dialog open={noteModalOpen} onOpenChange={setNoteModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-amber-500" />
              <span>{locale === 'nl' ? 'Klinische Huidanalyse Parameters Vastleggen' : 'Record Clinical Skin Parameters'}</span>
            </DialogTitle>
            <p className="text-xs text-secondary-500 mt-1">
              {locale === 'nl'
                ? 'Dermatologische parameters per behandelsessie voor Schoonheidssalon Yourbeauty.'
                : 'Structured clinical skin diagnostics per session for Schoonheidssalon Yourbeauty.'}
            </p>
          </DialogHeader>

          <form onSubmit={handleAddNote}>
            <div className="px-6 py-4 space-y-4">
              {selectedCourse && (
                <div className="rounded-xl border border-secondary-200 bg-secondary-50/80 p-3.5 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-secondary-500">
                      {locale === 'nl' ? 'Klant & Kuur' : 'Client & Course'}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full border border-amber-200">
                      <Sparkles className="h-3 w-3 text-amber-600" />
                      Sessie {selectedCourse.completed_sessions} / {selectedCourse.total_sessions}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-secondary-900">{selectedCourse.client_name}</h4>
                      <p className="text-xs text-secondary-600 font-medium">{selectedCourse.service_name}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Structured Clinical Selectors */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                {/* Fitzpatrick Scale */}
                <div>
                  <label className="font-bold text-secondary-700 block mb-1">
                    {locale === 'nl' ? 'Fitzpatrick Huidtype:' : 'Fitzpatrick Scale:'}
                  </label>
                  <select
                    value={fitzpatrick}
                    onChange={(e) => setFitzpatrick(e.target.value)}
                    className="w-full p-2 rounded-lg border border-secondary-300 text-xs font-semibold bg-white"
                  >
                    <option value="Type I (Zeer licht, verbrandt altijd)">Type I (Zeer licht)</option>
                    <option value="Type II (Licht, verbrandt snel)">Type II (Licht)</option>
                    <option value="Type III (Lichtbruin, verbrandt soms)">Type III (Lichtbruin)</option>
                    <option value="Type IV (Olijfkleurig, bruint snel)">Type IV (Olijfkleur)</option>
                    <option value="Type V (Bruin, donkere huid)">Type V (Bruin)</option>
                    <option value="Type VI (Donkerbruin tot zwart)">Type VI (Zeer donker)</option>
                  </select>
                </div>

                {/* Hydration Moisture Level */}
                <div>
                  <label className="font-bold text-secondary-700 block mb-1">
                    {locale === 'nl' ? 'Vochtgehalte (Hydratatie):' : 'Hydration Level:'}
                  </label>
                  <select
                    value={hydrationLevel}
                    onChange={(e) => setHydrationLevel(e.target.value)}
                    className="w-full p-2 rounded-lg border border-secondary-300 text-xs font-semibold bg-white"
                  >
                    <option value="Optimaal (70-100%)">Optimaal (70-100%)</option>
                    <option value="Vochtarm (40-69%)">Vochtarm (40-69%)</option>
                    <option value="Zeer vochtarm (<40%)">Zeer vochtarm (&lt;40%)</option>
                  </select>
                </div>

                {/* Sebum Profile */}
                <div>
                  <label className="font-bold text-secondary-700 block mb-1">
                    {locale === 'nl' ? 'Talgproductie / Sebum:' : 'Sebum Profile:'}
                  </label>
                  <select
                    value={sebumProfile}
                    onChange={(e) => setSebumProfile(e.target.value)}
                    className="w-full p-2 rounded-lg border border-secondary-300 text-xs font-semibold bg-white"
                  >
                    <option value="Normaal">Normaal</option>
                    <option value="Talgarm / Droog">Talgarm / Droog</option>
                    <option value="Gecombineerd (T-zone vet)">Gecombineerd</option>
                    <option value="Seborroïsch / Vettig">Seborroïsch / Vet</option>
                  </select>
                </div>

                {/* Peeling Acid Step */}
                <div>
                  <label className="font-bold text-secondary-700 block mb-1">
                    {locale === 'nl' ? 'Toegepaste Peeling / Zuur:' : 'Peel Applied:'}
                  </label>
                  <select
                    value={peelAcid}
                    onChange={(e) => setPeelAcid(e.target.value)}
                    className="w-full p-2 rounded-lg border border-secondary-300 text-xs font-semibold bg-white"
                  >
                    <option value="Geen peeling (reinigend)">Geen peeling</option>
                    <option value="Kalahari D-Peel (Mild)">Kalahari D-Peel (Mild)</option>
                    <option value="Glycolzuur 20% (pH 3.2)">Glycolzuur 20%</option>
                    <option value="Melkzuur 30% (Hydraterend)">Melkzuur 30%</option>
                    <option value="Salicylzuur 2% (Zuiverend)">Salicylzuur 2%</option>
                  </select>
                </div>
              </div>

              {/* Free text clinical notes */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-secondary-900">
                  {locale === 'nl' ? 'Dermatologische Observatie & Thuisadvies:' : 'Clinical Notes & Homecare:'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  className="w-full p-3 text-xs rounded-xl border border-secondary-300 focus:ring-2 focus:ring-primary-500 bg-white shadow-2xs leading-relaxed"
                  placeholder={locale === 'nl'
                    ? 'bv. Lichte erytheem op jukbeenderen, trekt na 20 min weg. Barrièreherstelcrème en SPF50 voorgeschreven voor komende 7 dagen.'
                    : 'e.g. Mild erythema on zygomatic arch, resolved in 20m. Prescribed barrier cream and SPF50 for 7 days.'}
                />
              </div>
            </div>

            <DialogFooter className="px-6 py-4 bg-secondary-50/80 border-t border-secondary-200">
              <Button type="button" variant="secondary" onClick={() => setNoteModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="primary">
                <Sparkles className="h-4 w-4 mr-1.5" />
                {locale === 'nl' ? 'Klinische Notitie Opslaan' : 'Save Clinical Note'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Issue New Prepaid Package Modal */}
      <Dialog open={newPackageModalOpen} onOpenChange={setNewPackageModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Ticket className="h-5 w-5 text-indigo-600" />
              <span>{locale === 'nl' ? 'Nieuwe Strippenkaart Uitgeven' : 'Issue Prepaid Package'}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleCreatePackage}>
            <div className="px-6 py-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-secondary-800 block mb-1">
                  {locale === 'nl' ? 'Klantnaam:' : 'Client Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={newPkgClient}
                  onChange={(e) => setNewPkgClient(e.target.value)}
                  placeholder="bv. Anouk de Jong"
                  className="w-full p-2.5 rounded-lg border border-secondary-300 bg-white"
                />
              </div>

              <div>
                <label className="font-bold text-secondary-800 block mb-1">
                  {locale === 'nl' ? 'Kuur / Behandelpakket:' : 'Package Name:'}
                </label>
                <select
                  value={newPkgTitle}
                  onChange={(e) => setNewPkgTitle(e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-secondary-300 bg-white font-semibold"
                >
                  <option value="Laser Diode Ontharing 6-Rittenkaart">Laser Diode Ontharing (6 Ritten)</option>
                  <option value="Kalahari C-Peel 5-Behandelingen Strippenkaart">Kalahari C-Peel (5 Sessies)</option>
                  <option value="HydraFacial Glow 4-Sessies Pakket">HydraFacial Glow (4 Sessies)</option>
                  <option value="Microneedling Collageen 3-Kuur">Microneedling Collageen (3 Sessies)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-secondary-800 block mb-1">
                    {locale === 'nl' ? 'Aantal Sessies:' : 'Total Credits:'}
                  </label>
                  <input
                    type="number"
                    min="2"
                    max="12"
                    value={newPkgCredits}
                    onChange={(e) => setNewPkgCredits(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-secondary-300 bg-white font-mono"
                  />
                </div>
                <div>
                  <label className="font-bold text-secondary-800 block mb-1">
                    {locale === 'nl' ? 'Totaalprijs (€):' : 'Price (€):'}
                  </label>
                  <input
                    type="number"
                    min="50"
                    value={newPkgPrice}
                    onChange={(e) => setNewPkgPrice(Number(e.target.value))}
                    className="w-full p-2.5 rounded-lg border border-secondary-300 bg-white font-mono font-bold"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="px-6 py-4 bg-secondary-50/80 border-t border-secondary-200">
              <Button type="button" variant="secondary" onClick={() => setNewPackageModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="primary">
                <Ticket className="h-4 w-4 mr-1.5" />
                {locale === 'nl' ? 'Strippenkaart Activeren' : 'Activate Package'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

