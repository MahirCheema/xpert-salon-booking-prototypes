/**
 * Slot Engine - Pure function slot calculation for salon booking prototypes
 * Adheres strictly to Architecture.md:
 * - 15-minute boundaries
 * - Service duration + buffer (10 min for long treatments >=90m/colour/grooming, 5 min for short <90m)
 * - Service must fit completely before salon closing time
 * - Staff cannot be double-booked
 * - Single diary for one-pet-at-a-time salons (e.g., Trimsalon Limbo)
 * - Closed days and past times are never available
 * - Finds next available date when a day has no slots
 */

export function timeToMinutes(hhmm) {
  if (!hhmm || typeof hhmm !== 'string') return 0;
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(mins) {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

export function formatDateYMD(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function parseDateYMD(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/**
 * Determine buffer time in minutes based on service duration and name
 */
export function getServiceBuffer(service) {
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

/**
 * Extract opening hours for a specific day of week from config.hours
 * Day: 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
 */
export function getOpeningHoursForDay(hoursConfig, dayOfWeek) {
  if (!hoursConfig) {
    return { isOpen: false, isClosed: true, openMin: 0, closeMin: 0, raw: 'Closed' };
  }

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const targetDay = dayNames[dayOfWeek];

  let rawString = null;

  // Direct match
  if (hoursConfig[targetDay]) {
    rawString = hoursConfig[targetDay];
  } else {
    // Check range keys
    for (const [key, val] of Object.entries(hoursConfig)) {
      if (key.includes('-')) {
        const [startDay, endDay] = key.split('-').map(s => s.trim());
        const startIdx = dayNames.indexOf(startDay);
        const endIdx = dayNames.indexOf(endDay);
        
        if (startIdx !== -1 && endIdx !== -1) {
          if (startIdx <= endIdx) {
            if (dayOfWeek >= startIdx && dayOfWeek <= endIdx) {
              rawString = val;
              break;
            }
          } else {
            // wraps around weekend
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
    // Default closed if not found
    return { isOpen: false, isClosed: true, openMin: 0, closeMin: 0, raw: 'Closed' };
  }

  const lower = rawString.toLowerCase();
  if (lower.includes('closed') || lower.includes('gesloten')) {
    return { isOpen: false, isClosed: true, openMin: 0, closeMin: 0, raw: rawString };
  }

  // Handle "By appointment"
  const isByAppointmentOnly = lower.includes('by appointment') || lower.includes('op afspraak');

  // Look for time range e.g. "09:00-18:00" or "09:00 - 18:00"
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
      raw: rawString
    };
  }

  if (isByAppointmentOnly) {
    // Standard appointment hours 10:00 - 16:00
    return {
      isOpen: true,
      isClosed: false,
      isByAppointment: true,
      openMin: 600, // 10:00
      closeMin: 960, // 16:00
      openTime: '10:00',
      closeTime: '16:00',
      raw: rawString
    };
  }

  return { isOpen: false, isClosed: true, openMin: 0, closeMin: 0, raw: rawString };
}

/**
 * Checks if client operates a single diary (no concurrent bookings)
 */
export function isSingleDiarySalon(clientConfig) {
  if (!clientConfig) return false;
  // Trimsalon Limbo: one-pet-at-a-time
  if (clientConfig.features && clientConfig.features.includes('one_pet_at_a_time_slots')) {
    return true;
  }
  // If only 1 staff member is configured
  if (clientConfig.staff_sample && clientConfig.staff_sample.length <= 1) {
    return true;
  }
  return false;
}

/**
 * Returns available start times for a service on a given date
 * Pure function: returns array of slot objects:
 * {
 *   time: '10:00',
 *   startMin: 600,
 *   endMin: 645,
 *   blockedUntilMin: 655,
 *   assignedStaffId: 'staff-1',
 *   availableStaffIds: ['staff-1', 'staff-2']
 * }
 */
export function getAvailableSlots({
  clientConfig,
  service,
  staffId = 'first_available',
  dateStr,
  existingBookings = [],
  referenceNow = new Date()
}) {
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

  // Filter existing confirmed bookings for this date
  const dayBookings = existingBookings.filter(b => {
    return b.date === dateStr && b.status !== 'cancelled';
  });

  const isSingleDiary = isSingleDiarySalon(clientConfig);
  const allStaff = clientConfig.staff_sample || [{ id: 'staff-1', name_sample: 'Specialist' }];

  // Staff members eligible for this query
  const targetStaffList = (staffId && staffId !== 'first_available')
    ? allStaff.filter(s => s.id === staffId)
    : allStaff;

  if (targetStaffList.length === 0) {
    return [];
  }

  const slots = [];
  const startMinute = dayHours.openMin;
  const endMinute = dayHours.closeMin;

  // Determine if dateStr is today to check past times
  const todayYMD = formatDateYMD(referenceNow);
  const isToday = dateStr === todayYMD;
  const currentMinute = referenceNow.getHours() * 60 + referenceNow.getMinutes();

  // 15-minute boundary iteration
  for (let t = startMinute; t < endMinute; t += 15) {
    const slotStartMin = t;
    const serviceEndMin = slotStartMin + durationMin;
    const blockedUntilMin = slotStartMin + totalBlockedDuration;

    // Rule: Service + buffer must fit completely inside opening hours
    if (blockedUntilMin > endMinute) {
      continue;
    }

    // Rule: Past times are never shown as available
    if (isToday && slotStartMin <= currentMinute) {
      continue;
    }

    // Check overlap with existing bookings
    if (isSingleDiary) {
      // Any existing booking overlapping this interval blocks the entire salon
      const hasConflict = dayBookings.some(b => {
        const bStart = timeToMinutes(b.start_time);
        const bBlockedUntil = timeToMinutes(b.end_time); // end_time already includes buffer in Database.md
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
          availableStaffIds: [targetStaffList[0].id]
        });
      }
    } else {
      // Multi-staff diary: check which staff members are free during [slotStartMin, blockedUntilMin)
      const freeStaff = targetStaffList.filter(staffMember => {
        const staffBookings = dayBookings.filter(b => b.staff_id === staffMember.id);
        const hasConflict = staffBookings.some(b => {
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
          availableStaffIds: freeStaff.map(s => s.id)
        });
      }
    }
  }

  return slots;
}

/**
 * Find next available day starting after fromDateStr (up to 21 days search)
 * Rule from Architecture.md: If no slot is available, show next available day, not an empty page.
 */
export function getNextAvailableDate({
  clientConfig,
  service,
  staffId = 'first_available',
  fromDateStr,
  existingBookings = [],
  referenceNow = new Date()
}) {
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
      referenceNow
    });

    if (availableSlots.length > 0) {
      return {
        dateStr: candidateStr,
        availableSlotsCount: availableSlots.length,
        firstSlot: availableSlots[0].time
      };
    }
  }

  return null;
}

