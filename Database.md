# Database - Data Model (Prototype Contract)

The prototype uses static JSON that follows this model exactly, so Phase 3 can migrate without reshaping data. Field names below are the contract. Do not invent different field names in the prototype.

## Tables / collections

### clients
- `id` (string, e.g. `client-sample-1`)
- `name`, `phone`, `email` (optional, prototype: sample only)
- `notes` (string, optional)
- `created_at`

### pets (grooming clients only)
- `id`, `client_id`, `name`, `species` (dog/cat/rabbit), `breed`, `coat`, `behaviour_notes`, `medical_flags` (array), `photo_url` (prototype: null or placeholder)

### staff
- `id`, `name` (prototype: sample role name), `role`, `working_hours` (per weekday, or null = salon hours)

### services
- `id`, `name`, `duration_min`, `price_eur` (nullable - sample unless marked public in config), `buffer_min`, `requires_pet` (bool), `requires_course` (bool)

### bookings
- `id`, `client_id`, `pet_id` (nullable), `service_id`, `staff_id` (or `first_available`), `date` (YYYY-MM-DD), `start_time` (HH:MM), `end_time` (computed: start + duration + buffer), `status` (confirmed | cancelled | completed | no_show), `source` (online | phone | walk_in | whatsapp), `notes`, `reminder_sent` (bool, prototype: simulated)

### treatment_courses (Yourbeauty and similar)
- `id`, `client_id`, `service_id`, `total_sessions`, `completed_sessions`, `skin_analysis_notes` (array of {date, note}), `next_due_date`

### reminders (prototype: simulated)
- `id`, `booking_id`, `channel` (email | sms | whatsapp), `sent_at` (nullable), `status` (pending | sent_prototype | failed)

## Rules

- A booking's `end_time` must never overlap another confirmed booking for the same staff (or the single diary for one-pet-at-a-time clients).
- Cancelled bookings stay in the database with `status=cancelled` and a `cancelled_at` timestamp. Never hard-delete a booking in production; in the prototype, delete actions must still go through a confirm dialog and, in the demo, show a toast explaining the prototype behaviour.
- Prices in the prototype are sample data unless the config marks them as public prices from the lead report. Do not store a sample price as if it were the client's real price.
- No real personal data in the prototype. Sample names, phones and emails must be obviously fake (e.g. `sample@example.com`, `06-00000000`).
- Indexes for production: `bookings(date, staff_id)`, `bookings(client_id)`, `pets(client_id)`, `treatment_courses(client_id)`.

## Static data files

Prototype data lives in `clients/<slug>/config.json` > `sample_appointments` and in the app's static data module. It must follow the field names above. When migrating, copy the shape, replace the values, and do not keep sample clients in the live database.
