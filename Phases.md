# Phases - From Prototype to Production

## Phase 0 - Setup (Antigravity, 1 session)

- [ ] Create the project from `clients/<slug>/config.json`.
- [ ] Apply that client's theme from config. Do not use another client's theme.
- [ ] Load static data only. Label every sample client/staff/appointment as SAMPLE in the UI where it appears in admin lists.
- [ ] Set the language: Dutch UI copy for buttons, toasts and dialogs. Keep code/docs in English.

## Phase 1 - Core booking prototype (must pass before demo)

Acceptance criteria - all must pass:
- [ ] Service > staff > date/time > details > review > confirm dialog > toast > confirmation view, with Back at every step.
- [ ] Only available slots are shown. Double-booking is impossible in prototype state.
- [ ] Toast on every outcome: booking confirmed, cancelled, moved, reminder sent (simulated), saved, error.
- [ ] Confirm dialog on cancel, delete and reschedule, stating exactly what will happen.
- [ ] Empty states, loading states, inline validation, mobile layout.
- [ ] Admin day view and booking detail view work with static data.
- [ ] No dead buttons. Prototype-only buttons are labelled as such.

## Phase 2 - Client-specific features

Build only the features listed in that client's `config.json` > `features`:
- Grooming: pet profile, pre-visit intake (breed, coat, behaviour, medical flags, fleas/heat/matting), photo upload (picker only), long slots.
- Beauty: treatment course tracking, skin-analysis notes per visit, rebooking reminders.
- Hair: student pricing, next-cut nudge, walk-in queue view (prototype only).
- All: reschedule with old-vs-new confirm dialog, cancellation policy display (e.g. Violetta's 24 hours), history view.

## Phase 3 - Production readiness (do NOT skip)

- [ ] Replace static data with a real database following Database.md. Migrate, do not rewrite the data shape.
- [ ] Add authentication for admin, with roles (owner, staff, read-only).
- [ ] Connect real reminders (email/SMS/WhatsApp) only with the client's explicit consent and a test number first.
- [ ] Add real cancellation/no-show handling, audit log, and backups.
- [ ] Privacy: GDPR - data minimisation, retention, export/delete on request. See Security.md.
- [ ] Accessibility and performance audit on mobile.
- [ ] Replace every fallback theme with a verified live-site theme (see Architecture.md, Theme note).
- [ ] User acceptance test with the salon owner on their real services, prices and hours, in Dutch.

## Phase 4 - Launch checklist

- [ ] Real services, prices, hours and staff confirmed by the owner, in writing.
- [ ] Test booking, reschedule, cancel, reminder and no-show flows end-to-end.
- [ ] Confirm dialog and toast copy reviewed in Dutch by a native speaker.
- [ ] Backup and restore tested once.
- [ ] Go-live date, support contact, and rollback plan agreed with the owner.
