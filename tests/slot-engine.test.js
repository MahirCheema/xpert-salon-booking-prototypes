import test from 'node:test';
import assert from 'node:assert/strict';
import {
  timeToMinutes,
  minutesToTime,
  getServiceBuffer,
  getOpeningHoursForDay,
  isSingleDiarySalon,
  getAvailableSlots,
  getNextAvailableDate
} from '../src/slot-engine.js';

test('timeToMinutes and minutesToTime conversions', () => {
  assert.equal(timeToMinutes('09:00'), 540);
  assert.equal(timeToMinutes('18:00'), 1080);
  assert.equal(minutesToTime(540), '09:00');
  assert.equal(minutesToTime(1080), '18:00');
});

test('Service buffer is 10 min for long/colour/groom treatments and 5 min for short', () => {
  assert.equal(getServiceBuffer({ duration_min: 45, name: 'Cut' }), 5);
  assert.equal(getServiceBuffer({ duration_min: 30, name: 'Beard' }), 5);
  assert.equal(getServiceBuffer({ duration_min: 90, name: 'Hair colour' }), 10);
  assert.equal(getServiceBuffer({ duration_min: 150, name: 'Complete coat care' }), 10);
  assert.equal(getServiceBuffer({ duration_min: 120, name: 'Full groom' }), 10);
});

test('Opening hours parsing handles ranges, closed days, and custom formats', () => {
  const hours = {
    'Mon-Fri': '09:00-18:00',
    'Sat': '09:00-17:00',
    'Sun': 'Closed'
  };

  const monday = getOpeningHoursForDay(hours, 1);
  assert.equal(monday.isOpen, true);
  assert.equal(monday.openMin, 540);
  assert.equal(monday.closeMin, 1080);

  const saturday = getOpeningHoursForDay(hours, 6);
  assert.equal(saturday.isOpen, true);
  assert.equal(saturday.openMin, 540);
  assert.equal(saturday.closeMin, 1020);

  const sunday = getOpeningHoursForDay(hours, 0);
  assert.equal(sunday.isClosed, true);
  assert.equal(sunday.isOpen, false);
});

test('Available slots align to 15-minute boundaries and fit before closing time', () => {
  const clientConfig = {
    slug: 'kapsalon-issa',
    hours: {
      'Mon-Fri': '09:00-18:00',
      'Sat': '09:00-17:00',
      'Sun': 'Closed'
    },
    staff_sample: [
      { id: 'staff-1', role: 'Owner' },
      { id: 'staff-2', role: 'Stylist' }
    ]
  };

  const service = { name: 'Cut', duration_min: 45 }; // 45m + 5m buffer = 50m total
  // Tuesday 2026-11-03
  const slots = getAvailableSlots({
    clientConfig,
    service,
    staffId: 'staff-1',
    dateStr: '2026-11-03',
    existingBookings: [],
    referenceNow: new Date('2026-11-01T08:00:00Z')
  });

  assert.ok(slots.length > 0);
  assert.equal(slots[0].time, '09:00');
  assert.equal(slots[1].time, '09:15');
  assert.equal(slots[2].time, '09:30');

  // Verify that the last slot fits before closing (18:00 = 1080)
  // Last slot starting at T must have T + 45 + 5 <= 1080 -> T <= 1030. Since slots are at 15m intervals, latest is 1020 (17:00)
  const lastSlot = slots[slots.length - 1];
  assert.ok(lastSlot.blockedUntilMin <= 1080, 'Slot must not exceed salon closing time');
  assert.equal(lastSlot.time, '17:00');
});

test('Long treatments do not offer slots that cross closing time', () => {
  const clientConfig = {
    slug: 'trimsalon-het-hofje',
    hours: {
      'Mon-Fri': '09:00-17:00',
      'Sat': 'By appointment',
      'Sun': 'Closed'
    },
    staff_sample: [{ id: 'staff-1', role: 'Groomer' }]
  };

  // Full groom dog: 180 min + 10 min buffer = 190 min
  const service = { name: 'Full groom - dog', duration_min: 180 };
  const slots = getAvailableSlots({
    clientConfig,
    service,
    staffId: 'staff-1',
    dateStr: '2026-11-03', // Tuesday
    existingBookings: [],
    referenceNow: new Date('2026-11-01T08:00:00Z')
  });

  // Salon closes at 17:00 (1020m). 1020 - 190 = 830m -> latest 15m slot is 825m (13:45)
  assert.ok(slots.length > 0);
  const lastSlot = slots[slots.length - 1];
  assert.ok(lastSlot.blockedUntilMin <= 1020);
  assert.equal(lastSlot.time, '13:45');
});

