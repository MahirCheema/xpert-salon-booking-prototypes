# Xpert Salon Booking Prototypes - React 19 & Tailwind CSS v4

Interactive, demo-ready salon booking prototypes for 12 Dutch hair, beauty, and animal grooming salons, built for [Xpert Solutions](https://xpertsolutions.nl/) using **React 19**, **Tailwind CSS v4**, dedicated Toast and Confirm Dialog component systems, and full bilingual support (**Dutch & English** toggle).

**This repo is a prototype, not a live production database.** All initial data is static/sample data tagged with `[SAMPLE]`. No real credit cards or external SMS gateways are connected.

---

## 🌟 Key Features

1. **React 19 & Tailwind CSS v4 Architecture**:
   - Modern React 19 hooks and CSS-first Tailwind v4 styling with `@import "tailwindcss";`, `@theme` design tokens, and CSS custom properties (`--primary`, `--accent`, `--surface`, `--background`, `--text`).
   - Path aliases configured (`@/*` -> `./src/*`).

2. **Dedicated Toast & Confirm Dialog Component Systems in Separate Folders**:
   - `src/components/ui/Toast/`: Focuses on non-blocking feedback, fixed at bottom-right, stacking up to 3 toasts with 4000ms auto-dismiss, icons (`CheckCircle2`, `AlertCircle`, `XCircle`, `Info`), and manual close.
   - `src/components/ui/Dialog/`: Accessible modal dialogs with focus trapping, backdrop blur, Escape key dismissal, and promise-based confirmation (`useConfirm()`) with destructive action labels and loading states.

3. **12 Standalone Salon Prototypes in Separate Folders**:
   - Every salon has its own standalone prototype directory under `clients/<slug>/` containing its `index.html`, `main.tsx`, `config.json`, and `README.md`.
   - Each prototype can run completely independently or through the unified hub.

4. **Full Bilingual Support (Dutch & English Toggle)**:
   - Instant header toggle (**NL / EN**) powered by `I18nProvider`.
   - Complete localized translations for all 6 booking steps, service cards, error toasts, confirm dialogs, admin timelines, and client dossiers.

5. **Pure 15-Minute Slot Engine**:
   - Pure mathematical slot calculation adhering to 15-minute grid intervals.
   - Treatment duration buffers: 10 minutes for long/colour/groom treatments, 5 minutes for short treatments.
   - Opening hours boundary enforcement (long treatments crossing closing times are never offered).
   - Single-diary mode for *Trimsalon Limbo* (only one animal at a time salon-wide).
   - Fallback `getNextAvailableDate` if a day is fully booked or closed.

6. **Admin Dashboard & Salon Tooling**:
   - Interactive day timeline with bookings.
   - Full booking table with status filter and sample markers.
   - Client and pet dossiers with coat type, medical flags, and quiet room preferences.
   - Beauty treatment course tracker with session progress and skin analysis notes.
   - Walk-in queue manager with wait times and status transitions (*waiting* -> *in_chair* -> *completed*).

7. **Error Simulation Panel (`Error-Handling.md`)**:
   - Simulated slot race condition ("That slot was just taken. Please choose another time.").
   - Simulated network failure with active retry button.
   - Reset sample data with focus-trapped confirm dialog.

---

## 🏢 The 12 Salon Prototypes

| # | Client | Slug | Industry & City | Specific Features & Problems Solved |
|---|---|---|---|---|
| 1 | **Kapsalon ISSA** | `kapsalon-issa` | Hair • Oisterwijk | Walk-in queue view, per-service duration buffers, no-phone calendar |
| 2 | **Violetta's Dog Grooming** | `violettas-dog-grooming` | Dog Grooming • Zuidhorn | Solo groomer, 24h cancellation notice, pet profile with breed/coat |
| 3 | **Trimsalon Limbo** | `trimsalon-limbo` | Grooming • Venlo | Single-diary mode (one pet at a time), multi-species (dog, cat, rabbit) |
| 4 | **Hondentrimsalon Finn** | `hondentrimsalon-finn` | Grooming • Den Haag | Puppy habituation session (30 min), medical alerts & coat checks |
| 5 | **Kapsalon Faya** | `kapsalon-faya` | Hair • Groningen | Adult vs Child student rates, walk-in and booked appointments |
| 6 | **Trimsalon het Hofje** | `trimsalon-het-hofje` | Grooming • Haarlem | Cat separate quiet room flag, long treatment slots (120m) |
| 7 | **Schoonheidssalon Yourbeauty** | `salonyourbeauty` | Beauty • Breda | Kalahari facial courses, skin analysis notes per visit, progress tracker |
| 8 | **Kapsalon van Haaren** | `kapsalon-van-haaren` | Hair • Nijmegen | Student pricing sample, WhatsApp confirmation fallback route |
| 9 | **Polat Beauty** | `polat-beauty` | Beauty • Eindhoven | Multi-session laser and facial course tracking (6 sessions) |
| 10 | **De Kleinste Kapsalon** | `de-kleinste-kapsalon` | Hair • Rotterdam | Solo barber (Osman), personal chair, direct call confirmation |
| 11 | **Feel Smooth** | `feel-smooth` | Beauty • Utrecht | Wax and laser courses, progress tracking, skin preparation |
| 12 | **Kapsalon Headline** | `kapsalon-headline` | Hair • Amsterdam | Technical cut and color, chemical history notes, consultation |

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the unified prototype portal.

### 3. Build for production
```bash
npm run build
```
This builds both the unified hub (`dist/index.html`) and all 12 standalone prototypes (`dist/clients/<slug>/index.html`) using Rollup multi-page inputs.

### 4. Run automated test suite
```bash
npm test
```
Executes all 17 automated tests verifying slot calculations, double-booking prevention, single-diary enforcement, buffers, data store operations, and config validity.

---

## 📂 Project Structure

```
xpert-salon-booking-prototypes/
├── clients/                          # 12 Standalone Salon Directories
│   ├── kapsalon-issa/
│   │   ├── config.json               # Business data, theme, hours, services
│   │   ├── index.html                # Standalone HTML entry
│   │   ├── main.tsx                  # Standalone React 19 mount
│   │   └── README.md                 # Salon documentation
│   ├── violettas-dog-grooming/
│   └── ... (all 12 salons)
├── src/
│   ├── app/
│   │   ├── App.tsx                   # Main application orchestrator
│   │   └── main.tsx                  # Root mount
│   ├── components/
│   │   ├── ShellHeader.tsx           # Salon switcher, view toggle, hours modal, NL/EN switch
│   │   ├── BookingFlow.tsx           # 6-step customer booking flow
│   │   ├── AdminDashboard.tsx        # Timeline, bookings, dossiers, courses, walk-in
│   │   ├── ErrorSimulator.tsx        # Testing bar for Error-Handling.md scenarios
│   │   └── ui/
│   │       ├── Toast/                # DEDICATED TOAST FOLDER
│   │       │   ├── Toast.tsx
│   │       │   ├── ToastProvider.tsx
│   │       │   ├── useToast.ts
│   │       │   ├── toast.types.ts
│   │       │   └── index.ts
│   │       ├── Dialog/               # DEDICATED CONFIRM DIALOG FOLDER
│   │       │   ├── Dialog.tsx
│   │       │   ├── ConfirmDialog.tsx
│   │       │   ├── ConfirmDialogProvider.tsx
│   │       │   ├── useConfirm.ts
│   │       │   ├── dialog.types.ts
│   │       │   └── index.ts
│   │       ├── Button/               # Accessible button components
│   │       ├── Badge/                # Status badges (including [SAMPLE])
│   │       └── Card/                 # Reusable surface card
│   ├── core/
│   │   ├── slot-engine.ts            # Pure 15-minute slot engine & buffers
│   │   └── data-store.ts             # State store, localStorage sync & SAMPLE data
│   ├── i18n/
│   │   ├── translations.ts           # Complete bilingual dictionary (NL & EN)
│   │   └── I18nContext.tsx           # Locale provider & useI18n hook
│   └── styles/
│       └── index.css                 # Tailwind CSS v4 and theme variables
├── tests/                            # 17 automated unit tests
├── Architecture.md                   # System design & architecture principles
├── Database.md                       # Contract schema & entities
├── Error-Handling.md                 # Complete error states & toast/dialog rules
├── package.json                      # React 19, Tailwind v4, Vite 6
└── vite.config.ts                    # Multi-entry build configuration
```

---

## 🛡️ Prototype Rules & Compliance

- **No live API keys or external services:** All SMS, WhatsApp, and email messages are simulated and tagged with `[SAMPLE]`.
- **Destructive action safety:** Confirm dialogs are required for cancel, reschedule, and data resets.
- **Auto-dismissing toasts:** All user feedback is displayed through bottom-right toasts (4000ms auto-dismiss) without obstructing forms.
- **Bilingual accuracy:** Both Dutch and English versions provide professional, non-technical terminology suitable for salon owners and customers.
