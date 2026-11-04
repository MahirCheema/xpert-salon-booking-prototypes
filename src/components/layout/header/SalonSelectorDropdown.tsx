import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import { CLIENT_CONFIGS, CLIENT_SLUGS } from '@/client-configs.js';

interface SalonSelectorDropdownProps {
  currentSlug: string;
  onSelectClient: (slug: string) => void;
  isDark?: boolean;
}

export function SalonSelectorDropdown({
  currentSlug,
  onSelectClient,
  isDark = false,
}: SalonSelectorDropdownProps) {
  const { locale } = useI18n();

  return (
    <div className="flex items-center gap-2">
      <div className="hidden sm:flex items-center gap-1.5 text-xs text-secondary-500 font-medium">
        <Building2 className="h-4 w-4 text-primary-600" />
        <span>{locale === 'nl' ? 'Salon:' : 'Salon:'}</span>
      </div>
      <select
        value={currentSlug}
        onChange={(e) => onSelectClient(e.target.value)}
        className={cn(
          "rounded-lg border px-2.5 py-1.5 text-xs font-semibold shadow-2xs focus:outline-none max-w-55 sm:max-w-70 truncate cursor-pointer",
          isDark
            ? "border-[#323244] bg-[#1a1a24] text-white hover:border-[#424258]"
            : "border-secondary-300 bg-white text-secondary-900 hover:border-secondary-400"
        )}
        aria-label={locale === 'nl' ? 'Selecteer salon' : 'Select salon'}
      >
        {CLIENT_SLUGS.map((slug) => {
          const c = (CLIENT_CONFIGS as Record<string, any>)[slug];
          return (
            <option key={slug} value={slug}>
              {c.client} ({c.type.split('-')[0].trim()} • {c.city})
            </option>
          );
        })}
      </select>
    </div>
  );
}