test('Existing bookings prevent double-booking for the assigned staff', () => {
  const clientConfig = {
    slug: 'kapsalon-issa',
    hours: { 'Mon-Fri': '09:00-18:00' },
    staff_sample: [
      { id: 'staff-1', role: 'Owner' }
    ]
  };

  const service = { name: 'Cut', duration_min: 45 }; // 45m + 5m buffer
  const existingBookings = [
    {
      id: 'apt-sample-1',
      staff_id: 'staff-1',
      date: '2026-11-03',
      start_time: '10:00',
      end_time: '10:50', // 10:00 to 10:50 occupied
      status: 'confirmed'
    }
  ];

  const slots = getAvailableSlots({
    clientConfig,
    service,
    staffId: 'staff-1',
    dateStr: '2026-11-03',
    existingBookings,
    referenceNow: new Date('2026-11-01T08:00:00Z')
  });

  const slotTimes = slots.map(s => s.time);

  // 10:00 is booked, so 10:00 must NOT be available
  assert.ok(!slotTimes.includes('10:00'), '10:00 should not be available');
  // 09:30 slot (09:30 + 50 = 10:20) would overlap with 10:00-10:50, so must NOT be available
  assert.ok(!slotTimes.includes('09:30'), '09:30 should overlap and not be available');
  // 10:45 slot (10:45 + 50 = 11:35) overlaps with 10:00-10:50, so must NOT be available
  assert.ok(!slotTimes.includes('10:45'), '10:45 overlaps and should not be available');
  // 11:00 slot starts after 10:50, so SHOULD be available
  assert.ok(slotTimes.includes('11:00'), '11:00 should be available');
});

test('Trimsalon Limbo enforces single diary (one pet at a time across whole salon)', () => {
  const clientConfig = {
    slug: 'trimsalon-limbo',
    features: ['one_pet_at_a_time_slots'],
    hours: { 'Mon-Fri': '09:00-17:00' },
    staff_sample: [
      { id: 'staff-1', role: 'Owner' },
      { id: 'staff-2', role: 'Groomer' }
    ]
  };

  assert.equal(isSingleDiarySalon(clientConfig), true);

  const existingBookings = [
    {
      id: 'apt-1',
      staff_id: 'staff-1',
      date: '2026-11-03',
      start_time: '10:00',
      end_time: '11:30', // 10:00 to 11:30
      status: 'confirmed'
    }
  ];

  // Even if checking for staff-2 or first_available, no slot can be booked between 10:00 and 11:30
  const slots = getAvailableSlots({
    clientConfig,
    service: { name: 'Wash and dry', duration_min: 60 },
    staffId: 'staff-2',
    dateStr: '2026-11-03',
    existingBookings,
    referenceNow: new Date('2026-11-01T08:00:00Z')
  });

  const slotTimes = slots.map(s => s.time);
  assert.ok(!slotTimes.includes('10:00'));
  assert.ok(!slotTimes.includes('10:15'));
  assert.ok(!slotTimes.includes('10:30'));
  assert.ok(!slotTimes.includes('11:00'));
});

test('Closed days return empty slots list', () => {
  const clientConfig = {
    slug: 'kapsalon-faya',
    hours: {
      'Mon-Sat': '09:00-18:00',
      'Sun': 'Closed'
    },
    staff_sample: [{ id: 'staff-1', role: 'Owner' }]
  };

  // 2026-11-01 is Sunday
  const slots = getAvailableSlots({
    clientConfig,
    service: { name: 'Cut', duration_min: 45 },
    staffId: 'staff-1',
    dateStr: '2026-11-01',
    existingBookings: [],
    referenceNow: new Date('2026-10-30T08:00:00Z')
  });

  assert.equal(slots.length, 0);
});

test('getNextAvailableDate finds next open day when current day has no slots', () => {
  const clientConfig = {
    slug: 'kapsalon-faya',
    hours: {
      'Mon-Sat': '09:00-18:00',
      'Sun': 'Closed'
    },
    staff_sample: [{ id: 'staff-1', role: 'Owner' }]
  };

  // Searching from Sunday 2026-11-01 should return Monday 2026-11-02
  const nextDay = getNextAvailableDate({
    clientConfig,
    service: { name: 'Cut', duration_min: 45 },
    staffId: 'staff-1',
    fromDateStr: '2026-11-01',
    existingBookings: [],
    referenceNow: new Date('2026-10-30T08:00:00Z')
  });

  assert.ok(nextDay);
  assert.equal(nextDay.dateStr, '2026-11-02');
  assert.ok(nextDay.availableSlotsCount > 0);
});
