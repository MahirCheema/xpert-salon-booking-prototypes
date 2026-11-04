import React, { useState } from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/Toast';
import { useConfirm } from '@/components/ui/Dialog';
import { Button } from '@/components/ui/Button';
import { store as defaultStore, type SalonDataStore } from '@/core/data-store';
import { AlertTriangle, WifiOff, RefreshCw, ChevronUp, ChevronDown, Bug } from 'lucide-react';

interface ErrorSimulatorProps {
  store?: SalonDataStore;
  onDataReset?: () => void;
}

export const ErrorSimulator: React.FC<ErrorSimulatorProps> = ({ store = defaultStore, onDataReset }) => {
  const { t, locale } = useI18n();
  const { toast } = useToast();
  const confirm = useConfirm();
  const [isExpanded, setIsExpanded] = useState(false);
  const [hasSimulatedNetworkError, setHasSimulatedNetworkError] = useState(false);

  const simulateSlotRace = () => {
    toast({
      title: t('toastErrorTitle'),
      description: t('toastSlotTaken'),
      variant: 'danger',
    });
  };

  const simulateNetworkError = () => {
    setHasSimulatedNetworkError(true);
    toast({
      title: locale === 'nl' ? 'Netwerkfout' : 'Network Error',
      description: t('toastNetworkError'),
      variant: 'danger',
    });
  };

  const retryNetwork = () => {
    setHasSimulatedNetworkError(false);
    toast({
      title: locale === 'nl' ? 'Verbinding hersteld' : 'Connection restored',
      description: locale === 'nl' ? 'De verbinding met de server is opnieuw tot stand gebracht.' : 'Connection with server re-established.',
      variant: 'success',
    });
  };

  const handleResetData = async () => {
    const confirmed = await confirm({
      title: locale === 'nl' ? 'Voorbeelddata resetten?' : 'Reset sample data?',
      description: locale === 'nl'
        ? 'Weet u zeker dat u alle boekingen, wachtrij-items en klantdossiers wilt herstellen naar de originele voorbeeldstatus? Alle nieuw aangemaakte data wordt gewist.'
        : 'Are you sure you want to restore all bookings, waitlist items, and client records to the original sample state? Any newly created data will be cleared.',
      confirmText: locale === 'nl' ? 'Herstellen naar voorbeeld' : 'Reset to sample data',
      cancelText: t('cancel'),
      variant: 'warning',
    });

    if (confirmed) {
      store.resetToInitial();
      toast({
        title: locale === 'nl' ? 'Voorbeelddata hersteld' : 'Sample data restored',
        description: locale === 'nl' ? 'Alle boekingen en dossiers zijn teruggezet naar de demo-toestand.' : 'All bookings and records have been reset to demo state.',
        variant: 'info',
      });
      if (onDataReset) {
        onDataReset();
      }
    }
  };

  return (
    <aside
      aria-label={t('testBarTitle')}
      className="fixed bottom-0 left-0 lg:left-64 right-0 z-40 bg-slate-900/95 text-slate-100 border-t border-slate-700/80 backdrop-blur-md shadow-2xl transition-all duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between py-2.5">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-400 hover:text-amber-300 transition-colors focus:outline-none focus:ring-2 focus:ring-amber-400 rounded px-1.5 py-0.5"
            aria-expanded={isExpanded}
          >
            <Bug className="w-4 h-4" />
            <span>{t('testBarTitle')}</span>
            {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>

          {/* Quick-action buttons visible even when compact */}
          <div className="flex items-center gap-2">
            {hasSimulatedNetworkError && (
              <Button
                variant="outline"
                size="sm"
                onClick={retryNetwork}
                className="bg-emerald-950/80 border-emerald-500 text-emerald-300 hover:bg-emerald-900 text-xs py-1 h-7"
              >
                <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                {locale === 'nl' ? 'Opnieuw proberen (Retry)' : 'Retry connection'}
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={simulateSlotRace}
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white text-xs py-1 h-7"
            >
              <AlertTriangle className="w-3 h-3 mr-1 text-amber-400" />
              <span className="hidden sm:inline">{t('simSlotRace')}</span>
              <span className="sm:hidden">Slot race</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={simulateNetworkError}
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white text-xs py-1 h-7"
            >
              <WifiOff className="w-3 h-3 mr-1 text-rose-400" />
              <span className="hidden sm:inline">{t('simNetworkError')}</span>
              <span className="sm:hidden">Netwerkfout</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleResetData}
              className="bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:text-white text-xs py-1 h-7"
            >
              <RefreshCw className="w-3 h-3 mr-1 text-sky-400" />
              <span className="hidden sm:inline">{t('resetData')}</span>
              <span className="sm:hidden">Reset</span>
            </Button>
          </div>
        </div>

        {/* Expanded documentation of tested scenarios */}
        {isExpanded && (
          <div className="pb-4 pt-1 border-t border-slate-800 grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
            <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700/60">
              <span className="font-semibold text-amber-400 block mb-1">1. Slot Net Vergeven (Race)</span>
              <p className="text-slate-400 leading-relaxed">
                Simuleert dat een ander gelijktijdig hetzelfde tijdslot reserveert. Toont een fout-toast, bewaart ingevulde klantgegevens en herlaadt beschikbare tijden.
              </p>
            </div>
            <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700/60">
              <span className="font-semibold text-rose-400 block mb-1">2. Gesimuleerde Netwerkfout</span>
              <p className="text-slate-400 leading-relaxed">
                Simuleert tijdelijke verbindingsproblemen. Er wordt niets geboekt; er verschijnt een waarschuwings-toast en een actieve Retry-knop.
              </p>
            </div>
            <div className="p-2.5 rounded bg-slate-800/60 border border-slate-700/60">
              <span className="font-semibold text-sky-400 block mb-1">3. Bevestigingsdialoog & Reset</span>
              <p className="text-slate-400 leading-relaxed">
                Demonstreert de destructieve actie Confirm Dialog (focus trapped, Escape-toets, actielabels) en herstelt alle 12 salons naar de schone SAMPLE staat.
              </p>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
