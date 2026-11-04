import { useState } from 'react';
import {
  Heart,
  Search,
  Plus,
  ShieldCheck,
  AlertTriangle,
  Sparkles,
  Info,
  CheckCircle2,
  Award,
  CircleDashed,
  Volume2,
  Footprints,
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
import type { SalonDataStore, PetRecord } from '@/core/data-store';

export interface PetsViewProps {
  store: SalonDataStore;
  onBookForPet: (petName: string) => void;
  customerMode?: boolean;
  customerClientId?: string;
  customerName?: string;
}

export function PetsView({
  store,
  onBookForPet,
  customerMode = false,
  customerClientId,
  customerName,
}: PetsViewProps) {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const [search, setSearch] = useState('');

  // 3-Stage Puppy Habituation Milestones tracking (Hondentrimsalon Finn)
  // Stage 1: Geuren & Salonverkenning | Stage 2: Tafelgewenning | Stage 3: Föhntraining
  const [puppyMilestones, setPuppyMilestones] = useState<Record<string, number>>({
    'pet-1': 2, // Milo has completed Stage 2
    'pet-2': 1, // Max has completed Stage 1
    'pet-3': 3, // Graduated
  });

  const [addPetModalOpen, setAddPetModalOpen] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [newPetBreed, setNewPetBreed] = useState('');
  const [newPetSpecies, setNewPetSpecies] = useState('Hond');
  const [newPetIsPuppy, setNewPetIsPuppy] = useState(false);

  const handleAdvancePuppyStage = (petId: string, petName: string) => {
    setPuppyMilestones((prev) => {
      const current = prev[petId] || 0;
      const next = Math.min(3, current + 1);
      const stageLabels = [
        '',
        'Fase 1: Geuren & Salonverkenning voltooid',
        'Fase 2: Tafelgewenning & Zachte borstel voltooid',
        'Fase 3: Föhntraining & Voetjes aanraken voltooid (Geslaagd!)',
      ];
      toast({
        title: locale === 'nl' ? 'Puppy Wenbeurt Mijlpaal Behaald!' : 'Puppy Habituation Milestone!',
        description: `${petName}: ${stageLabels[next]}`,
        variant: next === 3 ? 'success' : 'info',
      });
      return { ...prev, [petId]: next };
    });
  };

  const handleAddPet = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName.trim()) return;

    const newPet: PetRecord = {
      id: `pet-${Date.now()}`,
      client_id: store.state.clients[0]?.id || 'client-1',
      name: newPetName.trim(),
      species: newPetSpecies,
      breed: newPetBreed.trim() || 'Kruising',
      coat: 'Standaard vacht',
      behaviour_notes: newPetIsPuppy ? 'Puppy in gewenningstraject' : 'Rustig karakter',
      separate_room_flag: newPetSpecies.toLowerCase().includes('kat'),
      medical_flags: newPetIsPuppy ? ['Puppy (< 6 mnd)'] : [],
      photo_url: null,
      is_sample: false,
    };

    store.state.pets = [newPet, ...(store.state.pets || [])];
    if (newPetIsPuppy) {
      setPuppyMilestones((prev) => ({ ...prev, [newPet.id]: 1 }));
    }

    setAddPetModalOpen(false);
    setNewPetName('');
    setNewPetBreed('');
    setNewPetIsPuppy(false);

    toast({
      title: locale === 'nl' ? 'Huisdier geregistreerd' : 'Pet profile created',
      description: locale === 'nl'
        ? `${newPet.name} (${newPet.breed}) toegevoegd aan de salon database.`
        : `${newPet.name} registered successfully.`,
      variant: 'success',
    });
  };

  const pets = (store.state.pets || []).filter((p) => {
    if (customerMode) {
      const matchOwner =
        (customerClientId && p.client_id === customerClientId) ||
        p.id === 'pet-1'; // Default pet for sample customer
      if (!matchOwner) return false;
    }
    return (
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.breed.toLowerCase().includes(search.toLowerCase()) ||
      p.species.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader
        eyebrow={
          customerMode
            ? (locale === 'nl' ? 'Mijn Geregistreerde Huisdieren' : 'My Registered Pets')
            : (locale === 'nl' ? 'Dierverzorging & Grooming CRM' : 'Animal Grooming CRM')
        }
        title={
          customerMode
            ? (locale === 'nl' ? 'Mijn Huisdierdossiers' : 'My Pet Profiles')
            : (locale === 'nl' ? 'Huisdierdossiers & Vachtprofielen' : 'Pet Dossiers & Coat Profiles')
        }
        description={
          customerMode
            ? (locale === 'nl'
                ? 'Bekijk de geregistreerde vachtprofielen, puppy-gewenning voortgang en speciale dieet-/gezondheidsinstructies van uw huisdier(en).'
                : 'Review registered coat profiles, habituation milestones, and special intake care notes for your pets.')
            : (locale === 'nl'
                ? 'Volledige dossiers met diersoort, vachttype, 3-fasen puppy habituation voortgang (Hondentrimsalon Finn), medische waarschuwingen en kattenrustruimte.'
                : 'Full records with species, coat condition, 3-stage puppy habituation sequence (Hondentrimsalon Finn), medical alerts, and quiet room isolation.')
        }
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setAddPetModalOpen(true)}
            className="text-xs font-bold"
          >
            <Plus className="h-3.5 w-3.5 mr-1" />
            {locale === 'nl' ? 'Nieuw Huisdier Registreren' : 'Register New Pet'}
          </Button>
        }
      />

      {/* Search Bar */}
      <Card className="p-4 border-secondary-200">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-secondary-400" />
          <input
            type="text"
            placeholder={locale === 'nl' ? 'Zoek op naam, ras of diersoort...' : 'Search by pet name, breed or species...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-secondary-300 dark:border-[#323244] bg-white dark:bg-[#1a1a24] text-secondary-900 dark:text-white placeholder-secondary-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
      </Card>

      {/* Pets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {pets.length === 0 ? (
          <div className="col-span-full py-12 text-center text-secondary-500 text-sm">
            {locale === 'nl' ? 'Geen huisdierdossiers gevonden.' : 'No pet records found.'}
          </div>
        ) : (
          pets.map((pet) => {
            const owner = store.state.clients.find((c) => c.id === pet.client_id);
            const isCat = (pet.species + ' ' + (pet.breed || '')).toLowerCase().includes('kat') ||
                          (pet.species + ' ' + (pet.breed || '')).toLowerCase().includes('cat');
            const isPuppy = pet.medical_flags?.some((f) => f.toLowerCase().includes('puppy')) ||
                            pet.behaviour_notes?.toLowerCase().includes('puppy') ||
                            pet.name === 'Milo' || pet.name === 'Luna';
            const milestoneStage = puppyMilestones[pet.id] ?? (isPuppy ? 1 : 0);

            return (
              <Card key={pet.id} className="p-5 border-secondary-200 flex flex-col justify-between hover:shadow-xs transition-shadow relative overflow-hidden">
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <img
                        src={isCat ? '/images/pet-cat.svg' : '/images/pet-doodle.svg'}
                        alt={pet.name}
                        className="h-12 w-12 rounded-xl object-cover border border-rose-200 shadow-2xs shrink-0 bg-white"
                      />
                      <div>
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-bold text-secondary-900 dark:text-white text-base">{pet.name}</h4>
                          {isPuppy && (
                            <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded-full border border-amber-300">
                              🐶 Puppy
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-secondary-500">
                          {pet.species} • <span className="font-medium text-secondary-700 dark:text-slate-300">{pet.breed}</span>
                        </p>
                      </div>
                    </div>
                    {pet.is_sample && <Badge variant="sample">SAMPLE</Badge>}
                  </div>

                  {owner && (
                    <div className="text-xs text-secondary-600 dark:text-slate-300 bg-secondary-50 dark:bg-[#13131c] p-2 rounded-lg border border-secondary-200/60 dark:border-[#272733]">
                      <span className="font-semibold text-secondary-800 dark:text-white">Eigenaar:</span> {owner.name} ({owner.phone})
                    </div>
                  )}

                  {/* 3-Stage Puppy Habituation Progress Sequence (Hondentrimsalon Finn) */}
                  {isPuppy && (
                    <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:bg-amber-950/20 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1">
                          <Award className="h-3.5 w-3.5 text-amber-600" />
                          {locale === 'nl' ? '3-Stappen Puppy Wenbeurt Traject:' : 'Puppy Habituation Sequence:'}
                        </span>
                        <span className="text-[10px] font-mono font-bold text-amber-800 dark:text-amber-400">
                          Fase {milestoneStage} / 3
                        </span>
                      </div>

                      {/* 3 Stage Steps */}
                      <div className="grid grid-cols-3 gap-1.5 text-[9px]">
                        <div className={cn(
                          'p-1.5 rounded text-center border font-semibold transition-colors',
                          milestoneStage >= 1
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : 'bg-white dark:bg-[#1a1a24] text-secondary-500 border-secondary-200'
                        )}>
                          ✓ 1. Geuren
                        </div>
                        <div className={cn(
                          'p-1.5 rounded text-center border font-semibold transition-colors',
                          milestoneStage >= 2
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : 'bg-white dark:bg-[#1a1a24] text-secondary-500 border-secondary-200'
                        )}>
                          {milestoneStage >= 2 ? '✓' : '○'} 2. Tafel & Borstel
                        </div>
                        <div className={cn(
                          'p-1.5 rounded text-center border font-semibold transition-colors',
                          milestoneStage >= 3
                            ? 'bg-emerald-500 text-white border-emerald-600'
                            : 'bg-white dark:bg-[#1a1a24] text-secondary-500 border-secondary-200'
                        )}>
                          {milestoneStage >= 3 ? '✓' : '○'} 3. Föhn & Voetjes
                        </div>
                      </div>

                      {milestoneStage < 3 && !customerMode && (
                        <button
                          type="button"
                          onClick={() => handleAdvancePuppyStage(pet.id, pet.name)}
                          className="w-full text-center py-1 text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 hover:bg-amber-200 rounded border border-amber-300 transition-colors cursor-pointer"
                        >
                          + {locale === 'nl' ? 'Volgende puppy-fase afvinken' : 'Complete next milestone'}
                        </button>
                      )}
                    </div>
                  )}

                  <div className="space-y-1 text-xs text-secondary-600 dark:text-slate-300">
                    <p>
                      <span className="font-semibold text-secondary-700 dark:text-white">Vachttype:</span> {pet.coat || 'Standaard'}
                    </p>
                    {pet.behaviour_notes && (
                      <p>
                        <span className="font-semibold text-secondary-700 dark:text-white">Gedrag:</span> {pet.behaviour_notes}
                      </p>
                    )}
                  </div>

                  {/* Medical & Grooming flags */}
                  {pet.medical_flags && pet.medical_flags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {pet.medical_flags.map((flag, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {flag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Quiet room flag (Trimsalon het Hofje) */}
                  {pet.separate_room_flag && (
                    <div className="p-2 rounded bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 flex items-center gap-1.5 font-medium">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                      <span>{locale === 'nl' ? 'Aparte rustruimte vereist (Katten)' : 'Separate quiet room required'}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 mt-3 border-t border-secondary-100 dark:border-[#272733] flex justify-end">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onBookForPet(pet.name)}
                    className="text-xs font-semibold"
                  >
                    {locale === 'nl' ? 'Trimbeurt inplannen' : 'Schedule grooming'}
                  </Button>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Register New Pet Modal */}
      <Dialog open={addPetModalOpen} onOpenChange={setAddPetModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <Footprints className="h-5 w-5 text-rose-600" />
              <span>{locale === 'nl' ? 'Nieuw Huisdierdossier Registreren' : 'Register New Pet'}</span>
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleAddPet}>
            <div className="px-6 py-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-secondary-800 block mb-1">
                  {locale === 'nl' ? 'Naam van het dier:' : 'Pet Name:'}
                </label>
                <input
                  type="text"
                  required
                  value={newPetName}
                  onChange={(e) => setNewPetName(e.target.value)}
                  placeholder="bv. Bella of Tijger"
                  className="w-full p-2.5 rounded-lg border border-secondary-300 bg-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-secondary-800 block mb-1">
                    {locale === 'nl' ? 'Diersoort:' : 'Species:'}
                  </label>
                  <select
                    value={newPetSpecies}
                    onChange={(e) => setNewPetSpecies(e.target.value)}
                    className="w-full p-2.5 rounded-lg border border-secondary-300 bg-white"
                  >
                    <option value="Hond">Hond</option>
                    <option value="Kat">Kat</option>
                    <option value="Konijn">Konijn</option>
                  </select>
                </div>
                <div>
                  <label className="font-bold text-secondary-800 block mb-1">
                    {locale === 'nl' ? 'Ras:' : 'Breed:'}
                  </label>
                  <input
                    type="text"
                    value={newPetBreed}
                    onChange={(e) => setNewPetBreed(e.target.value)}
                    placeholder="bv. Labradoodle"
                    className="w-full p-2.5 rounded-lg border border-secondary-300 bg-white"
                  />
                </div>
              </div>

              {/* Puppy checkbox */}
              {newPetSpecies === 'Hond' && (
                <div className="p-3 rounded-lg border border-amber-200 bg-amber-50 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-amber-900 block">
                      {locale === 'nl' ? 'Is dit een jonge puppy (< 6 maanden)?' : 'Is this a young puppy (< 6 months)?'}
                    </span>
                    <span className="text-[10px] text-amber-700">
                      {locale === 'nl' ? 'Activeert het 3-stappen habituation programma.' : 'Enables 3-stage habituation.'}
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={newPetIsPuppy}
                    onChange={(e) => setNewPetIsPuppy(e.target.checked)}
                    className="h-4 w-4 text-amber-600 rounded"
                  />
                </div>
              )}
            </div>

            <DialogFooter className="px-6 py-4 bg-secondary-50 border-t border-secondary-200">
              <Button type="button" variant="secondary" onClick={() => setAddPetModalOpen(false)}>
                {t('cancel')}
              </Button>
              <Button type="submit" variant="primary">
                <Footprints className="h-4 w-4 mr-1" />
                {locale === 'nl' ? 'Dossier Aanmaken' : 'Save Pet Profile'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </PageContainer>
  );
}

