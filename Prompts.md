# Prompts - For Antigravity Prototyping

Copy a prompt, replace `<slug>` with the client slug, and paste the matching `config.json` content (or its theme/services/hours/features sections) into Antigravity with it. Build in order: A, then the feature prompts that match that client's config. Do not skip the toast and confirm-dialog requirements - they are in every prompt on purpose.

## Prompt A - Core booking prototype (every client)

> Build a robust, mobile-first salon booking prototype for <client name>, <city>, using the attached config.json.
> Use the config's theme (primary, accent, background, surface, text) and its services, durations, hours and staff roles exactly. Use static/sample data only, labelled SAMPLE where it appears in admin lists.
> Booking flow: service > staff (or first available) > date/time (available slots ONLY, 15-minute boundaries, service must fit in opening hours, staff cannot be double-booked, 10-minute buffer after long treatments) > client details > review > confirm dialog > confirmation view, with Back at every step.
> REQUIRED, not optional: (1) Toast notifications on every outcome - success, error and info, bottom-right, auto-dismiss 4 seconds, close button, max 3 stacked. Booking confirmed, cancelled, moved, reminder sent (simulated) and every error must show a toast. (2) Confirm dialogs on every destructive action - cancel, delete and reschedule - modal, Escape cancels, backdrop click cancels, dialog states exactly what will happen, destructive button labelled with the action, not just OK.
> Also required: empty states for every list, loading states for simulated actions, inline validation, no dead buttons (mark prototype-only buttons as such), Dutch UI copy for buttons, toasts and dialogs, and an admin day view with booking detail.
> Do not connect a real database, payment provider or messaging provider. Do not invent real client data.

## Prompt B - Grooming: pet profile and pre-visit intake

> Add, for this grooming client, a pet profile (name, species, breed, coat, behaviour notes, medical flags) and a structured pre-visit intake form: breed, coat, behaviour, medical issues, fleas, heat, matting, reachable phone number. For cats, add a "separate quiet room" flag where the config enables it. Intake answers must appear on the booking detail and in admin day view. Photo upload is a file picker only in the prototype (no upload). Long treatments must block the full slot, not just the first hour.

## Prompt C - Beauty: treatment courses

> Add treatment-course tracking: total sessions, completed sessions, progress bar, skin-analysis note per visit (date + note), and a rebooking reminder after each session. The next session must be bookable from the course view in one click, pre-filled with the same service and client.

## Prompt D - Hair: pricing and rebooking

> Add student pricing where the config lists it, a "next cut" rebooking nudge on the confirmation view (suggested date, one click to book), and, where the config enables it, a walk-in queue view (prototype only, clearly labelled).

## Prompt E - Reschedule, cancel and reminders

> Add reschedule (old slot vs new slot in the confirm dialog, only move on Confirm), cancel (confirm dialog stating the cancellation policy, e.g. 24 hours where the config states it, cancelled bookings stay visible as cancelled), and reminders (simulated "Send reminder" button, info toast "Reminder sent (prototype)", mark as sent in prototype state). No real SMS/email/WhatsApp in the prototype.

## Prompt F - Admin view

> Add an admin view: day timeline by staff, week view, booking detail, client history, and, where enabled, pet history or treatment-course history. Admin actions (cancel, reschedule, mark completed, mark no-show) must all use confirm dialogs and toasts. No admin action may happen without a visible outcome.

## Prompt G - Theme and polish

> Apply the client's theme from config.json exactly, check contrast for text on background/surface, make the layout mobile-first with large tap targets and no horizontal scroll, and check that the logo/brand area, headline and call-to-action are not cropped on phone, tablet or desktop. If the config theme status is "fallback", add a visible comment in code (not in the UI) noting that the theme must be verified against the live site before presenting to the client.

## Prompt H - New client from the same template

> Create a new client config in the same shape as `clients/<slug>/config.json`: business, city, website, type, priority, problem (one line, from the lead report), contact, theme (labelled fallback until verified), hours, services with durations and sample prices, staff roles, features list, booking flow, toast spec and confirm-dialog spec. Do not copy another client's services or theme. Do not invent real client data.
