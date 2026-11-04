import { createContext, useContext, useState, type ReactNode } from 'react';
import { translations, type Locale } from './translations';

interface I18nContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: keyof typeof translations.nl) => string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('nl');

  const toggleLocale = () => {
    setLocale((prev: Locale) => (prev === 'nl' ? 'en' : 'nl'));
  };

  const t = (key: keyof typeof translations.nl): string => {
    const currentDict = locale === 'en' ? translations.en : translations.nl;
    return (currentDict as Record<string, string>)[key] || translations.nl[key] || String(key);
  };

  return (
    <I18nContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}

