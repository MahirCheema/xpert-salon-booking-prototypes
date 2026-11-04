import { useState } from 'react';
import { Phone, MapPin, Globe, Clock, Languages, Calendar, ShieldCheck, Sparkles } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { CLIENT_CONFIGS, CLIENT_SLUGS } from '@/client-configs.js';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';

interface ShellHeaderProps {
  currentSlug: string;
  onSelectClient: (slug: string) => void;
  viewMode: 'booking' | 'admin';
  onChangeViewMode: (mode: 'booking' | 'admin') => void;
}

export function ShellHeader({
  currentSlug,
  onSelectClient,
  viewMode,
  onChangeViewMode,
}: ShellHeaderProps) {
  const { t, locale, toggleLocale } = useI18n();
  const configs = CLIENT_CONFIGS as Record<string, any>;
  const config = configs[currentSlug] || configs['kapsalon-issa'];
  const [hoursOpen, setHoursOpen] = useState(false);

  return (
    <header className="border-b border-secondary-200 bg-white">
      {/* Top Utility Bar */}
      <div className="border-b border-secondary-200 bg-secondary-900 px-4 py-2.5 text-xs text-white">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-md bg-primary-600 px-2 py-0.5 font-bold uppercase tracking-wider text-[11px] text-white">
              <ShieldCheck className="h-3.5 w-3.5" />
              {t('portalBadge')}
            </span>

            <div className="flex items-center gap-2">
              <span className="text-secondary-400 font-medium">{t('clientSelector')}</span>
              <select
                value={currentSlug}
                onChange={(e) => onSelectClient(e.target.value)}
                className="cursor-pointer rounded-md border border-secondary-700 bg-secondary-800 px-2.5 py-1 text-xs font-semibold text-white outline-none hover:border-secondary-500 focus:ring-1 focus:ring-primary-500"
              >
                {CLIENT_SLUGS.map((slug) => {
                  const c = configs[slug];
                  return (
                    <option key={slug} value={slug}>
                      {c.client} ({c.type.split('-')[0].trim()} • {c.city})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Toggle (NL / EN) */}
            <button
              type="button"
              onClick={toggleLocale}
              className="inline-flex items-center gap-1.5 rounded-md border border-secondary-700 bg-secondary-800 px-2.5 py-1 font-semibold text-white transition-all hover:bg-secondary-700"
              title="Toggle language (Dutch / English)"
            >
              <Languages className="h-3.5 w-3.5 text-primary-400" />
              <span>{locale === 'nl' ? '🇳🇱 NL' : '🇬🇧 EN'}</span>
            </button>

            {/* View Mode Toggle (Booking vs Admin) */}
            <div className="inline-flex rounded-lg bg-secondary-800 p-0.5 border border-secondary-700">
              <button
                type="button"
                onClick={() => onChangeViewMode('booking')}
                className={`rounded-md px-3 py-1 font-medium transition-all ${
                  viewMode === 'booking'
                    ? 'bg-primary-600 text-white shadow-xs font-semibold'
                    : 'text-secondary-400 hover:text-white'
                }`}
              >
                {t('viewBooking')}
              </button>
              <button
                type="button"
                onClick={() => onChangeViewMode('admin')}
                className={`rounded-md px-3 py-1 font-medium transition-all ${
                  viewMode === 'admin'
                    ? 'bg-primary-600 text-white shadow-xs font-semibold'
                    : 'text-secondary-400 hover:text-white'
                }`}
              >
                {t('viewAdmin')}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Brand Hero Area */}
      <div className="bg-surface px-4 py-6 transition-colors" style={{ backgroundColor: 'var(--surface)' }}>
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-accent" style={{ color: 'var(--accent)' }}>
                <span className="h-2 w-2 rounded-full bg-current"></span>
                <span>{config.type} • {config.city}</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-secondary-900 sm:text-3xl" style={{ color: 'var(--primary)' }}>
                {config.client}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-secondary-600 sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-4 w-4 text-secondary-400" />
                  {config.contact?.phone || 'Zie website'}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-4 w-4 text-secondary-400" />
                  {config.contact?.address || config.city}
                </span>
                {config.website && (
                  <a
                    href={config.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-primary-600 hover:underline"
                  >
                    <Globe className="h-4 w-4" />
                    Website
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Button
                variant="outline"
                size="sm"
                leftIcon={<Clock className="h-4 w-4" />}
                onClick={() => setHoursOpen(true)}
              >
                {t('hoursBtn')}
              </Button>
            </div>
          </div>

          {/* Problem Solved Banner */}
          <div className="mt-4 flex items-start gap-3 rounded-xl border border-secondary-200/80 bg-white/90 p-3.5 text-xs shadow-xs sm:text-sm">
            <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-accent" style={{ color: 'var(--accent)' }} />
            <div>
              <strong className="font-semibold text-secondary-900">{t('problemSolved')}</strong>{' '}
              <span className="text-secondary-700">{config.problem}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Opening Hours Modal */}
      <Dialog open={hoursOpen} onOpenChange={setHoursOpen}>
        <DialogContent onClose={() => setHoursOpen(false)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary-600" />
              {t('hoursTitle')} — {config.client}
            </DialogTitle>
          </DialogHeader>
          <div className="p-6 pt-2">
            <div className="divide-y divide-secondary-100 rounded-xl border border-secondary-200 bg-secondary-50/50 p-2">
              {Object.entries(config.hours || {}).map(([day, time]) => (
                <div key={day} className="flex justify-between py-2 px-3 text-sm">
                  <span className="font-semibold text-secondary-800">{day}</span>
                  <span className="text-secondary-600">{String(time)}</span>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setHoursOpen(false)}>
              {t('close')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </header>
  );
}

