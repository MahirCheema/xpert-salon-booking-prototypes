import {
  Scissors,
  Clock,
  GraduationCap,
} from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PageContainer } from '@/components/layout/PageContainer';
import { PageHeader } from '@/components/layout/PageHeader';
import type { SalonDataStore } from '@/core/data-store';
import { getServiceBuffer } from '@/core/slot-engine';

export interface ServicesCatalogViewProps {
  store: SalonDataStore;
  onBookService: (serviceName: string) => void;
}

export function ServicesCatalogView({ store, onBookService }: ServicesCatalogViewProps) {
  const { t, locale } = useI18n();
  const cfg = store.config;
  const services = cfg.services || [];

  return (
    <PageContainer size="wide" className="space-y-6">
      <PageHeader
        eyebrow={locale === 'nl' ? 'Dienstencatalogus' : 'Service Catalog'}
        title={locale === 'nl' ? 'Behandelingen, Tarieven & Buffertijden' : 'Services, Pricing & Buffers'}
        description={locale === 'nl'
          ? 'Overzicht van alle behandelingen inclusief behandelduur, automatische buffertijd (10m lang/kleur/grooming, 5m kort) en studententarieven.'
          : 'Full service menu with treatment durations, automated buffers (10m long/colour/groom, 5m short), and student pricing.'}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {services.map((srv, idx: number) => {
          const buffer = getServiceBuffer(srv);
          const price = srv.price_sample_eur;
          const studentPrice = srv.student_price_sample_eur;

          return (
            <Card key={idx} className="p-5 border-secondary-200 flex flex-col justify-between hover:shadow-xs transition-shadow">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-50 text-primary-600 border border-primary-200/60">
                    <Scissors className="h-5 w-5" />
                  </div>
                  {price !== undefined && <Badge variant="sample">SAMPLE PRIJS</Badge>}
                </div>

                <div>
                  <h4 className="font-bold text-secondary-900 dark:text-white text-base">{srv.name}</h4>
                  <div className="flex items-center gap-3 text-xs text-secondary-600 dark:text-slate-400 mt-1 font-mono">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-secondary-500" />
                      {srv.duration_min} {t('duration')}
                    </span>
                    <span className="flex items-center gap-1 text-primary-700 bg-primary-50 px-1.5 py-0.5 rounded text-[11px] font-semibold">
                      +{buffer}m {locale === 'nl' ? 'buffer' : 'buffer'}
                    </span>
                  </div>
                </div>

                {/* Pricing info */}
                <div className="space-y-1.5 pt-2 border-t border-secondary-100 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-secondary-600 dark:text-slate-400">{locale === 'nl' ? 'Standaard tarief:' : 'Standard rate:'}</span>
                    <span className="font-bold text-secondary-900 dark:text-white text-sm font-mono">
                      {price !== undefined ? `€${price}` : t('priceOnRequest')}
                    </span>
                  </div>

                  {studentPrice !== undefined && (
                    <div className="flex items-center justify-between text-indigo-700 font-semibold bg-indigo-50/70 px-2 py-1 rounded">
                      <span className="flex items-center gap-1 text-[11px]">
                        <GraduationCap className="h-3.5 w-3.5" />
                        {locale === 'nl' ? 'Studententarief:' : 'Student rate:'}
                      </span>
                      <span className="font-bold font-mono">€{studentPrice}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="pt-4 mt-3 border-t border-secondary-100 dark:border-[#272733] flex justify-end">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onBookService(srv.name)}
                  className="text-xs"
                >
                  {locale === 'nl' ? 'Behandeling Boeken' : 'Book this service'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </PageContainer>
  );
}

