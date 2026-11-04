import React from 'react';
import {
  CheckCircle2,
  Calendar,
  User,
  Phone,
  Mail,
  Heart,
  Scissors,
  ShieldCheck,
  GraduationCap,
} from 'lucide-react';
import { cn } from '@/lib/utils/cn';
import { useI18n } from '@/i18n/I18nContext';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/Dialog';
import { getServiceBuffer } from '@/core/slot-engine';
import type { ServiceRecord } from '@/core/data-store';

export interface PendingBookingData {
  clientName: string;
  clientPhone: string;
  clientEmail: string;
  assignedStaffId: string;
  assignedStaffName: string;
  service: ServiceRecord;
  date: string;
  time: string;
  price: number;
  isStudent: boolean;
  notes?: string;
  pet?: {
    name: string;
    species: string;
    breed: string;
    separate_room_flag?: boolean;
    photo_preview?: string | null;
    medical_flags?: string[];
  };
}

export interface BookingConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pendingBooking: PendingBookingData | null;
  onConfirm: () => void;
  submitting: boolean;
  isDark?: boolean;
}

export function BookingConfirmationDialog({
  open,
  onOpenChange,
  pendingBooking,
  onConfirm,
  submitting,
  isDark = false,
}: BookingConfirmationDialogProps) {
  const { locale } = useI18n();

  if (!pendingBooking) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          'max-w-lg w-full p-0 overflow-hidden rounded-2xl shadow-2xl border transition-all z-60',
          isDark
            ? 'bg-[#15151f] border-[#2d2d3e] text-white'
            : 'bg-white border-secondary-200 text-secondary-900'
        )}
      >
        {/* Header */}
        <DialogHeader
          className={cn(
            'px-6 py-4.5 border-b flex flex-row items-center gap-3',
            isDark ? 'bg-[#1b1b26] border-[#292938]' : 'bg-secondary-50/80 border-secondary-200'
          )}
        >
          <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div>
            <DialogTitle className={cn('text-base sm:text-lg font-bold leading-tight', isDark ? 'text-white' : 'text-secondary-900')}>
              {locale === 'nl' ? 'Afspraak Definitief Bevestigen' : 'Confirm Appointment Booking'}
            </DialogTitle>
            <p className={cn('text-xs mt-0.5', isDark ? 'text-slate-400' : 'text-secondary-500')}>
              {locale === 'nl'
                ? 'Controleer het afspraakoverzicht voordat de reservering definitief wordt ingepland.'
                : 'Review the booking summary before finalizing your reservation.'}
            </p>
          </div>
        </DialogHeader>

        {/* Body: Booking Summary Dossier */}
        <div className="p-6 space-y-3.5 max-h-[70vh] overflow-y-auto">
          {/* Highlight Banner: Date & Time */}
          <div className={cn(
            'p-3.5 rounded-xl border flex items-center justify-between gap-4',
            isDark
              ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200'
              : 'bg-emerald-50 border-emerald-200 text-emerald-950'
          )}>
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider opacity-75">
                  {locale === 'nl' ? 'Datum & Tijdslot' : 'Date & Time Slot'}
                </div>
                <div className="text-sm font-extrabold font-mono">
                  {pendingBooking.date} • {pendingBooking.time} uur
                </div>
              </div>
            </div>
            <Badge variant="success" className="font-mono text-xs">
              {pendingBooking.service.duration_min} min (+{getServiceBuffer(pendingBooking.service)}m buffer)
            </Badge>
          </div>

          {/* Client & Contact */}
          <div className={cn(
            'p-3 rounded-xl border space-y-1.5',
            isDark ? 'bg-[#181824] border-[#29293a]' : 'bg-secondary-50/60 border-secondary-200'
          )}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                {locale === 'nl' ? 'Klantgegevens' : 'Customer Details'}
              </span>
              {pendingBooking.isStudent && (
                <Badge variant="secondary" className="text-[10px] bg-blue-500/10 text-blue-600 border-blue-500/30">
                  <GraduationCap className="h-3 w-3 mr-1" />
                  {locale === 'nl' ? 'Studententarief' : 'Student Rate'}
                </Badge>
              )}
            </div>
            <div className="font-bold text-sm text-secondary-900 dark:text-white">
              {pendingBooking.clientName}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-secondary-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <Phone className="h-3 w-3 text-secondary-400" />
                {pendingBooking.clientPhone}
              </span>
              {pendingBooking.clientEmail && (
                <span className="flex items-center gap-1">
                  <Mail className="h-3 w-3 text-secondary-400" />
                  {pendingBooking.clientEmail}
                </span>
              )}
            </div>
          </div>

          {/* Pet / Animal Info (If Grooming) */}
          {pendingBooking.pet && (
            <div className={cn(
              'p-3 rounded-xl border space-y-1.5',
              isDark ? 'bg-[#181824] border-[#29293a]' : 'bg-secondary-50/60 border-secondary-200'
            )}>
              <div className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 flex items-center gap-1.5">
                <Heart className="h-3.5 w-3.5 text-rose-500" />
                {locale === 'nl' ? 'Diergegevens (Trimintake)' : 'Pet Details'}
              </div>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <strong className="text-sm font-bold text-secondary-900 dark:text-white">
                    {pendingBooking.pet.name}
                  </strong>{' '}
                  <span className="text-secondary-500 dark:text-slate-400">
                    ({pendingBooking.pet.species} • {pendingBooking.pet.breed})
                  </span>
                </div>
                {pendingBooking.pet.separate_room_flag && (
                  <Badge variant="secondary" className="text-[10px] bg-purple-500/15 text-purple-700 dark:text-purple-300">
                    {locale === 'nl' ? 'Aparte Rustruimte' : 'Separate Room'}
                  </Badge>
                )}
              </div>
              {pendingBooking.pet.medical_flags && pendingBooking.pet.medical_flags.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {pendingBooking.pet.medical_flags.map((flag, idx) => (
                    <span key={idx} className="text-[10px] px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 font-medium">
                      {flag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Service & Specialist & Total Price */}
          <div className={cn(
            'p-3 rounded-xl border space-y-2',
            isDark ? 'bg-[#181824] border-[#29293a]' : 'bg-secondary-50/60 border-secondary-200'
          )}>
            <div className="flex items-center justify-between text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-secondary-500 flex items-center gap-1.5">
                <Scissors className="h-3.5 w-3.5" />
                {locale === 'nl' ? 'Behandeling & Specialist' : 'Treatment & Specialist'}
              </span>
              <span className="text-xs font-semibold text-secondary-700 dark:text-slate-300">
                {pendingBooking.assignedStaffName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="font-bold text-sm text-secondary-900 dark:text-white">
                  {pendingBooking.service.name}
                </div>
                <div className="text-xs text-secondary-500 dark:text-slate-400">
                  {pendingBooking.service.duration_min} {locale === 'nl' ? 'minuten behandeltijd' : 'minutes duration'}
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono font-extrabold text-base text-emerald-600 dark:text-emerald-400">
                  €{pendingBooking.price.toFixed(2)}
                </div>
                <div className="text-[10px] text-secondary-400">
                  {locale === 'nl' ? 'incl. BTW' : 'incl. VAT'}
                </div>
              </div>
            </div>
          </div>

          {/* Notes (if any) */}
          {pendingBooking.notes && (
            <div className={cn(
              'p-2.5 rounded-xl border text-xs',
              isDark ? 'bg-[#181824] border-[#29293a]' : 'bg-secondary-50/60 border-secondary-200'
            )}>
              <div className="font-semibold text-secondary-500 text-[10px] uppercase mb-0.5">
                {locale === 'nl' ? 'Bijzonderheden / Notities:' : 'Notes / Remarks:'}
              </div>
              <p className="italic text-secondary-700 dark:text-slate-300">
                "{pendingBooking.notes}"
              </p>
            </div>
          )}

          {/* Cancellation policy guarantee */}
          <div className="flex items-center gap-2 text-xs text-secondary-600 dark:text-slate-400 pt-0.5">
            <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span>
              {locale === 'nl'
                ? '24-uurs kosteloze annulering gegarandeerd.'
                : '24-hour free cancellation guaranteed.'}
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <DialogFooter
          className={cn(
            'px-6 py-4 border-t flex items-center justify-end gap-3',
            isDark ? 'bg-[#1b1b26] border-[#292938]' : 'bg-secondary-50/80 border-secondary-200'
          )}
        >
          <Button
            type="button"
            variant="secondary"
            onClick={() => onOpenChange(false)}
            disabled={submitting}
          >
            {locale === 'nl' ? 'Aanpassen' : 'Edit / Go Back'}
          </Button>
          <Button
            type="button"
            variant="primary"
            onClick={onConfirm}
            disabled={submitting}
            className="font-bold text-white shadow-md transition-all hover:opacity-95"
            style={{ backgroundColor: isDark ? '#7c3aed' : 'var(--primary, #2563eb)' }}
          >
            <CheckCircle2 className="h-4 w-4 mr-1.5" />
            {submitting
              ? (locale === 'nl' ? 'Vastleggen...' : 'Saving...')
              : (locale === 'nl' ? 'Definitief Bevestigen' : 'Confirm & Book')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

