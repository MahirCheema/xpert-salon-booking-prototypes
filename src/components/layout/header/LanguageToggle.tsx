import React from 'react';
import { useI18n } from '@/i18n/I18nContext';
import { cn } from '@/lib/utils/cn';

interface LanguageToggleProps {
  isDark?: boolean;
}

export function LanguageToggle({ isDark = false }: LanguageToggleProps) {
  const { locale, setLocale } = useI18n();

  return (
    <div
      className={cn(
        "inline-flex items-center p-0.5 rounded-lg border shadow-2xs select-none transition-colors h-[30px]",
        isDark
          ? "border-[#323244] bg-[#1a1a24]"
          : "border-secondary-300 bg-secondary-100/70"
      )}
      role="group"
      aria-label="Language selector"
    >
      {/* English Button: EN */}
      <button
        type="button"
        onClick={() => setLocale('en')}
        className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer h-6",
          locale === 'en'
            ? isDark
              ? "bg-[#2b2b3a] text-white shadow-2xs border border-white/10"
              : "bg-white text-secondary-900 shadow-2xs border border-secondary-200/90"
            : isDark
            ? "text-slate-400 hover:text-white"
            : "text-secondary-600 hover:text-secondary-900"
        )}
        title="English (EN)"
        aria-pressed={locale === 'en'}
      >
        {/* Miniature UK Flag */}
        <svg className="w-3.5 h-2.5 rounded-2xs shrink-0 overflow-hidden shadow-2xs" viewBox="0 0 60 30" aria-hidden="true">
          <clipPath id="uk-flag-c1"><path d="M0,0 v30 h60 v-30 z"/></clipPath>
          <clipPath id="uk-flag-c2"><path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/></clipPath>
          <g clipPath="url(#uk-flag-c1)">
            <path d="M0,0 v30 h60 v-30 z" fill="#012169"/>
            <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
            <path d="M0,0 L60,30 M60,0 L0,30" clipPath="url(#uk-flag-c2)" stroke="#C8102E" strokeWidth="4"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
            <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
          </g>
        </svg>
        <span>EN</span>
      </button>

      {/* Dutch Button: NL */}
      <button
        type="button"
        onClick={() => setLocale('nl')}
        className={cn(
          "flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-bold transition-all cursor-pointer h-6",
          locale === 'nl'
            ? isDark
              ? "bg-[#2b2b3a] text-white shadow-2xs border border-white/10"
              : "bg-white text-secondary-900 shadow-2xs border border-secondary-200/90"
            : isDark
            ? "text-slate-400 hover:text-white"
            : "text-secondary-600 hover:text-secondary-900"
        )}
        title="Nederlands (NL)"
        aria-pressed={locale === 'nl'}
      >
        {/* Miniature Dutch Flag */}
        <svg className="w-3.5 h-2.5 rounded-2xs shrink-0 overflow-hidden shadow-2xs" viewBox="0 0 9 6" aria-hidden="true">
          <rect width="9" height="2" fill="#AE1C28" />
          <rect y="2" width="9" height="2" fill="#FFFFFF" />
          <rect y="4" width="9" height="2" fill="#21468B" />
        </svg>
        <span>NL</span>
      </button>
    </div>
  );
}
