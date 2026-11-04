import { Bell } from 'lucide-react';
import { useI18n } from '@/i18n/I18nContext';
import { Button } from '@/components/ui/Button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/Dialog';
import type { BookingRecord } from '@/core/data-store';

interface NotificationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookings: BookingRecord[];
  userRole?: 'admin' | 'customer';
  customerClientId?: string;
  customerName?: string;
}

export function NotificationDrawer({
  open,
  onOpenChange,
  bookings,
  userRole = 'admin',
  customerClientId,
  customerName,
}: NotificationDrawerProps) {
  const { locale } = useI18n();

  // Scope notifications by role to prevent data leakage across users
  const scopedBookings = userRole === 'customer'
    ? bookings.filter(
        (b) =>
          b.client_id === customerClientId ||
          (customerName && b.client_name.toLowerCase().includes(customerName.toLowerCase().split(' ')[0]))
      )
    : bookings;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary-600" />
            <span>
              {userRole === 'customer'
                ? (locale === 'nl' ? 'Mijn Meldingen & Afspraakupdates' : 'My Notifications & Updates')
                : (locale === 'nl' ? 'Salon Meldingen & Activiteit' : 'Salon Notifications & Activity')}
            </span>
          </DialogTitle>
        </DialogHeader>
        <div className="px-6 py-4 space-y-3 text-xs">
          {scopedBookings.slice(0, 5).map((b) => (
            <div
              key={b.id}
              className="flex items-start justify-between p-2.5 rounded-lg border border-secondary-200 bg-secondary-50/50 dark:bg-[#1a1a24] dark:border-[#2d2d3e]"
            >
              <div>
                <p className="font-semibold text-secondary-900 dark:text-white">
                  {userRole === 'customer' ? b.service_name : b.client_name}
                </p>
                <p className="text-secondary-500 dark:text-slate-400">
                  {userRole === 'customer' ? `Met ${b.staff_name}` : b.service_name} • {b.date} om {b.start_time}
                </p>
              </div>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 uppercase">
                {b.status}
              </span>
            </div>
          ))}
          {scopedBookings.length === 0 && (
            <p className="text-secondary-500 text-center py-4">
              {userRole === 'customer'
                ? (locale === 'nl' ? 'U heeft geen recente afspraakmeldingen.' : 'You have no recent booking notifications.')
                : (locale === 'nl' ? 'Geen actieve meldingen op dit moment.' : 'No active notifications at this time.')}
            </p>
          )}
        </div>
        <DialogFooter>
          <Button variant="secondary" onClick={() => onOpenChange(false)}>
            {locale === 'nl' ? 'Sluiten' : 'Close'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

