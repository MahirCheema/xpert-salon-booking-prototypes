import type { SalonConfig, ServiceRecord, BookingRecord } from '@/types';

/**
 * Pure function slot calculation engine conforming to Architecture.md:
 * - 15-minute boundary alignment
 * - Service duration + buffer (10 min after long treatments >=90m/colour/grooming, 5 min for short)
 * - Service + buffer must fit completely before salon closing time
 * - Staff cannot be double-booked
 * - Single diary mode for one-pet-at-a-time salons (Trimsalon Limbo)
 * - Closed days and past times are excluded
 * - Fallback search for next available day
 */

export function timeToMinutes(hhmm: string): number {
  if (!hhmm || typeof hhmm !== 'string') return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDateYMD(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateYMD(str: string): Date {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export function getServiceBuffer(service: Partial<ServiceRecord> | null | undefined): number {
  if (!service) return 5;
  if (typeof service.buffer_min === 'number') return service.buffer_min;

  const duration = service.duration_min || 45;
  const name = (service.name || '').toLowerCase();

  const isLongOrIntensive =
    duration >= 90 ||
    name.includes('colour') ||
    name.includes('kleur') ||
    name.includes('groom') ||
    name.includes('trim') ||
    name.includes('vacht') ||
    name.includes('habituation');

  return isLongOrIntensive ? 10 : 5;
}

export interface DayOpeningHours {
  isOpen: boolean;
  isClosed: boolean;
  isByAppointment?: boolean;
  openMin: number;
  closeMin: number;
  openTime?: string;
  closeTime?: string;
  raw: string;
}

export function getOpeningHoursForDay(
  hoursConfig: Record<string, any> | null | undefined,
  dayOfWeek: number
): DayOpeningHours {
  if (!hoursConfig) {
    return { isOpen: false, isClosed: true, openMin: 0, closeMin: 0, raw: 'Closed' };
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const targetDay = dayNames[dayOfWeek];

  let rawString: string | null = null;

  if (hoursConfig[targetDay]) {
    rawString = hoursConfig[targetDay];
  } else {
    for (const [key, val] of Object.entries(hoursConfig)) {
      if (key.includes('-')) {
        const [startDay, endDay] = key.split('-').map((s) => s.trim());
        const startIdx = dayNames.indexOf(startDay);
        const endIdx = dayNames.indexOf(endDay);

        if (startIdx !== -1 && endIdx !== -1) {
          if (startIdx <= endIdx) {
            if (dayOfWeek >= startIdx && dayOfWeek <= endIdx) {
              rawString = val;
              break;
            }
          } else {
            if (dayOfWeek >= startIdx || dayOfWeek <= endIdx) {
              rawString = val;
              break;
            }
          }
        }
      }
    }
  }

  if (!rawString) {
    return { isOpen: false, isClosed: true, openMin: 0, closeMin: 0, raw: 'Closed' };
  }

  const lower = rawString.toLowerCase();
  if (lower.includes('closed') || lower.includes('gesloten')) {
    return { isOpen: false, isClosed: true, openMin: 0, closeMin: 0, raw: rawString };
  }

  const isByAppointmentOnly = lower.includes('by appointment') || lower.includes('op afspraak');
  const match = rawString.match(/(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})/);

  if (match) {
    const openMin = timeToMinutes(match[1]);
    const closeMin = timeToMinutes(match[2]);
    return {
      isOpen: true,
      isClosed: false,
      isByAppointment: isByAppointmentOnly,
      openMin,
      closeMin,
      openTime: match[1],
      closeTime: match[2],
      raw: rawString,
    };
  }

  if (isByAppointmentOnly) {
    return {
      isOpen: true,
      isClosed: false,
      isByAppointment: true,
      openMin: 600, // 10:00
      closeMin: 960, // 16:00
      openTime: '10:00',
      closeTime: '16:00',
      raw: rawString,
    };
  }

  return { isOpen: false, isClosed: true, openMin: 0, closeMin: 0, raw: rawString };
}

export function isSingleDiarySalon(clientConfig: Partial<SalonConfig> | null | undefined): boolean {
  if (!clientConfig) return false;
  if (clientConfig.features && clientConfig.features.includes('one_pet_at_a_time_slots')) {
    return true;
  }
  const staffSample = (clientConfig as { staff_sample?: unknown[] }).staff_sample;
  if (staffSample && staffSample.length <= 1) {
    return true;
  }
  return false;
}

export interface SlotResult {
  time: string;
  endTime: string;
  blockedUntil: string;
  startMin: number;
  endMin: number;
  blockedUntilMin: number;
  assignedStaffId: string;
  availableStaffIds: string[];
}

export interface GetAvailableSlotsParams {
  clientConfig: Partial<SalonConfig> | null | undefined;
  service: Partial<ServiceRecord> | null | undefined;
  staffId?: string;
  dateStr: string;
  existingBookings?: BookingRecord[];
  referenceNow?: Date;
}

export function getAvailableSlots({
  clientConfig,
  service,
  staffId = 'first_available',
  dateStr,
  existingBookings = [],
  referenceNow = new Date(),
}: GetAvailableSlotsParams): SlotResult[] {
  if (!clientConfig || !service || !dateStr) {
    return [];
  }

  const dateObj = parseDateYMD(dateStr);
  const dayOfWeek = dateObj.getDay();
  const dayHours = getOpeningHoursForDay(clientConfig.hours, dayOfWeek);

  if (dayHours.isClosed || !dayHours.isOpen) {
    return [];
  }

  const durationMin = Number(service.duration_min) || 45;
  const bufferMin = getServiceBuffer(service);
  const totalBlockedDuration = durationMin + bufferMin;

  const dayBookings = existingBookings.filter((b) => {
    return b.date === dateStr && b.status !== 'cancelled';
  });

  const isSingleDiary = isSingleDiarySalon(clientConfig);
  const allStaff: Array<{ id: string; name_sample?: string; name?: string }> =
    (clientConfig as { staff_sample?: Array<{ id: string; name_sample?: string }> }).staff_sample ||
    (clientConfig.staff as Array<{ id: string; name?: string }>) ||
    [{ id: 'staff-1', name_sample: 'Specialist' }];

  const targetStaffList =
    staffId && staffId !== 'first_available'
      ? allStaff.filter((s) => s.id === staffId)
      : allStaff;

  if (targetStaffList.length === 0) {
    return [];
  }

  const slots: SlotResult[] = [];
  const startMinute = dayHours.openMin;
  const endMinute = dayHours.closeMin;

  const todayYMD = formatDateYMD(referenceNow);
  const isToday = dateStr === todayYMD;
  const currentMinute = referenceNow.getHours() * 60 + referenceNow.getMinutes();

  for (let t = startMinute; t < endMinute; t += 15) {
    const slotStartMin = t;
    const serviceEndMin = slotStartMin + durationMin;
    const blockedUntilMin = slotStartMin + totalBlockedDuration;

    if (blockedUntilMin > endMinute) {
      continue;
    }

    if (isToday && slotStartMin <= currentMinute) {
      continue;
    }

    if (isSingleDiary) {
      const hasConflict = dayBookings.some((b) => {
        const bStart = timeToMinutes(b.start_time);
        const bBlockedUntil = timeToMinutes(b.end_time);
        return Math.max(slotStartMin, bStart) < Math.min(blockedUntilMin, bBlockedUntil);
      });

      if (!hasConflict) {
        slots.push({
          time: minutesToTime(slotStartMin),
          endTime: minutesToTime(serviceEndMin),
          blockedUntil: minutesToTime(blockedUntilMin),
          startMin: slotStartMin,
          endMin: serviceEndMin,
          blockedUntilMin,
          assignedStaffId: targetStaffList[0].id,
          availableStaffIds: [targetStaffList[0].id],
        });
      }
    } else {
      const freeStaff = targetStaffList.filter((staffMember) => {
        const staffBookings = dayBookings.filter((b) => b.staff_id === staffMember.id);
        const hasConflict = staffBookings.some((b) => {
          const bStart = timeToMinutes(b.start_time);
          const bBlockedUntil = timeToMinutes(b.end_time);
          return Math.max(slotStartMin, bStart) < Math.min(blockedUntilMin, bBlockedUntil);
        });
        return !hasConflict;
      });

      if (freeStaff.length > 0) {
        slots.push({
          time: minutesToTime(slotStartMin),
          endTime: minutesToTime(serviceEndMin),
          blockedUntil: minutesToTime(blockedUntilMin),
          startMin: slotStartMin,
          endMin: serviceEndMin,
          blockedUntilMin,
          assignedStaffId: freeStaff[0].id,
          availableStaffIds: freeStaff.map((s) => s.id),
        });
      }
    }
  }

  return slots;
}

export interface GetNextAvailableDateParams {
  clientConfig: Partial<SalonConfig> | null | undefined;
  service: Partial<ServiceRecord> | null | undefined;
  staffId?: string;
  fromDateStr: string;
  existingBookings?: BookingRecord[];
  referenceNow?: Date;
}

export function getNextAvailableDate({
  clientConfig,
  service,
  staffId = 'first_available',
  fromDateStr,
  existingBookings = [],
  referenceNow = new Date(),
}: GetNextAvailableDateParams): { dateStr: string; availableSlotsCount: number; firstSlot: string } | null {
  const startDate = parseDateYMD(fromDateStr);

  for (let i = 1; i <= 21; i++) {
    const candidateDate = new Date(startDate);
    candidateDate.setDate(startDate.getDate() + i);
    const candidateStr = formatDateYMD(candidateDate);

    const availableSlots = getAvailableSlots({
      clientConfig,
      service,
      staffId,
      dateStr: candidateStr,
      existingBookings,
      referenceNow,
    });

    if (availableSlots.length > 0) {
      return {
        dateStr: candidateStr,
        availableSlotsCount: availableSlots.length,
        firstSlot: availableSlots[0].time,
      };
    }
  }

  return null;
}

