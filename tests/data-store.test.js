import test from 'node:test';
import assert from 'node:assert/strict';
import { SalonDataStore } from '../src/data-store.js';

test('DataStore initializes with SAMPLE-tagged data from config', () => {
  const store = new SalonDataStore('kapsalon-issa');
  const state = store.state;

  assert.equal(state.slug, 'kapsalon-issa');
  assert.ok(state.services.length >= 4);
  assert.ok(state.staff.length >= 2);
  assert.ok(state.bookings.length >= 2);

  // All initial sample data must have is_sample === true
  state.bookings.forEach(b => {
    assert.equal(b.is_sample, true);
  });
});

test('Adding a booking computes end_time, associates staff and sets confirmed status', () => {
  const store = new SalonDataStore('kapsalon-issa');
  const srv = store.state.services[0]; // Cut, 45 min

  const newBooking = store.addBooking({
    service_id: srv.id,
    staff_id: store.state.staff[0].id,
    date: '2026-11-04',
    start_time: '14:00',
    client_name: 'Jan de Vries',
    client_phone: '06-12345678',
    client_email: 'jan@example.nl',
    notes: 'Kort aan de zijkanten'
  });

  assert.ok(newBooking.id);
  assert.equal(newBooking.date, '2026-11-04');
  assert.equal(newBooking.start_time, '14:00');
  // 14:00 + 45 min + 5 min buffer = 14:50
  assert.equal(newBooking.end_time, '14:50');
  assert.equal(newBooking.status, 'confirmed');
  assert.equal(newBooking.is_sample, false);
});

test('Cancelling a booking updates status to cancelled and preserves record', () => {
  const store = new SalonDataStore('violettas-dog-grooming');
  const b = store.state.bookings[0];

  const cancelled = store.cancelBooking(b.id, 'Verhinderd');
  assert.equal(cancelled.status, 'cancelled');
  assert.ok(cancelled.cancelled_at);
  // Must still exist in the bookings array
  const found = store.state.bookings.find(x => x.id === b.id);
  assert.ok(found);
  assert.equal(found.status, 'cancelled');
});

test('Rescheduling updates date and start/end times', () => {
  const store = new SalonDataStore('kapsalon-faya');
  const b = store.state.bookings[0];

  const rescheduled = store.rescheduleBooking(b.id, '2026-11-10', '15:15');
  assert.equal(rescheduled.date, '2026-11-10');
  assert.equal(rescheduled.start_time, '15:15');
  assert.ok(rescheduled.rescheduled_at);
});

test('Treatment course operations for beauty salons work properly', () => {
  const store = new SalonDataStore('salonyourbeauty');
  const course = store.state.treatmentCourses[0];
  assert.ok(course);
  assert.equal(course.completed_sessions, 2);

  store.advanceCourseSession(course.id);
  assert.equal(course.completed_sessions, 3);

  store.addSkinAnalysisNote(course.id, 'Vochtarme plekken hersteld.');
  assert.equal(course.skin_analysis_notes.length, 3);
});

