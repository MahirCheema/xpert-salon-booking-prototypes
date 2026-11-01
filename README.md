# Xpert Salon Booking Prototypes

Prototype-only booking systems for Dutch hair, beauty and animal-grooming salons, built for Xpert Solutions (https://xpertsolutions.nl/).

**This repo is a prototype, not a live system.** All data is static/sample data. No real client records, payments, or live bookings are included. Replace sample data with the client's real data, and complete the production checklist in Phases.md, before any live use.

## Clients in this repo (12)

| Client | Slug | Problem in one line |
|---|---|---|
| Kapsalon ISSA, Oisterwijk | `kapsalon-issa` | No clear booking calendar; phone/walk-in interruptions |
| Violetta's Dog Grooming, Zuidhorn | `violettas-dog-grooming` | Solo, message-first, no calendar/CRM/reminders |
| Trimsalon Limbo, Venlo | `trimsalon-limbo` | WhatsApp photo first, email 2 days, no calendar/intake |
| Hondentrimsalon Finn, Den Haag | `hondentrimsalon-finn` | Groomer is also receptionist; bookings wait on messages |
| Kapsalon Faya, Groningen | `kapsalon-faya` | Walk-in or call only; no booking widget |
| Trimsalon het Hofje, Haarlem | `trimsalon-het-hofje` | Phone-only; pre-visit medical/coat info by phone |
| Schoonheidssalon Yourbeauty, Breda | `salonyourbeauty` | No booking or treatment-course tracking |
| Kapsalon van Haaren, Nijmegen | `kapsalon-van-haaren` | Appointment-only by phone/WhatsApp; no calendar |
| Polat Beauty, Eindhoven | `polat-beauty` | Directory-led; no verified booking/course tracking |
| De Kleinste Kapsalon, Rotterdam | `de-kleinste-kapsalon` | Phone-only, ask for Osman; no calendar/CRM |
| Feel Smooth, Utrecht | `feel-smooth` | Appointment route unverified; no course tracking |
| Kapsalon Headline, Amsterdam | `kapsalon-headline` | Phone-led; no visible calendar/CRM in sources checked |

Each client has its own folder under `clients/<slug>/` with `config.json` (business, problem, theme, hours, services, features, booking flow, toast spec, confirm-dialog spec, sample appointments) and a short `README.md`.

## Antigravity docs - read in this order

1. `Architecture.md` - what to build, and how it fits together
2. `Phases.md` - build order, from static prototype to production-ready
3. `Database.md` - data model, even though the prototype uses static data
4. `Prompts.md` - copy-paste prompts for Antigravity, per client and per feature
5. `Security.md` - what must never be in a prototype, and what production needs
6. `Error-Handling.md` - every failure case, and what the user must see

## How to build one client in Antigravity

1. Open `clients/<slug>/config.json` and copy its theme, services, hours and features into the Antigravity prompt.
2. Use the matching prompt in `Prompts.md` (Prompt A for the core booking flow, then B-G for the extra features).
3. Build with static data only. Do not connect a real database, payment provider or messaging provider in the prototype phase.
4. Check the acceptance criteria in `Phases.md` Phase 1 before moving on: available slots only, no double booking in the prototype state, toast on every outcome, confirm dialog on every destructive action.

## Non-negotiable prototype rules

- **Toast on every outcome.** Success, error and info toasts, bottom-right, auto-dismiss 4 seconds, never blocking the page. A booking, cancellation, reschedule, reminder or save that shows no toast is a failed build.
- **Confirm dialog on every destructive action.** Cancel, delete, and reschedule all require an explicit Confirm click. No action may happen on the first click alone.
- **Available slots only.** Never show a slot that is already booked, outside opening hours, or shorter than the service duration. Overlapping services, double-booked staff and back-to-back bookings with no buffer are bugs, not features.
- **Static data only.** Sample clients, staff and appointments are labelled SAMPLE in the config. Do not present them as real clients.
- **Theme per client.** Use that client's `config.json` theme. Themes in this repo are labelled fallback until a visual/CSS check of the live site replaces them - see Architecture.md, Theme note. Do not present a fallback theme to a client as "your exact site theme".

## Repo

- GitHub: https://github.com/MahirCheema/xpert-salon-booking-prototypes
- Branch: `main`
- Language: English in code and docs; client-facing Dutch copy (buttons, toasts, dialogs) must be in Dutch, with English only where the client site itself uses English.
