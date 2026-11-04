import React from 'react';
import { Heart, Camera, Phone } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import type { SalonConfig, ServiceRecord } from '@/core/data-store';

export interface GroomingPolicyChecklistProps {
  isGrooming: boolean;
  config: SalonConfig;
  currentService?: ServiceRecord;
  photoPreview: string | null;
  setPhotoPreview: (val: string | null) => void;
  fleaTreated: boolean;
  setFleaTreated: (val: boolean) => void;
  mattedCoat: boolean;
  setMattedCoat: (val: boolean) => void;
  inHeat: boolean;
  setInHeat: (val: boolean) => void;
  emergencyPhoneReachable: boolean;
  setEmergencyPhoneReachable: (val: boolean) => void;
  catQuietRoom: boolean;
  setCatQuietRoom: (val: boolean) => void;
  isDark?: boolean;
}

export function GroomingPolicyChecklist({
  isGrooming,
  config,
  currentService,
  photoPreview,
  setPhotoPreview,
  fleaTreated,
  setFleaTreated,
  mattedCoat,
  setMattedCoat,
  inHeat,
  setInHeat,
  emergencyPhoneReachable,
  setEmergencyPhoneReachable,
  catQuietRoom,
  setCatQuietRoom,
  isDark = false,
}: GroomingPolicyChecklistProps) {
  const { locale } = useI18n();

  return (
    <>
      {/* Grooming Pre-Visit Intake Protocol & Coat Photo Dropzone */}
      {isGrooming && (
        <div
          className={cn(
            'p-3.5 rounded-xl border space-y-3 transition-colors',
            isDark ? 'bg-[#181822] border-[#2d2d3e]' : 'bg-rose-50/40 border-rose-200'
          )}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
              <Heart className="h-3.5 w-3.5 text-rose-600" />
              <span>{locale === 'nl' ? 'Dierverzorging & Intake Protocol' : 'Pet Care & Intake Protocol'}</span>
            </span>
            <span className="text-[10px] font-mono font-bold text-rose-700 bg-rose-100 dark:bg-rose-950 px-2 py-0.5 rounded-full border border-rose-300 dark:border-rose-800">
              {config.client}
            </span>
          </div>

          {/* Photo Upload Dropzone (Trimsalon Limbo WhatsApp Photo intake) */}
          <div className="space-y-1.5">
            <p className="text-[11px] font-semibold text-secondary-700 dark:text-slate-300">
              {locale === 'nl' ? 'Foto van vachtconditie / klitten (optioneel):' : 'Photo of coat condition / matting (optional):'}
            </p>
            {photoPreview ? (
              <div className="flex items-center justify-between p-2 rounded-lg border bg-white dark:bg-[#121218] border-rose-300">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-md bg-rose-100 flex items-center justify-center text-xs font-bold text-rose-700">
                    📸
                  </div>
                  <span className="text-xs font-medium text-secondary-800 dark:text-white">vacht_inspectie_sample.jpg</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPhotoPreview(null)}
                  className="px-2 py-1 rounded text-rose-600 hover:bg-rose-50 cursor-pointer text-xs font-bold"
                >
                  {locale === 'nl' ? 'Verwijderen' : 'Remove'}
                </button>
              </div>
            ) : (
              <div
                onClick={() => setPhotoPreview('sample_coat_photo.jpg')}
                className={cn(
                  'border-2 border-dashed rounded-xl p-3 text-center cursor-pointer transition-colors',
                  isDark
                    ? 'border-[#3d3d52] hover:border-rose-400 bg-[#14141c]'
                    : 'border-rose-300 hover:border-rose-500 bg-white'
                )}
              >
                <Camera className="h-4 w-4 text-rose-500 mx-auto mb-1" />
                <p className="text-xs font-semibold text-rose-900 dark:text-rose-200">
                  {locale === 'nl' ? 'Klik om vachtfoto te simuleren' : 'Click to simulate coat photo upload'}
                </p>
                <p className="text-[10px] text-secondary-500 mt-0.5">
                  {locale === 'nl' ? 'Directe controle op viltgraad en benodigde trimtijd' : 'Enables groomer to assess matting severity before arrival'}
                </p>
              </div>
            )}
          </div>

          {/* Intake Checkboxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={fleaTreated}
                onChange={(e) => setFleaTreated(e.target.checked)}
                className="h-3.5 w-3.5 rounded accent-rose-600 cursor-pointer"
              />
              <span className="text-[11px] text-secondary-700 dark:text-slate-300">
                {locale === 'nl' ? 'Vlooien/teken behandeling recent' : 'Flea/tick treatment recent'}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={mattedCoat}
                onChange={(e) => setMattedCoat(e.target.checked)}
                className="h-3.5 w-3.5 rounded accent-rose-600 cursor-pointer"
              />
              <span className="text-[11px] text-secondary-700 dark:text-slate-300">
                {locale === 'nl' ? 'Mogelijk klitten / vilt aanwezig' : 'Matted coat disclaimer'}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={inHeat}
                onChange={(e) => setInHeat(e.target.checked)}
                className="h-3.5 w-3.5 rounded accent-rose-600 cursor-pointer"
              />
              <span className="text-[11px] text-secondary-700 dark:text-slate-300">
                {locale === 'nl' ? 'Teef is momenteel loops' : 'Female in heat'}
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={emergencyPhoneReachable}
                onChange={(e) => setEmergencyPhoneReachable(e.target.checked)}
                className="h-3.5 w-3.5 rounded accent-rose-600 cursor-pointer"
              />
              <span className="text-[11px] text-secondary-700 dark:text-slate-300">
                {locale === 'nl' ? 'Telefoon bereikbaar tijdens trimmen' : 'Emergency phone reachable'}
              </span>
            </label>
          </div>

          {/* Cat Quiet Room Flag (Trimsalon het Hofje) */}
          {(config.slug === 'trimsalon-het-hofje' || currentService?.name.toLowerCase().includes('cat') || currentService?.name.toLowerCase().includes('kat')) && (
            <div className="pt-2 border-t border-rose-200/60 dark:border-rose-900/40">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={catQuietRoom}
                  onChange={(e) => setCatQuietRoom(e.target.checked)}
                  className="h-3.5 w-3.5 rounded accent-rose-600 cursor-pointer"
                />
                <span className="text-[11px] font-semibold text-rose-800 dark:text-rose-300">
                  {locale === 'nl' ? '🐱 Aparte kattenruimte reserveren (rustige zone zonder hondenlawaai)' : '🐱 Reserve separate quiet cat room (no dog noise)'}
                </span>
              </label>
            </div>
          )}
        </div>
      )}

      {/* Osman Ambulant Schedule Check (De Kleinste Kapsalon) */}
      {config.slug === 'de-kleinste-kapsalon' && (
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2.5">
          <Phone className="h-4 w-4 text-amber-600 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">{locale === 'nl' ? 'Osman Ambulant Werkschema Controle' : 'Osman Mobile Schedule Check'}</p>
            <p className="text-[10px] opacity-90 mt-0.5">
              {locale === 'nl'
                ? 'Salon waarschuwing actief: afspraak wordt automatisch gemarkeerd ter telefonische controle door Osman i.v.m. ambulante werkzaamheden.'
                : 'Salon warning active: booking flagged for Osman verbal check to prevent ambulant visit conflicts.'}
            </p>
          </div>
        </div>
      )}
    </>
  );
}

