# Architecture - Salon Booking Prototypes

## Goal

A robust, demo-ready booking prototype for one salon at a time, that a salon owner can click through and understand in 2 minutes: choose a service, pick a real available slot, confirm, get a clear confirmation, reschedule or cancel without fear of losing data, and see reminders and history. It is not a basic form with a submit button. It is a small, complete booking system with static data.

## System overview

```
Client config (clients/<slug>/config.json)
        |
        v
  +-------------------+      +-------------------+
  |  Booking UI       |----->|  Slot engine      |
  |  (per-client theme)|      |  (static data)    |
  +-------------------+      +-------------------+
        |                            |
        v                            v
  +-------------------+      +-------------------+
  |  Toast system     |      |  Confirm dialogs |
  |  (all outcomes)   |      |  (all destructive|
  |                   |      |   actions)       |
  +-------------------+      +-------------------+
        |
        v
  +-------------------+
  |  Admin view       |
  |  (day / week,     |
  |   bookings,       |
  |   clients, pets)  |
  +-------------------+
```

No backend in Phase 1. State lives in memory / local static data in the prototype. The data model in Database.md is the contract for Phase 2, so the prototype must not invent a different shape later.

## Layers

1. **Config layer** - One JSON file per client. Theme, services, durations, prices (sample unless marked public), hours, staff roles, features, cancellation policy, and booking flow. No client-specific logic may be hard-coded in the UI; the UI reads the config.
2. **Slot engine** - Pure function: given service duration, staff, date and existing bookings, return only available start times. Rules:
   - Slots align to 15-minute boundaries.
   - A slot is available only if the whole service fits inside opening hours, with a 10-minute buffer after long treatments (grooming, colour) and 5 minutes after short services.
   - Staff cannot be double-booked. One-pet-at-a-time clients (Trimsalon Limbo) have a single diary, not per-staff diaries.
   - Closed days and past times are never shown as available.
   - If no slot is available, show the next available day, not an empty page.
3. **Booking flow** - Service > staff (or first available) > date/time > details > review > confirm dialog > toast > confirmation view. Every step must be reversible (Back) without losing entered data, except after Confirm.
4. **Toast system** - Global, bottom-right, stacked max 3, auto-dismiss 4000 ms, close button, success (green/check), error (red), info (blue). Toasts must announce: booking confirmed, booking cancelled, booking moved, reminder sent (simulated), saved, and every error. No toast = the action did not visibly happen.
5. **Confirm dialogs** - Modal, focus-trapped, Escape cancels, backdrop click cancels. Required for: cancel booking, delete client/pet/service, reschedule (show old vs new slot), and bulk changes. The dialog must state exactly what will happen, in plain Dutch. The destructive button must be labelled with the action, not just "OK".
6. **Admin view** - Day view (timeline by staff), week view, booking detail, client/pet history, and treatment-course view where the config enables it (Yourbeauty: course progress, skin-analysis notes per visit; Het Hofje/Limbo/Finn: pet profile, breed/coat/medical flags).
7. **Reminders (prototype)** - Simulated. A "Send reminder" button shows an info toast "Reminder sent (prototype)" and marks the reminder as sent in prototype state. No real SMS/email/WhatsApp is sent in Phase 1.

## Per-client variations (from config, not from code forks)

- **Grooming (Violetta's, Limbo, Finn, Het Hofje):** pet profile (name, breed, coat, behaviour, medical flags), photo upload in intake (prototype: file picker, no upload), long-treatment slots, 24-hour cancellation where stated (Violetta's).
- **Beauty courses (Yourbeauty):** treatment course (e.g. 6 facials), session counter, skin-analysis note per visit, rebooking reminder after each session.
- **Hair (ISSA, Faya, Van Haaren):** per-service times, student pricing (Faya, Van Haaren), next-cut rebooking nudge, walk-in queue view (ISSA, prototype only).
- **Multi-staff vs solo:** solo clients show one diary; multi-staff clients show staff choice and per-staff availability.

## Theme note - read this before presenting to a client

Themes in `config.json` are **fallback palettes** based on homepage text and vibe, because page-text extraction does not expose a site's CSS. No hex in this repo was sampled from a client's stylesheet. Before presenting a prototype to a client as "matched to your site", do a visual/CSS check of the live site and replace `theme.primary`, `theme.accent`, `theme.background`, `theme.surface` and `theme.text` in that client's config, and set `theme.status` to "verified against live site". Until then, say "prototype theme, to be confirmed against your site".

## What "robust, not basic" means here

- Empty states for every list (no bookings, no clients, no slots).
- Loading states for every simulated async action (even if instant in prototype, show a brief loading state so production behaviour is visible).
- Validation on every field, with inline errors, not only on submit.
- No dead buttons. Every button either works in the prototype or is clearly marked "Prototype - not connected".
- Keyboard accessible: Tab through the booking flow, Escape closes dialogs, Enter confirms only inside a dialog's Confirm button.
- Mobile-first: booking flow must work on a phone screen, one column, large tap targets, no horizontal scroll.

## Out of scope for the prototype

Real payments, real SMS/email/WhatsApp sending, real client data import, multi-location sync, and online payment refunds. Those are Phase 3 production items, listed in Phases.md, not prototype features.
