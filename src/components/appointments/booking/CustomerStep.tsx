import React from 'react';
import { User, Heart } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import { Badge } from '@/components/ui/Badge';
import type { ClientRecord } from '@/core/data-store';

export interface CustomerStepProps {
  clientMode: 'existing' | 'new';
  setClientMode: (mode: 'existing' | 'new') => void;
  selectedClientId: string;
  setSelectedClientId: (id: string) => void;
  clients: ClientRecord[];
  selectedExistingClient?: ClientRecord;
  newClientName: string;
  setNewClientName: (val: string) => void;
  newClientPhone: string;
  setNewClientPhone: (val: string) => void;
  newClientEmail: string;
  setNewClientEmail: (val: string) => void;
  isGrooming: boolean;
  petName: string;
  setPetName: (val: string) => void;
  petBreed: string;
  setPetBreed: (val: string) => void;
  isCustomerMode?: boolean;
  isDark?: boolean;
}

export function CustomerStep({
  clientMode,
  setClientMode,
  selectedClientId,
  setSelectedClientId,
  clients,
  selectedExistingClient,
  newClientName,
  setNewClientName,
  newClientPhone,
  setNewClientPhone,
  newClientEmail,
  setNewClientEmail,
  isGrooming,
  petName,
  setPetName,
  petBreed,
  setPetBreed,
  isCustomerMode = false,
  isDark = false,
}: CustomerStepProps) {
  const { locale } = useI18n();

  return (
    <div
      className={cn(
        'p-4 rounded-xl border space-y-3.5',
        isDark
          ? 'bg-[#1a1a24] border-[#2d2d3e]'
          : 'bg-secondary-50/50 border-secondary-200'
      )}
    >
      <div className="flex items-center justify-between">
        <label className={cn('text-xs font-bold uppercase tracking-wider flex items-center gap-1.5', isDark ? 'text-slate-300' : 'text-secondary-700')}>
          <User className="h-3.5 w-3.5 text-primary-600" />
          <span>{locale === 'nl' ? '1. Klantgegevens' : '1. Customer Details'}</span>
        </label>

        {/* Toggle Existing vs New (Hidden in customer portal mode) */}
        {!isCustomerMode && (
          <div className="flex items-center gap-1 p-0.5 rounded-lg border text-xs bg-white dark:bg-[#121218] border-secondary-200 dark:border-[#333345]">
            <button
              type="button"
              onClick={() => setClientMode('existing')}
              className={cn(
                'px-2.5 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer',
                clientMode === 'existing'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-secondary-600 dark:text-slate-400 hover:text-secondary-900'
              )}
              style={clientMode === 'existing' && !isDark ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
            >
              {locale === 'nl' ? 'Bestaande Klant' : 'Existing Client'}
            </button>
            <button
              type="button"
              onClick={() => setClientMode('new')}
              className={cn(
                'px-2.5 py-1 rounded-md font-semibold text-xs transition-colors cursor-pointer',
                clientMode === 'new'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-secondary-600 dark:text-slate-400 hover:text-secondary-900'
              )}
              style={clientMode === 'new' && !isDark ? { backgroundColor: 'var(--primary, #2563eb)' } : undefined}
            >
              {locale === 'nl' ? '+ Nieuwe Klant' : '+ New Client'}
            </button>
          </div>
        )}
      </div>

      {isCustomerMode && selectedExistingClient ? (
        <div className={cn(
          'p-3 rounded-xl border flex items-center justify-between',
          isDark ? 'bg-[#14141c] border-[#292938]' : 'bg-white border-secondary-200 shadow-2xs'
        )}>
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-linear-to-tr from-primary-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs">
              {selectedExistingClient.name.charAt(0)}
            </div>
            <div>
              <span className="font-bold text-xs text-secondary-900 dark:text-white block">
                {selectedExistingClient.name}
              </span>
              <span className="text-[11px] text-secondary-500 font-mono">
                {selectedExistingClient.phone} • {selectedExistingClient.email}
              </span>
            </div>
          </div>
          <Badge variant="primary" className="text-[10px]">
            {locale === 'nl' ? 'Geverifieerd Account' : 'Verified Client'}
          </Badge>
        </div>
      ) : clientMode === 'existing' ? (
        <div className="space-y-2">
          <select
            value={selectedClientId}
            onChange={(e) => setSelectedClientId(e.target.value)}
            className={cn(
              'w-full px-3 py-2 text-xs font-medium rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500 transition-colors',
              isDark
                ? 'bg-[#121218] border-[#36364a] text-white'
                : 'bg-white border-secondary-300 text-secondary-900'
            )}
          >
            {clients.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.phone || 'Geen telefoon'}) {c.email ? `• ${c.email}` : ''}
              </option>
            ))}
          </select>

          {selectedExistingClient && (
            <div className={cn(
              'p-2.5 rounded-lg border text-xs flex items-center justify-between',
              isDark ? 'bg-[#14141c] border-[#292938] text-slate-300' : 'bg-white border-secondary-200 text-secondary-600'
            )}>
              <span className="font-semibold text-secondary-900 dark:text-white">
                {selectedExistingClient.name}
              </span>
              <span className="font-mono text-secondary-500">
                {selectedExistingClient.phone}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div>
            <label className="block text-[11px] font-semibold text-secondary-600 dark:text-slate-400 mb-1">
              {locale === 'nl' ? 'Naam *' : 'Name *'}
            </label>
            <input
              type="text"
              required
              placeholder="bijv. Sophie van Dijk"
              value={newClientName}
              onChange={(e) => setNewClientName(e.target.value)}
              className={cn(
                'w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500',
                isDark ? 'bg-[#121218] border-[#36364a] text-white' : 'bg-white border-secondary-300'
              )}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-secondary-600 dark:text-slate-400 mb-1">
              {locale === 'nl' ? 'Telefoon *' : 'Phone *'}
            </label>
            <input
              type="tel"
              required
              placeholder="06-12345678"
              value={newClientPhone}
              onChange={(e) => setNewClientPhone(e.target.value)}
              className={cn(
                'w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500',
                isDark ? 'bg-[#121218] border-[#36364a] text-white' : 'bg-white border-secondary-300'
              )}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-secondary-600 dark:text-slate-400 mb-1">
              {locale === 'nl' ? 'E-mail (optioneel)' : 'Email (optional)'}
            </label>
            <input
              type="email"
              placeholder="sophie@example.nl"
              value={newClientEmail}
              onChange={(e) => setNewClientEmail(e.target.value)}
              className={cn(
                'w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-primary-500',
                isDark ? 'bg-[#121218] border-[#36364a] text-white' : 'bg-white border-secondary-300'
              )}
            />
          </div>
        </div>
      )}

      {/* If Pet Grooming Salon: Pet name & breed */}
      {isGrooming && (
        <div className="pt-2 border-t border-dashed border-secondary-200 dark:border-[#2d2d3e] grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <div>
            <label className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 mb-1 flex items-center gap-1">
              <Heart className="h-3 w-3" />
              <span>{locale === 'nl' ? 'Naam Huisdier' : 'Pet Name'}</span>
            </label>
            <input
              type="text"
              placeholder="bijv. Max, Luna, Bobby"
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              className={cn(
                'w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-rose-500',
                isDark ? 'bg-[#121218] border-[#36364a] text-white' : 'bg-white border-secondary-300'
              )}
            />
          </div>
          <div>
            <label className="block text-[11px] font-semibold text-rose-700 dark:text-rose-400 mb-1">
              {locale === 'nl' ? 'Ras / Diersoort' : 'Breed / Animal'}
            </label>
            <input
              type="text"
              placeholder="bijv. Labradoodle, Boomer"
              value={petBreed}
              onChange={(e) => setPetBreed(e.target.value)}
              className={cn(
                'w-full px-3 py-2 text-xs rounded-lg border focus:outline-hidden focus:ring-2 focus:ring-rose-500',
                isDark ? 'bg-[#121218] border-[#36364a] text-white' : 'bg-white border-secondary-300'
              )}
            />
          </div>
        </div>
      )}
    </div>
  );
}

