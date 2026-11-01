# Error Handling - What the User Must See

Every failure below must show a clear, Dutch, non-technical message to the user, plus a toast. Never show a raw error, stack trace, status code or "undefined" to a salon owner or customer. Log the technical detail for developers only, not in the UI.

## Booking errors

| Situation | User sees | Toast | State after |
|---|---|---|---|
| Slot just taken (prototype: simulated race) | "That slot was just taken. Please choose another time." + next available slots | Error toast | No booking created, form data kept, slot list refreshed |
| Service does not fit in opening hours | "This service does not fit before closing. Please choose an earlier time." | Error toast | No booking created |
| Past date/time selected | "Please choose a future date and time." (past times must not be shown as available in the first place) | Error toast | No booking created |
| Missing/invalid field | Inline error under that field, in Dutch, e.g. "Vul een geldig telefoonnummer in." | No toast on field error alone; error toast on failed submit | Form data kept |
| Double-booking attempt | "This staff member is already booked at that time." | Error toast | No booking created |
| Network / simulated failure | "Something went wrong. Nothing was booked. Please try again." + Retry button | Error toast | No booking created, form data kept |

## Cancel / reschedule / delete errors

| Situation | User sees | Toast |
|---|---|---|
| Cancel fails | "Cancelling did not work. Your booking is still active. Please try again." | Error toast |
| Reschedule to an unavailable slot | "That new slot is no longer available. Please choose another." | Error toast |
| Delete fails | "Deleting did not work. Nothing was deleted." | Error toast |
| Confirm dialog dismissed (Escape / backdrop / Cancel button) | No change, dialog closes, user returns to the previous view | No toast (dismissal is not an error) |

## Confirm dialog rules (see also Architecture.md)

- Every destructive action shows a dialog first. The dialog must name the booking/client/pet and the exact action.
- Confirm button text = the action, e.g. "Annuleren bevestigen", "Verwijderen", "Verplaatsen".
- Cancel button text = "Annuleren" / "Terug", and it must always work, even if the confirm action is loading.
- While the confirm action is running, disable both buttons and show a loading state. Do not allow double-click to create two bookings or two cancellations.

## Toast rules

- Success: green, check icon, e.g. "Boeking bevestigd", "Boeking geannuleerd", "Boeking verplaatst", "Herinnering verzonden (prototype)".
- Error: red, e.g. "Er is iets misgegaan. Er is niets geboekt."
- Info: blue, e.g. "Herinnering verzonden (prototype)", "Wijzigingen opgeslagen".
- Position: bottom-right, max 3 stacked, auto-dismiss 4000 ms, manual close button. Toasts must not block buttons or the booking form.
- A toast must never be the only record of an action in admin view - the booking list must also update.

## Empty and edge states

- No available slots: show "Geen beschikbare tijden op deze dag." + next available day button, not a blank calendar.
- No bookings: "Nog geen boekingen." + "Nieuwe boeking" button.
- No clients/pets: "Nog geen klanten." / "Nog geen huisdieren." + add button.
- Salon closed: day is disabled in the date picker, with "Gesloten" label, not selectable.
- Long treatment crossing closing time: slot is not offered at all, with the explanation above if the user tries to force it.

## Developer logging (not shown to users)

Log: timestamp, action, booking/client ID (sample IDs in prototype), and error type. Do not log: passwords, tokens, full phone numbers or emails in production logs, or payment details. In the prototype, log to the browser console only.
