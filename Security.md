# Security - Prototype and Production

## Prototype rules (non-negotiable)

- No real personal data. No real names, phones, emails, addresses or pet details of real clients. Sample data only, obviously fake.
- No secrets in the repo. No API keys, passwords, tokens, or provider credentials in code, config, prompts or screenshots. If a key is needed in production, it goes in environment variables / a secrets manager, never in Git.
- No real messaging or payment integration in the prototype. Buttons that look like they send a message or take a payment must be labelled "Prototype - not connected" and must not call a real provider.
- No scraping or automated access to a client's live site, booking system or social accounts as part of the prototype. Use only public information already in the lead reports and the client's public homepage.
- Do not publish a prototype URL publicly with sample data that could be mistaken for a real salon's booking system. Demo links are private, per client, and labelled "Prototype".

## Production rules (before any live use)

- Authentication: admin login, strong passwords, and ideally 2FA for the owner. Staff accounts are separate from the owner account. No shared admin password.
- Authorisation: staff can only see and change their own diary unless the owner grants more. Clients can only see their own bookings.
- Input validation: validate and sanitise every field server-side, not only in the browser. Service, date, time and staff IDs must be checked against the real catalogue, hours and availability - never trust a value sent from the browser.
- Data protection (GDPR, Netherlands/EU): collect only what booking needs (name, contact, service, pet/skin notes where relevant). State a retention period, allow export and deletion on request, and do not use booking data for marketing without explicit consent.
- Messaging consent: only send reminders to a contact who gave a number/email for that purpose, with an opt-out in every message.
- Logging and audit: log who created, moved or cancelled a booking, and when. Do not log passwords, tokens or full payment details.
- Backups: daily backup, restore tested once before launch, and a rollback plan.
- Dependencies: keep dependencies updated, remove unused packages, and do not add a new provider without reviewing what data it receives.

## What to do if a secret or real data leaks into the repo

1. Remove it from the repo and from Git history if possible, rotate the secret immediately, and tell the owner.
2. Do not just delete the file in a new commit and assume the secret is gone - Git history keeps it.
3. Record the incident in the project notes (what, when, what was rotated) without copying the secret into the note.
