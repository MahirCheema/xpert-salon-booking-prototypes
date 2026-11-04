import { Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import type { SalonConfig } from '@/types';

interface ProblemSolvedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  config: SalonConfig;
}

export function ProblemSolvedModal({
  open,
  onOpenChange,
  config,
}: ProblemSolvedModalProps) {
  const { locale } = useI18n();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span>{locale === 'nl' ? 'Probleemanalyse voor deze Salon' : 'Problem Solved for this Salon'}</span>
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 space-y-4 text-sm text-secondary-700">
          <div className="rounded-xl bg-amber-50 border border-amber-200 p-3.5">
            <p className="font-semibold text-amber-900 mb-1">{config.client} ({config.city})</p>
            <p className="text-amber-800 leading-relaxed text-xs">
              {config.problem}
            </p>
          </div>
          <div>
            <p className="font-semibold text-secondary-900 text-xs uppercase tracking-wider mb-2">
              {locale === 'nl' ? 'Hoe dit prototype het oplost:' : 'How this prototype solves it:'}
            </p>
            <ul className="space-y-1.5 text-xs text-secondary-600 list-disc list-inside">
              <li>{locale === 'nl' ? 'Geautomatiseerde 15-minuten slot engine met buffer tijden' : 'Automated 15-minute slot engine with buffer times'}</li>
              <li>{locale === 'nl' ? 'Directe afspraakbevestiging en gesimuleerde herinneringen' : 'Instant booking confirmations & simulated reminders'}</li>
              <li>{locale === 'nl' ? 'Centraal beheerdersdashboard en digitaal klantdossier' : 'Central admin dashboard & digital client dossier'}</li>
              {config.features?.map((f: string) => (
                <li key={f} className="font-mono text-[11px] text-primary-700 font-medium">
                  {f}
                </li>
              ))}
            </ul>
          </div>
        </div>
        <DialogFooter>
          <Button variant="primary" onClick={() => onOpenChange(false)}>
            {locale === 'nl' ? 'Begrepen' : 'Understood'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

