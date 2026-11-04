import React, { useRef, useEffect } from 'react';
import {
  ChevronDown,
  User,
  Clock,
  LogOut,
  Gift,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import { useToast } from '@/components/ui/Toast';
import type { NavTabId } from '../Sidebar';

export interface UserProfileDropdownProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  displayName: string;
  displayRole: string;
  displayEmail: string;
  clientName: string;
  userRole?: 'admin' | 'customer';
  onToggleRole?: (role: 'admin' | 'customer') => void;
  onSelectTab: (tab: NavTabId) => void;
  isDark?: boolean;
}

export function UserProfileDropdown({
  isOpen,
  onOpenChange,
  displayName,
  displayRole,
  displayEmail,
  clientName,
  userRole = 'admin',
  onToggleRole,
  onSelectTab,
  isDark = false,
}: UserProfileDropdownProps) {
  const { locale } = useI18n();
  const { toast } = useToast();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onOpenChange(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onOpenChange]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => onOpenChange(!isOpen)}
        className={cn(
          "flex items-center gap-2 pl-1 pr-2.5 py-1 rounded-full border transition-all cursor-pointer shadow-2xs group select-none shrink-0",
          isDark
            ? "bg-[#1a1a24] border-[#323244] hover:border-[#4d4d66] text-white"
            : "bg-white border-secondary-300 hover:border-secondary-400 text-secondary-900"
        )}
        title={locale === 'nl' ? 'Mijn Profiel & Opties' : 'Profile & Options'}
        aria-expanded={isOpen}
      >
        <div className="relative shrink-0">
          <div className="h-7 w-7 rounded-full bg-linear-to-tr from-primary-600 via-indigo-600 to-purple-600 text-white font-extrabold text-xs flex items-center justify-center shadow-xs">
            {displayName.charAt(0)}
          </div>
          <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-500 ring-1.5 ring-white dark:ring-[#1a1a24]" />
        </div>
        <div className="hidden sm:flex flex-col text-left">
          <span className="text-[11px] font-bold leading-tight group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {displayName}
          </span>
          <span className="text-[9px] text-secondary-500 font-medium leading-none">
            {displayRole}
          </span>
        </div>
        <ChevronDown className={cn(
          "h-3 w-3 text-secondary-400 group-hover:text-secondary-600 dark:group-hover:text-slate-200 transition-transform duration-200",
          isOpen && "rotate-180 text-primary-600"
        )} />
      </button>

      {/* Profile Dropdown Content */}
      {isOpen && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-64 rounded-2xl border shadow-xl py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150",
            isDark
              ? "bg-[#161622] border-[#2c2c3d] text-white shadow-purple-950/40"
              : "bg-white border-secondary-200 text-secondary-900 shadow-slate-300/40"
          )}
        >
          {/* User Summary Header */}
          <div className="px-4 py-2.5 border-b border-secondary-100 dark:border-[#252535]">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-linear-to-tr from-primary-600 to-indigo-600 text-white font-bold flex items-center justify-center text-sm shadow-xs shrink-0">
                {displayName.charAt(0)}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold leading-tight truncate">
                  {displayName}
                </p>
                <p className="text-[10px] text-secondary-500 dark:text-slate-400 truncate mt-0.5">
                  {displayRole}
                </p>
                <p className="text-[10px] font-mono text-secondary-400 truncate">
                  {displayEmail}
                </p>
              </div>
            </div>
            <div className="mt-2 pt-2 border-t border-secondary-100 dark:border-[#222230] flex items-center justify-between text-[10px]">
              <span className="text-secondary-500 dark:text-slate-400">Actieve salon:</span>
              <span className="font-semibold text-primary-600 dark:text-primary-400 truncate max-w-32.5">
                {clientName}
              </span>
            </div>
          </div>

          {/* Dropdown Navigation Actions */}
          <div className="py-1">
            {/* Option 1: Profile */}
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onSelectTab('profile');
              }}
              className={cn(
                "w-full px-4 py-2.5 text-xs flex items-center justify-between text-left transition-colors cursor-pointer group",
                isDark ? "hover:bg-[#202030] text-slate-200" : "hover:bg-secondary-50 text-secondary-800"
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-primary-50 dark:bg-primary-950/50 text-primary-600 dark:text-primary-400">
                  <User className="h-4 w-4" />
                </div>
                <span className="font-semibold group-hover:text-primary-600 dark:group-hover:text-primary-400">
                  {locale === 'nl' ? 'Mijn Profiel' : 'My Profile'}
                </span>
              </div>
              <span className="text-[10px] font-medium text-secondary-400 group-hover:text-primary-500 transition-colors">
                {locale === 'nl' ? 'Openen' : 'Open'} &rarr;
              </span>
            </button>

            {/* Option 2: Opening Hours for Admin OR My Appointments for Customer */}
            {userRole === 'admin' ? (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onSelectTab('hours');
                }}
                className={cn(
                  "w-full px-4 py-2 text-xs flex items-center justify-between text-left transition-colors cursor-pointer group",
                  isDark ? "hover:bg-[#202030] text-slate-200" : "hover:bg-secondary-50 text-secondary-800"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {locale === 'nl' ? 'Openingstijden & Beheer' : 'Hours & Settings'}
                  </span>
                </div>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onSelectTab('appointments');
                }}
                className={cn(
                  "w-full px-4 py-2 text-xs flex items-center justify-between text-left transition-colors cursor-pointer group",
                  isDark ? "hover:bg-[#202030] text-slate-200" : "hover:bg-secondary-50 text-secondary-800"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="font-semibold group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
                    {locale === 'nl' ? 'Mijn Afspraken' : 'My Appointments'}
                  </span>
                </div>
              </button>
            )}

            {/* Option 3: Loyalty & Rewards (if customer) */}
            {userRole === 'customer' && (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onSelectTab('loyalty');
                }}
                className={cn(
                  "w-full px-4 py-2 text-xs flex items-center justify-between text-left transition-colors cursor-pointer group",
                  isDark ? "hover:bg-[#202030] text-slate-200" : "hover:bg-secondary-50 text-secondary-800"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400">
                    <Gift className="h-4 w-4" />
                  </div>
                  <span className="font-semibold group-hover:text-purple-600 dark:group-hover:text-purple-400">
                    {locale === 'nl' ? 'Loyalty & Spaarpunten' : 'Loyalty & Perks'}
                  </span>
                </div>
              </button>
            )}

            {/* Option 4: Switch Role */}
            {onToggleRole && (
              <button
                type="button"
                onClick={() => {
                  onOpenChange(false);
                  onToggleRole(userRole === 'admin' ? 'customer' : 'admin');
                }}
                className={cn(
                  "w-full px-4 py-2 text-xs flex items-center justify-between text-left transition-colors cursor-pointer group",
                  isDark ? "hover:bg-[#202030] text-slate-200" : "hover:bg-secondary-50 text-secondary-800"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="font-semibold group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                    {userRole === 'admin'
                      ? (locale === 'nl' ? 'Klantenportaal Weergave' : 'Customer Portal View')
                      : (locale === 'nl' ? 'Salon Beheer Weergave' : 'Admin Cockpit View')}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400">
                  Wissel &rarr;
                </span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="my-1 border-t border-secondary-100 dark:border-[#252535]" />

          {/* Option: Logout */}
          <div className="py-1">
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                toast.success(
                  locale === 'nl'
                    ? `Succesvol afgemeld als ${displayName}.`
                    : `Successfully logged out as ${displayName}.`
                );
              }}
              className={cn(
                "w-full px-4 py-2 text-xs flex items-center gap-2.5 text-left transition-colors cursor-pointer text-rose-600 dark:text-rose-400",
                isDark ? "hover:bg-rose-950/30" : "hover:bg-rose-50"
              )}
            >
              <div className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400">
                <LogOut className="h-4 w-4" />
              </div>
              <span className="font-semibold">
                {locale === 'nl' ? 'Afmelden' : 'Log Out'}
              </span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

