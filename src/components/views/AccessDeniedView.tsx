import React from 'react';
import { ShieldAlert, ArrowLeft, Home, Lock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { PageContainer } from '@/components/layout/PageContainer';
import type { UserRole } from '@/core/auth/rbac';
import type { NavTabId } from '@/components/layout/Sidebar';

export interface AccessDeniedViewProps {
  attemptedTab: NavTabId;
  userRole: UserRole;
  onRedirectToDashboard: () => void;
  isDark?: boolean;
}

export function AccessDeniedView({
  attemptedTab,
  userRole,
  onRedirectToDashboard,
  isDark = false,
}: AccessDeniedViewProps) {
  const { locale } = useI18n();

  return (
    <PageContainer size="default" className="py-12 sm:py-20">
      <Card
        className={cn(
          'p-8 sm:p-12 text-center rounded-3xl border shadow-xl relative overflow-hidden transition-all',
          isDark
            ? 'bg-[#181824] border-rose-900/40 text-white shadow-rose-950/20'
            : 'bg-white border-rose-200 text-secondary-900 shadow-rose-100/40'
        )}
      >
        {/* Top security badge icon */}
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 mb-6 shadow-inner">
          <ShieldAlert className="h-8 w-8 animate-pulse" />
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-300 border border-rose-500/30 mb-4">
          <Lock className="h-3 w-3" />
          {locale === 'nl' ? '403 • Toegang Geweigerd' : '403 • Access Denied'}
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-3">
          {locale === 'nl'
            ? 'Geen Toegangsrechten voor deze Pagina'
            : 'Restricted Screen • Unauthorized'}
        </h1>

        <p className={cn('text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed', isDark ? 'text-slate-400' : 'text-secondary-600')}>
          {locale === 'nl'
            ? `U bent momenteel ingelogd als Klant. Het scherm "${attemptedTab}" bevat vertrouwelijke salonbeheerdersgegevens (zoals financiële analyses, personeelsroosters, cliëntendossiers en saloninstellingen) en is beveiligd volgens Role-Based Access Control (RBAC).`
            : `You are currently authenticated in the Customer role. The screen "${attemptedTab}" contains confidential salon operational records (revenue analytics, staff rosters, client CRM, and business settings) and is restricted per Role-Based Access Control (RBAC).`}
        </p>

        {/* Security Audit Badge */}
        <div
          className={cn(
            'p-3.5 rounded-2xl border text-left text-xs mb-8 max-w-sm mx-auto flex items-center justify-between',
            isDark
              ? 'bg-[#12121c] border-[#29293e] text-slate-300'
              : 'bg-secondary-50 border-secondary-200 text-secondary-700'
          )}
        >
          <div>
            <p className="font-semibold text-[11px] text-secondary-400 uppercase tracking-wider">
              {locale === 'nl' ? 'Actieve Rol' : 'Active Role'}
            </p>
            <p className="font-bold text-xs mt-0.5 capitalize text-primary-600 dark:text-purple-400">
              👤 {userRole}
            </p>
          </div>
          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold">
            RBAC Enforced
          </span>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button
            variant="primary"
            size="md"
            onClick={onRedirectToDashboard}
            className="w-full sm:w-auto font-bold text-xs text-white shadow-md cursor-pointer"
            style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
          >
            <Home className="h-4 w-4 mr-2" />
            {locale === 'nl' ? 'Terug naar Klanten Dashboard' : 'Return to Customer Dashboard'}
          </Button>
        </div>
      </Card>
    </PageContainer>
  );
}
