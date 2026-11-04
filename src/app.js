/**
 * Xpert Salon Booking Prototypes - Main Application Logic
 * Adheres strictly to Architecture.md, Phases.md, Prompts.md, and Error-Handling.md
 *
 * Theme note:
 * Fallback palettes based on homepage text and vibe.
 * Before presenting to a client as 'matched to your site',
 * perform a visual/CSS check of the live site and replace theme hex colors.
 */

import { CLIENT_CONFIGS, CLIENT_SLUGS, getClientConfig } from './client-configs.js';
import { SalonDataStore } from './data-store.js';
import {
  getAvailableSlots,
  getNextAvailableDate,
  formatDateYMD,
  parseDateYMD,
  getOpeningHoursForDay,
  isSingleDiarySalon
} from './slot-engine.js';

class SalonApp {
  constructor() {
    this.currentSlug = this.getSlugFromUrl() || 'kapsalon-issa';
    this.store = new SalonDataStore(this.currentSlug);
    this.mode = 'booking'; // 'booking' | 'admin'
    this.adminTab = 'day'; // 'day' | 'week' | 'bookings' | 'clients' | 'courses' | 'walkin'
    this.toasts = [];

    // Booking flow state
    this.bookingState = this.getDefaultBookingState();

    this.init();
  }

  getSlugFromUrl() {
    const params = new URLSearchParams(window.location.search);
    const slug = params.get('client');
    if (slug && CLIENT_CONFIGS[slug]) return slug;
    return null;
  }

  getDefaultBookingState() {
    const today = new Date();
    // Default to tomorrow or next weekday
    const defaultDate = new Date(today);
    defaultDate.setDate(today.getDate() + 1);
    if (defaultDate.getDay() === 0) defaultDate.setDate(defaultDate.getDate() + 1); // skip Sunday

    return {
      step: 1, // 1: Service, 2: Staff, 3: DateTime, 4: Intake, 5: Review, 6: Confirmed
      service: null,
      staffId: 'first_available',
      selectedDate: formatDateYMD(defaultDate),
      selectedSlot: null,
      clientName: '',
      clientPhone: '',
      clientEmail: '',
      clientNotes: '',
      isStudent: false,
      pet: {
        name: '',
        species: 'Hond',
        breed: '',
        coat: '',
        behaviour_notes: '',
        medical_flags: [],
        separate_room_flag: false,
        photo_preview: null
      },
      beauty: {
        skin_type: 'Normaal',
        allergy_notes: '',
        start_course: false
      },
      confirmedBooking: null,
      fieldErrors: {}
    };
  }

  init() {
    this.applyClientTheme();
    this.store.subscribe(() => {
      this.render();
    });
    window.addEventListener('popstate', () => {
      const slug = this.getSlugFromUrl();
      if (slug && slug !== this.currentSlug) {
        this.switchClient(slug, false);
      }
    });

    // Handle global Escape key for modal
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        const modal = document.getElementById('global-modal-container');
        if (modal && modal.innerHTML.trim() !== '') {
          modal.innerHTML = '';
        }
      }
    });

    this.render();
  }

  switchClient(slug, updateUrl = true) {
    if (!CLIENT_CONFIGS[slug]) return;
    this.currentSlug = slug;
    this.store.setClient(slug);
    this.bookingState = this.getDefaultBookingState();
    this.applyClientTheme();

    if (updateUrl) {
      const url = new URL(window.location);
      url.searchParams.set('client', slug);
      window.history.pushState({}, '', url);
    }

    this.showToast('info', 'Salon geladen', `Prototype voor ${this.store.config.client} geactiveerd.`);
    this.render();
  }

  applyClientTheme() {
    const theme = this.store.config.theme;
    if (!theme) return;

    /* Theme status: fallback - to confirm against live site CSS/visual check before presenting to client */
    const root = document.documentElement;
    root.style.setProperty('--primary', theme.primary || '#1F1F23');
    root.style.setProperty('--accent', theme.accent || '#C9A227');
    root.style.setProperty('--background', theme.background || '#FFFFFF');
    root.style.setProperty('--surface', theme.surface || '#F5F1EB');
    root.style.setProperty('--text', theme.text || '#1F1F23');

    document.title = `${this.store.config.client} - Boekingsprototype | Xpert Solutions`;
  }

  // --- Toast System ---
  // Architecture.md: Global, bottom-right, max 3 stacked, auto-dismiss 4000ms, close button, non-blocking
  showToast(type, title, message) {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    const toast = { id, type, title, message };

    this.toasts.push(toast);
    if (this.toasts.length > 3) {
      this.toasts.shift(); // keep max 3
    }
    this.renderToasts();

    setTimeout(() => {
      this.dismissToast(id);
    }, 4000);
  }

  dismissToast(id) {
    this.toasts = this.toasts.filter(t => t.id !== id);
    this.renderToasts();
  }

  renderToasts() {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    container.innerHTML = this.toasts.map(t => {
      const icon = t.type === 'success' ? '✓' : (t.type === 'error' ? '⚠' : 'ℹ');
      return `
        <div class="toast toast-${t.type}" id="${t.id}" role="alert">
          <div class="toast-icon">${icon}</div>
          <div class="toast-content">
            <div class="toast-title">${this.escapeHtml(t.title)}</div>
            <div class="toast-msg">${this.escapeHtml(t.message)}</div>
          </div>
          <button class="toast-close-btn" aria-label="Sluiten" onclick="window.__salonApp.dismissToast('${t.id}')">×</button>
        </div>
      `;
    }).join('');
  }

  // --- Confirm Dialog System ---
  // Architecture.md & Error-Handling.md: Modal, focus-trapped, Escape cancels, backdrop click cancels
  // Destructive button labelled with the exact action, not just "OK".
  showConfirmDialog({
    title,
    message,
    confirmText = 'Bevestigen',
    cancelText = 'Annuleren',
    isDestructive = false,
    onConfirm
  }) {
    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="modal-backdrop" id="modal-backdrop">
        <div class="modal-dialog" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div class="modal-header">
            <h3 class="modal-title" id="modal-title">${this.escapeHtml(title)}</h3>
            <button class="modal-close-btn" id="modal-close-x" aria-label="Sluiten">&times;</button>
          </div>
          <div class="modal-body">
            <p>${this.escapeHtml(message)}</p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" id="modal-cancel-btn">${this.escapeHtml(cancelText)}</button>
            <button class="btn ${isDestructive ? 'btn-danger' : 'btn-primary'} btn-sm" id="modal-confirm-btn">
              ${this.escapeHtml(confirmText)}
            </button>
          </div>
        </div>
      </div>
    `;

    const close = () => {
      container.innerHTML = '';
    };

    const confirmBtn = document.getElementById('modal-confirm-btn');
    const cancelBtn = document.getElementById('modal-cancel-btn');
    const closeX = document.getElementById('modal-close-x');
    const backdrop = document.getElementById('modal-backdrop');

    cancelBtn.onclick = close;
    closeX.onclick = close;
    backdrop.onclick = (e) => {
      if (e.target === backdrop) close();
    };

    confirmBtn.onclick = () => {
      confirmBtn.disabled = true;
      cancelBtn.disabled = true;
      confirmBtn.innerHTML = 'Bezig met verwerken...';
      setTimeout(() => {
        close();
        if (typeof onConfirm === 'function') {
          onConfirm();
        }
      }, 400); // simulated brief loading state per Architecture.md
    };

    confirmBtn.focus();
  }

  // --- Render Root ---

  render() {
    const root = document.getElementById('app-root');
    if (!root) return;

    const cfg = this.store.config;

    root.innerHTML = `
      <!-- Topbar Portal -->
      <header class="portal-topbar">
        <div class="portal-topbar-left">
          <span class="portal-badge">Xpert Solutions</span>
          <span class="portal-selector-label">Salon Prototype:</span>
          <select class="client-select-dropdown" id="client-select" onchange="window.__salonApp.switchClient(this.value)">
            ${CLIENT_SLUGS.map(slug => {
              const c = CLIENT_CONFIGS[slug];
              const isSelected = slug === this.currentSlug ? 'selected' : '';
              return `<option value="${slug}" ${isSelected}>${c.client} (${c.type.split('-')[0].trim()} - ${c.city})</option>`;
            }).join('')}
          </select>
        </div>
        <div class="portal-topbar-right">
          <div class="view-mode-toggle">
            <button class="view-mode-btn ${this.mode === 'booking' ? 'active' : ''}" onclick="window.__salonApp.setMode('booking')">
              Klantweergave (Boeken)
            </button>
            <button class="view-mode-btn ${this.mode === 'admin' ? 'active' : ''}" onclick="window.__salonApp.setMode('admin')">
              Beheerdersoverzicht (Admin)
            </button>
          </div>
        </div>
      </header>

      <!-- Brand Header -->
      <section class="brand-header">
        <div class="brand-header-inner">
          <div class="brand-info">
            <div class="brand-type-badge">
              <span>●</span> ${this.escapeHtml(cfg.type)} &bull; ${this.escapeHtml(cfg.city)}
            </div>
            <h1 class="brand-title">${this.escapeHtml(cfg.client)}</h1>
            <div class="brand-meta">
              <span>📞 ${this.escapeHtml(cfg.contact?.phone || 'Geen telefoon')}</span>
              <span>📍 ${this.escapeHtml(cfg.contact?.address || cfg.city)}</span>
              <span>🌐 <a href="${cfg.website}" target="_blank" rel="noopener" style="color: inherit;">Website bezoeken</a></span>
            </div>
          </div>
          <div class="brand-actions">
            <button class="btn btn-secondary btn-sm" onclick="window.__salonApp.showHoursModal()">
              Openingstijden bekijken
            </button>
          </div>
        </div>

        <div class="problem-solved-banner">
          <span>💡</span>
          <div>
            <strong>Opgelost probleem voor deze salon:</strong> ${this.escapeHtml(cfg.problem)}
          </div>
        </div>
      </section>

      <!-- Main Container -->
      <main class="app-container">
        ${this.mode === 'booking' ? this.renderBookingFlow() : this.renderAdminDashboard()}
      </main>

      <!-- Simulation & Test Bar (Error-Handling.md testing) -->
      <div style="max-width: 900px; margin: 0 auto 2rem; padding: 0 1rem;">
        <div class="simulation-bar">
          <div class="simulation-bar-title">🧪 Prototype Test- &amp; Foutscenario's (Error-Handling.md):</div>
          <div class="simulation-actions">
            <button class="btn btn-secondary btn-sm" onclick="window.__salonApp.simulateSlotRaceError()">
              Simuleer: Slot net vergeven
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.__salonApp.simulateNetworkError()">
              Simuleer: Verbindingsfout
            </button>
            <button class="btn btn-secondary btn-sm" onclick="window.__salonApp.resetSampleData()">
              Reset voorbeelddata
            </button>
          </div>
        </div>
      </div>

      <!-- Footer -->
      <footer class="site-footer">
        <p><strong>Xpert Solutions</strong> &bull; Salon Boekingsprototype (Statische data).</p>
        <p>Alle persoonsgegevens en afspraken zijn fictief (SAMPLE) ter demonstratie.</p>
      </footer>

      <!-- Container for modal confirm dialogs -->
      <div id="global-modal-container"></div>
    `;

    this.postRender();
  }

  setMode(mode) {
    this.mode = mode;
    this.render();
  }

  setAdminTab(tab) {
    this.adminTab = tab;
    this.render();
  }

  // --- Step 1 to 6 Booking Flow ---

  renderBookingFlow() {
    const s = this.bookingState;

    return `
      <!-- Step Indicator -->
      <nav class="step-indicator" aria-label="Boekingsstappen">
        <div class="step-item ${s.step === 1 ? 'active' : (s.step > 1 ? 'completed' : '')}">
          <div class="step-circle">1</div>
          <div class="step-label">Dienst</div>
        </div>
        <div class="step-item ${s.step === 2 ? 'active' : (s.step > 2 ? 'completed' : '')}">
          <div class="step-circle">2</div>
          <div class="step-label">Medewerker</div>
        </div>
        <div class="step-item ${s.step === 3 ? 'active' : (s.step > 3 ? 'completed' : '')}">
          <div class="step-circle">3</div>
          <div class="step-label">Datum & Tijd</div>
        </div>
        <div class="step-item ${s.step === 4 ? 'active' : (s.step > 4 ? 'completed' : '')}">
          <div class="step-circle">4</div>
          <div class="step-label">Intake & Contact</div>
        </div>
        <div class="step-item ${s.step === 5 ? 'active' : (s.step > 5 ? 'completed' : '')}">
          <div class="step-circle">5</div>
          <div class="step-label">Overzicht</div>
        </div>
        <div class="step-item ${s.step === 6 ? 'active' : ''}">
          <div class="step-circle">6</div>
          <div class="step-label">Bevestiging</div>
        </div>
      </nav>

      <!-- Step Content -->
      ${s.step === 1 ? this.renderStep1Services() : ''}
      ${s.step === 2 ? this.renderStep2Staff() : ''}
      ${s.step === 3 ? this.renderStep3DateTime() : ''}
      ${s.step === 4 ? this.renderStep4Intake() : ''}
      ${s.step === 5 ? this.renderStep5Review() : ''}
      ${s.step === 6 ? this.renderStep6Confirmed() : ''}
    `;
  }

  // Step 1: Services
  renderStep1Services() {
    const services = this.store.state.services;
    const selected = this.bookingState.service;

    return `
      <section class="content-card">
        <div class="card-header">
          <h2 class="card-title">1. Kies uw gewenste behandeling</h2>
          <p class="card-subtitle">Selecteer een behandeling uit ons actuele aanbod.</p>
        </div>

        <div class="services-grid">
          ${services.map(srv => {
            const isSel = selected && selected.id === srv.id ? 'selected' : '';
            return `
              <div class="service-card ${isSel}" onclick="window.__salonApp.selectService('${srv.id}')">
                <div class="service-card-top">
                  <div class="service-name">${this.escapeHtml(srv.name)}</div>
                  <div class="service-price">
                    ${srv.price_eur ? `€${srv.price_eur}` : 'Prijs op aanvraag'}
                  </div>
                </div>
                <div class="service-details">
                  <span class="service-badge">⏱ ${srv.duration_min} min</span>
                  <span class="service-badge">🛡 ${srv.buffer_min} min buffer</span>
                  ${srv.student_price_eur ? `<span class="service-badge" style="color: var(--accent);">Student: €${srv.student_price_eur}</span>` : ''}
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="button-row">
          <div></div>
          <button class="btn btn-primary" ${!selected ? 'disabled' : ''} onclick="window.__salonApp.goToStep(2)">
            Volgende: Medewerker kiezen &rarr;
          </button>
        </div>
      </section>
    `;
  }

  selectService(serviceId) {
    const srv = this.store.state.services.find(s => s.id === serviceId);
    this.bookingState.service = srv;
    // Clear previously selected slot as duration might change
    this.bookingState.selectedSlot = null;
    this.render();
  }

  // Step 2: Staff
  renderStep2Staff() {
    const staff = this.store.state.staff;
    const selectedId = this.bookingState.staffId;
    const isSingleDiary = isSingleDiarySalon(this.store.config);

    return `
      <section class="content-card">
        <div class="card-header">
          <h2 class="card-title">2. Kies een specialist</h2>
          <p class="card-subtitle">
            ${isSingleDiary 
              ? 'Deze salon hanteert één behandeling tegelijk voor maximale rust en persoonlijke aandacht.' 
              : 'Kies een specifieke medewerker of de eerst beschikbare.'}
          </p>
        </div>

        <div class="staff-grid">
          <div class="staff-card ${selectedId === 'first_available' ? 'selected' : ''}" 
               onclick="window.__salonApp.selectStaff('first_available')">
            <div class="staff-avatar">⚡</div>
            <div class="staff-info">
              <div class="staff-name">Eerst beschikbare medewerker</div>
              <div class="staff-role">Snelste beschikbare plek</div>
            </div>
          </div>

          ${staff.map(st => {
            const isSel = selectedId === st.id ? 'selected' : '';
            const initial = st.name.charAt(0);
            return `
              <div class="staff-card ${isSel}" onclick="window.__salonApp.selectStaff('${st.id}')">
                <div class="staff-avatar">${initial}</div>
                <div class="staff-info">
                  <div class="staff-name">${this.escapeHtml(st.name)}</div>
                  <div class="staff-role">${this.escapeHtml(st.role)}</div>
                </div>
              </div>
            `;
          }).join('')}
        </div>

        <div class="button-row">
          <button class="btn btn-secondary" onclick="window.__salonApp.goToStep(1)">
            &larr; Vorige stap
          </button>
          <button class="btn btn-primary" onclick="window.__salonApp.goToStep(3)">
            Volgende: Datum &amp; Tijd kiezen &rarr;
          </button>
        </div>
      </section>
    `;
  }

  selectStaff(staffId) {
    this.bookingState.staffId = staffId;
    this.bookingState.selectedSlot = null;
    this.render();
  }

  // Step 3: Date & Time Picker (Pure Slot Engine)
  renderStep3DateTime() {
    const cfg = this.store.config;
    const service = this.bookingState.service;
    const staffId = this.bookingState.staffId;
    const selectedDate = this.bookingState.selectedDate;
    const existingBookings = this.store.state.bookings;

    // Generate next 14 calendar days
    const today = new Date();
    const days = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const ymd = formatDateYMD(d);
      const dayOfWeek = d.getDay();
      const hours = getOpeningHoursForDay(cfg.hours, dayOfWeek);
      const dayName = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'][dayOfWeek];
      days.push({
        ymd,
        dayNum: d.getDate(),
        dayName,
        isClosed: hours.isClosed || !hours.isOpen,
        isByAppointment: hours.isByAppointment,
        hours
      });
    }

    // Call slot engine
    const availableSlots = getAvailableSlots({
      clientConfig: cfg,
      service,
      staffId,
      dateStr: selectedDate,
      existingBookings,
      referenceNow: new Date()
    });

    // Check if next available date exists if current day has no slots
    let nextAvailable = null;
    if (availableSlots.length === 0) {
      nextAvailable = getNextAvailableDate({
        clientConfig: cfg,
        service,
        staffId,
        fromDateStr: selectedDate,
        existingBookings,
        referenceNow: new Date()
      });
    }

    return `
      <section class="content-card">
        <div class="card-header">
          <h2 class="card-title">3. Kies datum en tijdstip</h2>
          <p class="card-subtitle">
            Geselecteerde dienst: <strong>${this.escapeHtml(service.name)}</strong> (${service.duration_min} min + ${service.buffer_min} min buffer).
          </p>
        </div>

        <div class="date-picker-section">
          <!-- Horizontal Day Selector -->
          <div>
            <div class="form-label" style="margin-bottom: 0.5rem;">Selecteer een dag:</div>
            <div class="date-scroll-row">
              ${days.map(d => {
                const isSel = d.ymd === selectedDate ? 'selected' : '';
                const isDis = d.isClosed ? 'disabled' : '';
                const statusText = d.isClosed ? 'Gesloten' : (d.isByAppointment ? 'Op afspraak' : 'Open');
                return `
                  <div class="date-chip ${isSel} ${isDis}" 
                       ${!d.isClosed ? `onclick="window.__salonApp.selectDate('${d.ymd}')"` : ''}>
                    <span class="date-chip-day">${d.dayName}</span>
                    <span class="date-chip-num">${d.dayNum}</span>
                    <span class="date-chip-status">${statusText}</span>
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Slots Grid -->
          <div class="slots-grid-wrapper">
            <div class="form-label" style="margin-bottom: 0.75rem;">
              Beschikbare tijdstippen op ${this.formatDutchDate(selectedDate)} (15-minuten intervallen):
            </div>

            ${availableSlots.length > 0 ? `
              <div class="slots-grid">
                ${availableSlots.map(slot => {
                  const isSel = this.bookingState.selectedSlot && this.bookingState.selectedSlot.time === slot.time ? 'selected' : '';
                  return `
                    <button class="time-slot-btn ${isSel}" 
                            onclick="window.__salonApp.selectSlot('${slot.time}', '${slot.assignedStaffId}')">
                      ${slot.time}
                    </button>
                  `;
                }).join('')}
              </div>
            ` : `
              <div class="empty-slots-box">
                <p class="empty-slots-msg">Geen beschikbare tijden op deze dag.</p>
                ${nextAvailable ? `
                  <button class="btn btn-primary btn-sm" onclick="window.__salonApp.selectDate('${nextAvailable.dateStr}')">
                    Volgende beschikbare dag bekijken (${this.formatDutchDate(nextAvailable.dateStr)}) &rarr;
                  </button>
                ` : `
                  <p class="card-subtitle">Neem telefonisch contact met ons op voor extra mogelijkheden.</p>
                `}
              </div>
            `}
          </div>
        </div>

        <div class="button-row">
          <button class="btn btn-secondary" onclick="window.__salonApp.goToStep(2)">
            &larr; Vorige stap
          </button>
          <button class="btn btn-primary" ${!this.bookingState.selectedSlot ? 'disabled' : ''} onclick="window.__salonApp.goToStep(4)">
            Volgende: Gegevens &amp; Intake &rarr;
          </button>
        </div>
      </section>
    `;
  }

  selectDate(dateStr) {
    this.bookingState.selectedDate = dateStr;
    this.bookingState.selectedSlot = null;
    this.render();
  }

  selectSlot(timeStr, staffId) {
    this.bookingState.selectedSlot = { time: timeStr, staffId };
    this.render();
  }

  // Step 4: Contact & Intake Form (Dutch copy, live validation, grooming pet profile, beauty course intake)
  renderStep4Intake() {
    const cfg = this.store.config;
    const s = this.bookingState;
    const errors = s.fieldErrors || {};

    const isGrooming = cfg.type && (cfg.type.toLowerCase().includes('animal') || cfg.type.toLowerCase().includes('grooming'));
    const isBeauty = cfg.type && cfg.type.toLowerCase().includes('beauty');
    const isHair = cfg.type && cfg.type.toLowerCase().includes('hair');
    const hasStudentPricing = s.service && s.service.student_price_eur;
    const hasCatsRoom = cfg.features && cfg.features.includes('cats_separate_room_flag');

    return `
      <section class="content-card">
        <div class="card-header">
          <h2 class="card-title">4. Uw gegevens &amp; Pre-visit intake</h2>
          <p class="card-subtitle">Vul uw contactgegevens in zodat wij uw afspraak kunnen bevestigen.</p>
        </div>

        <form id="intake-form" onsubmit="event.preventDefault(); window.__salonApp.validateAndSubmitStep4();">
          <!-- Client Details -->
          <div class="form-grid two-cols">
            <div class="form-group">
              <label class="form-label" for="client-name">Uw volledige naam <span class="required">*</span></label>
              <input type="text" id="client-name" class="form-input ${errors.clientName ? 'error' : ''}" 
                     value="${this.escapeHtml(s.clientName)}" 
                     oninput="window.__salonApp.updateField('clientName', this.value)"
                     placeholder="Bijv. Lisa van Dijk" required />
              ${errors.clientName ? `<span class="field-error-msg">${errors.clientName}</span>` : ''}
            </div>

            <div class="form-group">
              <label class="form-label" for="client-phone">Telefoonnummer <span class="required">*</span></label>
              <input type="tel" id="client-phone" class="form-input ${errors.clientPhone ? 'error' : ''}" 
                     value="${this.escapeHtml(s.clientPhone)}" 
                     oninput="window.__salonApp.updateField('clientPhone', this.value)"
                     placeholder="Bijv. 06-12345678" required />
              ${errors.clientPhone ? `<span class="field-error-msg">${errors.clientPhone}</span>` : ''}
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="client-email">E-mailadres <span class="required">*</span></label>
            <input type="email" id="client-email" class="form-input ${errors.clientEmail ? 'error' : ''}" 
                   value="${this.escapeHtml(s.clientEmail)}" 
                   oninput="window.__salonApp.updateField('clientEmail', this.value)"
                   placeholder="Bijv. lisa@voorbeeld.nl" required />
            ${errors.clientEmail ? `<span class="field-error-msg">${errors.clientEmail}</span>` : ''}
          </div>

          <!-- Hair Salon Student Pricing Option -->
          ${hasStudentPricing ? `
            <div class="form-group" style="background: var(--surface); padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
              <label class="checkbox-group">
                <input type="checkbox" ${s.isStudent ? 'checked' : ''} 
                       onchange="window.__salonApp.updateField('isStudent', this.checked)" />
                <span><strong>Studenten- / scholierentarief toepassen (€${s.service.student_price_eur})</strong> - studentenkaart meenemen naar de salon</span>
              </label>
            </div>
          ` : ''}

          <!-- Grooming Specific: Pet Profile & Intake -->
          ${isGrooming ? `
            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
              <h3 class="card-title" style="font-size: 1.15rem; margin-bottom: 0.25rem;">
                🐾 Profiel van uw huisdier (Pre-visit Intake)
              </h3>
              <p class="card-subtitle" style="margin-bottom: 1rem;">
                Helpt ons de behandeling optimaal en stressvrij voor te bereiden.
              </p>

              <div class="form-grid two-cols">
                <div class="form-group">
                  <label class="form-label" for="pet-name">Naam van het huisdier <span class="required">*</span></label>
                  <input type="text" id="pet-name" class="form-input ${errors.petName ? 'error' : ''}" 
                         value="${this.escapeHtml(s.pet.name)}" 
                         oninput="window.__salonApp.updatePetField('name', this.value)"
                         placeholder="Bijv. Max of Luna" required />
                  ${errors.petName ? `<span class="field-error-msg">${errors.petName}</span>` : ''}
                </div>

                <div class="form-group">
                  <label class="form-label" for="pet-species">Diersoort <span class="required">*</span></label>
                  <select id="pet-species" class="form-select" 
                          onchange="window.__salonApp.updatePetField('species', this.value)">
                    <option value="Hond" ${s.pet.species === 'Hond' ? 'selected' : ''}>Hond</option>
                    ${cfg.slug.includes('kat') || cfg.type.includes('cats') || cfg.slug === 'trimsalon-het-hofje' || cfg.slug === 'trimsalon-limbo' ? `
                      <option value="Kat" ${s.pet.species === 'Kat' ? 'selected' : ''}>Kat</option>
                    ` : ''}
                    ${cfg.type.includes('rabbits') || cfg.slug === 'trimsalon-limbo' ? `
                      <option value="Konijn" ${s.pet.species === 'Konijn' ? 'selected' : ''}>Konijn</option>
                    ` : ''}
                  </select>
                </div>
              </div>

              <div class="form-grid two-cols">
                <div class="form-group">
                  <label class="form-label" for="pet-breed">Ras / Type <span class="required">*</span></label>
                  <input type="text" id="pet-breed" class="form-input ${errors.petBreed ? 'error' : ''}" 
                         value="${this.escapeHtml(s.pet.breed)}" 
                         oninput="window.__salonApp.updatePetField('breed', this.value)"
                         placeholder="Bijv. Labradoodle, Poedel, Kruising" required />
                  ${errors.petBreed ? `<span class="field-error-msg">${errors.petBreed}</span>` : ''}
                </div>

                <div class="form-group">
                  <label class="form-label" for="pet-coat">Vachtconditie / Vachtsoort</label>
                  <input type="text" id="pet-coat" class="form-input" 
                         value="${this.escapeHtml(s.pet.coat)}" 
                         oninput="window.__salonApp.updatePetField('coat', this.value)"
                         placeholder="Bijv. Verharingsperiode, Klitgevoelig, Wolvacht" />
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Gedrag &amp; Aandachtspunten</label>
                <input type="text" id="pet-behaviour" class="form-input" 
                       value="${this.escapeHtml(s.pet.behaviour_notes)}" 
                       oninput="window.__salonApp.updatePetField('behaviour_notes', this.value)"
                       placeholder="Bijv. Angstig voor föhn, voorzichtig bij achterpoten" />
              </div>

              <div class="form-group">
                <label class="form-label">Medische bijzonderheden (selecteer wat van toepassing is):</label>
                <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 0.5rem; margin-top: 0.25rem;">
                  ${['Huidallergie / Gevoelig', 'Gewrichtsklachten / Ouderdom', 'Vlooien / Tekenbehandeling', 'Loopsheid', 'Ernstige vilt / klitten'].map(flag => {
                    const isChecked = s.pet.medical_flags.includes(flag);
                    return `
                      <label class="checkbox-group">
                        <input type="checkbox" ${isChecked ? 'checked' : ''} 
                               onchange="window.__salonApp.togglePetMedicalFlag('${flag}', this.checked)" />
                        <span>${flag}</span>
                      </label>
                    `;
                  }).join('')}
                </div>
              </div>

              ${hasCatsRoom ? `
                <div class="form-group" style="background: var(--surface); padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                  <label class="checkbox-group">
                    <input type="checkbox" ${s.pet.separate_room_flag ? 'checked' : ''} 
                           onchange="window.__salonApp.updatePetField('separate_room_flag', this.checked)" />
                    <span><strong>Aparte rustige kattenruimte gewenst</strong> (zonder honden in de buurt)</span>
                  </label>
                </div>
              ` : ''}

              <!-- Photo upload: Prototype file picker only -->
              <div class="form-group">
                <label class="form-label">Foto van uw dier / vacht (prototype: lokaal kiezen, geen upload naar server)</label>
                <input type="file" accept="image/*" class="form-input" 
                       onchange="window.__salonApp.handlePetPhotoSelect(this)" />
                ${s.pet.photo_preview ? `
                  <div class="photo-preview-container">
                    <img src="${s.pet.photo_preview}" alt="Voorbeeld foto" class="photo-preview-img" />
                    <span style="font-size: 0.8rem; color: var(--text-muted);">Foto lokaal geselecteerd voor de intake</span>
                  </div>
                ` : ''}
              </div>
            </div>
          ` : ''}

          <!-- Beauty Salon Course Option -->
          ${isBeauty ? `
            <div style="margin-top: 1.5rem; padding-top: 1.5rem; border-top: 1px solid var(--border);">
              <h3 class="card-title" style="font-size: 1.15rem; margin-bottom: 0.25rem;">
                ✨ Huidanalyse &amp; Behandeltraject
              </h3>
              <div class="form-grid two-cols">
                <div class="form-group">
                  <label class="form-label">Huidtype / Huidconditie</label>
                  <select class="form-select" onchange="window.__salonApp.updateBeautyField('skin_type', this.value)">
                    <option value="Normaal" ${s.beauty.skin_type === 'Normaal' ? 'selected' : ''}>Normaal</option>
                    <option value="Droog / Vochtarm" ${s.beauty.skin_type === 'Droog / Vochtarm' ? 'selected' : ''}>Droog / Vochtarm</option>
                    <option value="Gevoelig / Couperose" ${s.beauty.skin_type === 'Gevoelig / Couperose' ? 'selected' : ''}>Gevoelig / Couperose</option>
                    <option value="Gecombineerd / Onzuiver" ${s.beauty.skin_type === 'Gecombineerd / Onzuiver' ? 'selected' : ''}>Gecombineerd / Onzuiver</option>
                    <option value="Rijpere huid" ${s.beauty.skin_type === 'Rijpere huid' ? 'selected' : ''}>Rijpere huid</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Allergieën of gevoeligheden</label>
                  <input type="text" class="form-input" value="${this.escapeHtml(s.beauty.allergy_notes)}" 
                         oninput="window.__salonApp.updateBeautyField('allergy_notes', this.value)" 
                         placeholder="Bijv. allergisch voor etherische oliën" />
                </div>
              </div>

              <div class="form-group" style="background: var(--surface); padding: 0.85rem; border-radius: var(--radius-sm); border: 1px solid var(--border);">
                <label class="checkbox-group">
                  <input type="checkbox" ${s.beauty.start_course ? 'checked' : ''} 
                         onchange="window.__salonApp.updateBeautyField('start_course', this.checked)" />
                  <span><strong>Start direct een kuurtraject van 6 behandelingen</strong> met sessietracking en huidanalyse notities</span>
                </label>
              </div>
            </div>
          ` : ''}

          <!-- General Notes -->
          <div class="form-group" style="margin-top: 1rem;">
            <label class="form-label" for="client-notes">Aanvullende opmerkingen of wensen</label>
            <textarea id="client-notes" class="form-textarea" 
                      oninput="window.__salonApp.updateField('clientNotes', this.value)"
                      placeholder="Eventuele bijzonderheden voor de specialist...">${this.escapeHtml(s.clientNotes)}</textarea>
          </div>

          <div class="button-row">
            <button type="button" class="btn btn-secondary" onclick="window.__salonApp.goToStep(3)">
              &larr; Vorige stap
            </button>
            <button type="submit" class="btn btn-primary">
              Volgende: Overzicht &amp; Bevestigen &rarr;
            </button>
          </div>
        </form>
      </section>
    `;
  }

  updateField(field, val) {
    this.bookingState[field] = val;
    if (this.bookingState.fieldErrors[field]) {
      delete this.bookingState.fieldErrors[field];
    }
  }

  updatePetField(field, val) {
    this.bookingState.pet[field] = val;
    if (this.bookingState.fieldErrors[`pet${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      delete this.bookingState.fieldErrors[`pet${field.charAt(0).toUpperCase() + field.slice(1)}`];
    }
  }

  togglePetMedicalFlag(flag, isChecked) {
    if (isChecked) {
      if (!this.bookingState.pet.medical_flags.includes(flag)) {
        this.bookingState.pet.medical_flags.push(flag);
      }
    } else {
      this.bookingState.pet.medical_flags = this.bookingState.pet.medical_flags.filter(f => f !== flag);
    }
  }

  handlePetPhotoSelect(input) {
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.bookingState.pet.photo_preview = e.target.result;
        this.render();
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  updateBeautyField(field, val) {
    this.bookingState.beauty[field] = val;
  }

  validateAndSubmitStep4() {
    const s = this.bookingState;
    const errors = {};

    if (!s.clientName.trim()) {
      errors.clientName = 'Naam is verplicht.';
    }

    if (!s.clientPhone.trim() || !/^[0-9+\s\-().]{8,15}$/.test(s.clientPhone.trim())) {
      errors.clientPhone = 'Vul een geldig telefoonnummer in (bijv. 06-12345678).';
    }

    if (!s.clientEmail.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.clientEmail.trim())) {
      errors.clientEmail = 'Vul een geldig e-mailadres in.';
    }

    const isGrooming = this.store.config.type && 
      (this.store.config.type.toLowerCase().includes('animal') || this.store.config.type.toLowerCase().includes('grooming'));
    if (isGrooming) {
      if (!s.pet.name.trim()) errors.petName = 'Naam van uw huisdier is verplicht.';
      if (!s.pet.breed.trim()) errors.petBreed = 'Ras van uw huisdier is verplicht.';
    }

    if (Object.keys(errors).length > 0) {
      this.bookingState.fieldErrors = errors;
      this.showToast('error', 'Formulier onvolledig', 'Controleer de gemarkeerde velden alstublieft.');
      this.render();
      return;
    }

    this.bookingState.fieldErrors = {};
    this.goToStep(5);
  }

  // Step 5: Review Summary & Confirm Dialog trigger
  renderStep5Review() {
    const cfg = this.store.config;
    const s = this.bookingState;
    const srv = s.service;
    const staff = s.selectedSlot?.staffId 
      ? (this.store.state.staff.find(st => st.id === s.selectedSlot.staffId)?.name || 'Specialist') 
      : 'Eerst beschikbare specialist';

    const price = s.isStudent && srv.student_price_eur ? srv.student_price_eur : srv.price_eur;
    const cancellationPolicy = cfg.cancellation_policy || 'Kosteloos annuleren tot 24 uur voor aanvang van de afspraak.';

    return `
      <section class="content-card">
        <div class="card-header">
          <h2 class="card-title">5. Controleer uw afspraak</h2>
          <p class="card-subtitle">Controleer alle ingevoerde gegevens voordat u de boeking definitief bevestigt.</p>
        </div>

        <div class="summary-card">
          <div class="summary-row">
            <span class="summary-label">Salon</span>
            <span class="summary-value">${this.escapeHtml(cfg.client)} (${this.escapeHtml(cfg.city)})</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Behandeling</span>
            <span class="summary-value">${this.escapeHtml(srv.name)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Duur</span>
            <span class="summary-value">${srv.duration_min} minuten (+ ${srv.buffer_min} min buffer)</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Specialist</span>
            <span class="summary-value">${this.escapeHtml(staff)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Datum &amp; Tijd</span>
            <span class="summary-value">${this.formatDutchDate(s.selectedDate)} om ${s.selectedSlot.time} uur</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Prijs (SAMPLE)</span>
            <span class="summary-value" style="color: var(--accent); font-size: 1.1rem;">
              ${price ? `€${price}` : 'Op aanvraag'} ${s.isStudent ? '(Studentenkorting)' : ''}
            </span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Klant</span>
            <span class="summary-value">${this.escapeHtml(s.clientName)} &bull; ${this.escapeHtml(s.clientPhone)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">E-mail</span>
            <span class="summary-value">${this.escapeHtml(s.clientEmail)}</span>
          </div>

          ${s.pet && s.pet.name ? `
            <div class="summary-row">
              <span class="summary-label">Huisdier</span>
              <span class="summary-value">${this.escapeHtml(s.pet.name)} (${this.escapeHtml(s.pet.breed)}, ${this.escapeHtml(s.pet.species)})</span>
            </div>
            ${s.pet.medical_flags && s.pet.medical_flags.length > 0 ? `
              <div class="summary-row">
                <span class="summary-label">Medische bijzonderheden</span>
                <span class="summary-value" style="color: var(--danger);">${s.pet.medical_flags.join(', ')}</span>
              </div>
            ` : ''}
          ` : ''}

          ${s.beauty && s.beauty.start_course ? `
            <div class="summary-row">
              <span class="summary-label">Behandeltraject</span>
              <span class="summary-value" style="color: var(--accent);">Start kuurbehandeling (Sessie 1 van 6)</span>
            </div>
          ` : ''}
        </div>

        <div class="cancellation-notice">
          <strong>ℹ Annuleringsbeleid:</strong> ${this.escapeHtml(cancellationPolicy)}
        </div>

        <div class="button-row">
          <button class="btn btn-secondary" onclick="window.__salonApp.goToStep(4)">
            &larr; Vorige stap (Gegevens aanpassen)
          </button>
          <button class="btn btn-primary" onclick="window.__salonApp.promptConfirmBooking()">
            Afspraak bevestigen &rarr;
          </button>
        </div>
      </section>
    `;
  }

  promptConfirmBooking() {
    const s = this.bookingState;
    const srv = s.service;

    this.showConfirmDialog({
      title: 'Boeking definitief bevestigen?',
      message: `Weet u zeker dat u de afspraak voor ${s.clientName} op ${this.formatDutchDate(s.selectedDate)} om ${s.selectedSlot.time} uur wilt bevestigen voor ${srv.name}?`,
      confirmText: 'Boeking bevestigen',
      cancelText: 'Terug naar overzicht',
      isDestructive: false,
      onConfirm: () => {
        this.executeBooking();
      }
    });
  }

  executeBooking() {
    const s = this.bookingState;
    const srv = s.service;
    const price = s.isStudent && srv.student_price_eur ? srv.student_price_eur : srv.price_eur;

    try {
      const booking = this.store.addBooking({
        service_id: srv.id,
        service_name: srv.name,
        duration_min: srv.duration_min,
        price_eur: price,
        is_student: s.isStudent,
        staff_id: s.selectedSlot.staffId,
        date: s.selectedDate,
        start_time: s.selectedSlot.time,
        client_name: s.clientName,
        client_phone: s.clientPhone,
        client_email: s.clientEmail,
        client_notes: s.clientNotes,
        pet: s.pet.name ? s.pet : null,
        intake_notes: s.clientNotes || 'Online geboekt',
        start_treatment_course: s.beauty.start_course
      });

      this.bookingState.confirmedBooking = booking;
      this.bookingState.step = 6;
      this.showToast('success', 'Boeking bevestigd!', 'Uw afspraak is succesvol ingepland. Tot snel!');
      this.render();
    } catch (e) {
      this.showToast('error', 'Fout bij boeken', e.message || 'Er is iets misgegaan. Probeer het opnieuw.');
    }
  }

  // Step 6: Confirmation Screen & Actions (Reschedule, Cancel, Reminder, Rebooking Nudge)
  renderStep6Confirmed() {
    const cfg = this.store.config;
    const b = this.bookingState.confirmedBooking;
    if (!b) return '<p>Geen boeking gevonden.</p>';

    const isHair = cfg.type && cfg.type.toLowerCase().includes('hair');
    const isBeauty = cfg.type && cfg.type.toLowerCase().includes('beauty');
    const isGrooming = cfg.type && (cfg.type.toLowerCase().includes('animal') || cfg.type.toLowerCase().includes('grooming'));

    return `
      <section class="content-card" style="text-align: center; padding: 2.5rem 1.5rem;">
        <div style="width: 64px; height: 64px; background: #DCFCE7; color: #16A34A; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 2rem; margin: 0 auto 1rem;">
          ✓
        </div>
        <h2 class="card-title" style="font-size: 1.75rem; margin-bottom: 0.5rem;">Boeking succesvol bevestigd!</h2>
        <p class="card-subtitle" style="font-size: 1rem; max-width: 500px; margin: 0 auto 1.5rem;">
          Hartelijk dank ${this.escapeHtml(b.client_name)}. We hebben een bevestiging gestuurd naar ${this.escapeHtml(b.client_email)}.
        </p>

        <div class="summary-card" style="text-align: left; max-width: 540px; margin: 0 auto 1.5rem;">
          <div class="summary-row">
            <span class="summary-label">Referentienummer</span>
            <span class="summary-value" style="font-family: monospace;">#${b.id.toUpperCase()}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Status</span>
            <span class="summary-value">
              <span class="badge badge-confirmed">Bevestigd</span>
            </span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Behandeling</span>
            <span class="summary-value">${this.escapeHtml(b.service_name)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Datum &amp; Tijd</span>
            <span class="summary-value">${this.formatDutchDate(b.date)} om ${b.start_time} uur</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Specialist</span>
            <span class="summary-value">${this.escapeHtml(b.staff_name)}</span>
          </div>
          <div class="summary-row">
            <span class="summary-label">Geschat tarief (SAMPLE)</span>
            <span class="summary-value">€${b.price_eur}</span>
          </div>
          ${b.pet_data ? `
            <div class="summary-row">
              <span class="summary-label">Huisdier</span>
              <span class="summary-value">${this.escapeHtml(b.pet_data.name)} (${this.escapeHtml(b.pet_data.breed)})</span>
            </div>
          ` : ''}
          <div class="summary-row">
            <span class="summary-label">Herinnering status</span>
            <span class="summary-value">
              ${b.reminder_sent ? 'Verzonden (prototype)' : 'Nog niet verzonden'}
            </span>
          </div>
        </div>

        <!-- Simulated reminder button per Architecture.md -->
        <div style="display: flex; justify-content: center; gap: 0.75rem; flex-wrap: wrap; margin-bottom: 2rem;">
          <button class="btn btn-secondary btn-sm" onclick="window.__salonApp.sendSimulatedReminder('${b.id}')">
            📩 Herinnering sturen (gesimuleerd)
          </button>
          <button class="btn btn-secondary btn-sm" onclick="window.__salonApp.openRescheduleModal('${b.id}')">
            📅 Afspraak verplaatsen
          </button>
          <button class="btn btn-outline-danger btn-sm" onclick="window.__salonApp.promptCancelBooking('${b.id}')">
            ✕ Afspraak annuleren
          </button>
        </div>

        <!-- Rebooking Nudges per Prompts.md C, D & Architecture.md -->
        <div style="background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem; max-width: 540px; margin: 0 auto 1.5rem; text-align: left;">
          <h4 style="font-weight: 700; color: var(--primary); margin-bottom: 0.25rem;">
            ${isHair ? '✂️ Alvast de volgende knipbeurt vastleggen?' : (isBeauty ? '✨ Volgende kuurbehandeling inplannen?' : '🐾 Volgende trimbeurt reserveren?')}
          </h4>
          <p style="font-size: 0.85rem; color: var(--text-muted); margin-bottom: 0.75rem;">
            ${isHair 
              ? 'Voorkom wachttijden en plan alvast uw onderhoud over 4 tot 6 weken.' 
              : (isBeauty 
                ? 'Voor optimaal resultaat raden we aan sessie 2 over 3 weken in te plannen.' 
                : 'Houd de vacht klitvrij door over 8 tot 10 weken een vervolgafspraak te plannen.')}
          </p>
          <button class="btn btn-accent btn-sm" onclick="window.__salonApp.triggerRebookingNudge()">
            Volgende afspraak nu inplannen &rarr;
          </button>
        </div>

        <div>
          <button class="btn btn-secondary" onclick="window.__salonApp.resetBookingFlow()">
            Nieuwe boeking starten
          </button>
        </div>
      </section>
    `;
  }

  sendSimulatedReminder(bookingId) {
    try {
      this.store.simulateReminder(bookingId);
      this.showToast('info', 'Herinnering verzonden (prototype)', 'Gesimuleerde SMS/E-mail herinnering verstuurd naar de klant.');
      this.render();
    } catch (e) {
      this.showToast('error', 'Fout bij herinnering', e.message);
    }
  }

  triggerRebookingNudge() {
    const prev = this.bookingState.confirmedBooking;
    const clientName = prev ? prev.client_name.replace(' (SAMPLE)', '') : '';
    const clientPhone = prev ? prev.client_phone : '';
    const clientEmail = prev ? prev.client_email : '';
    const pet = prev ? prev.pet_data : null;

    // Advance date by 4 weeks for hair/beauty or 8 weeks for grooming
    const d = new Date();
    d.setDate(d.getDate() + 28);
    if (d.getDay() === 0) d.setDate(d.getDate() + 1);

    this.bookingState = this.getDefaultBookingState();
    this.bookingState.clientName = clientName;
    this.bookingState.clientPhone = clientPhone;
    this.bookingState.clientEmail = clientEmail;
    this.bookingState.selectedDate = formatDateYMD(d);
    if (pet) {
      this.bookingState.pet = { ...pet, photo_preview: null };
    }

    this.showToast('info', 'Herhaalafspraak', 'Klantgegevens automatisch overgenomen voor uw volgende afspraak.');
    this.bookingState.step = 1;
    this.render();
  }

  resetBookingFlow() {
    this.bookingState = this.getDefaultBookingState();
    this.render();
  }

  goToStep(stepNumber) {
    this.bookingState.step = stepNumber;
    this.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // --- Reschedule & Cancel with Confirm Dialogs ---

  promptCancelBooking(bookingId) {
    const booking = this.store.state.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const cfg = this.store.config;
    const cancellationPolicy = cfg.cancellation_policy || 'Kosteloos annuleren tot 24 uur voor aanvang.';

    this.showConfirmDialog({
      title: 'Afspraak annuleren?',
      message: `Weet u zeker dat u de afspraak voor ${booking.client_name} op ${booking.date} om ${booking.start_time} uur wilt annuleren? Beleid: ${cancellationPolicy}`,
      confirmText: 'Annuleren bevestigen',
      cancelText: 'Afspraak behouden',
      isDestructive: true,
      onConfirm: () => {
        try {
          this.store.cancelBooking(bookingId);
          this.showToast('info', 'Boeking geannuleerd', 'De afspraak is geannuleerd en gearchiveerd.');
          if (this.bookingState.confirmedBooking && this.bookingState.confirmedBooking.id === bookingId) {
            this.bookingState.confirmedBooking.status = 'cancelled';
          }
          this.render();
        } catch (e) {
          this.showToast('error', 'Fout bij annuleren', e.message);
        }
      }
    });
  }

  openRescheduleModal(bookingId) {
    const booking = this.store.state.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const srv = this.store.state.services.find(s => s.id === booking.service_id) || { duration_min: 45, buffer_min: 5, name: booking.service_name };
    const cfg = this.store.config;

    // Modal with mini slot picker
    const container = document.getElementById('global-modal-container');
    if (!container) return;

    let reschedDate = booking.date;
    const existingBookings = this.store.state.bookings.filter(b => b.id !== bookingId);

    const renderReschedBody = () => {
      const slots = getAvailableSlots({
        clientConfig: cfg,
        service: srv,
        staffId: booking.staff_id,
        dateStr: reschedDate,
        existingBookings,
        referenceNow: new Date()
      });

      return `
        <div class="modal-backdrop" id="resched-backdrop">
          <div class="modal-dialog" style="max-width: 550px;">
            <div class="modal-header">
              <h3 class="modal-title">Afspraak verplaatsen</h3>
              <button class="modal-close-btn" onclick="document.getElementById('global-modal-container').innerHTML=''">&times;</button>
            </div>
            <div class="modal-body">
              <p style="margin-bottom: 0.75rem;">
                Huidige afspraak: <strong>${this.formatDutchDate(booking.date)} om ${booking.start_time} uur</strong>
              </p>

              <div class="form-group">
                <label class="form-label">Kies nieuwe datum:</label>
                <input type="date" class="form-input" id="resched-date-input" value="${reschedDate}" />
              </div>

              <div class="form-label" style="margin-bottom: 0.5rem;">Kies nieuw tijdslot:</div>
              ${slots.length > 0 ? `
                <div class="slots-grid" style="max-height: 200px; overflow-y: auto;">
                  ${slots.map(sl => `
                    <button class="time-slot-btn" onclick="window.__salonApp.confirmRescheduleSlot('${booking.id}', '${reschedDate}', '${sl.time}')">
                      ${sl.time}
                    </button>
                  `).join('')}
                </div>
              ` : `
                <div class="empty-slots-box" style="padding: 1rem;">
                  <p class="empty-slots-msg" style="font-size: 0.85rem;">Geen vrije plekken op deze datum. Kies een andere dag.</p>
                </div>
              `}
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary btn-sm" onclick="document.getElementById('global-modal-container').innerHTML=''">
                Annuleren
              </button>
            </div>
          </div>
        </div>
      `;
    };

    container.innerHTML = renderReschedBody();

    const dateInput = document.getElementById('resched-date-input');
    if (dateInput) {
      dateInput.onchange = (e) => {
        reschedDate = e.target.value;
        container.innerHTML = renderReschedBody();
      };
    }
  }

  confirmRescheduleSlot(bookingId, newDate, newTime) {
    const booking = this.store.state.bookings.find(b => b.id === bookingId);
    if (!booking) return;

    // Architecture.md: show old vs new slot in confirm dialog
    this.showConfirmDialog({
      title: 'Verplaatsing bevestigen',
      message: `Wilt u de afspraak verplaatsen van ${this.formatDutchDate(booking.date)} om ${booking.start_time} uur naar ${this.formatDutchDate(newDate)} om ${newTime} uur?`,
      confirmText: 'Verplaatsen bevestigen',
      cancelText: 'Annuleren',
      isDestructive: false,
      onConfirm: () => {
        try {
          const updated = this.store.rescheduleBooking(bookingId, newDate, newTime);
          if (this.bookingState.confirmedBooking && this.bookingState.confirmedBooking.id === bookingId) {
            this.bookingState.confirmedBooking = updated;
          }
          this.showToast('info', 'Boeking verplaatst', `Afspraak verplaatst naar ${this.formatDutchDate(newDate)} om ${newTime} uur.`);
          this.render();
        } catch (e) {
          this.showToast('error', 'Fout bij verplaatsen', e.message);
        }
      }
    });
  }

  // --- Admin Dashboard Views ---
  // Architecture.md: Day timeline, week view, bookings table, clients/pets, courses, walk-in queue
  renderAdminDashboard() {
    const cfg = this.store.config;
    const hasCourses = cfg.features && cfg.features.includes('treatment_course_tracking');
    const hasWalkIn = cfg.features && cfg.features.includes('walk_in_queue_view');

    return `
      <section class="admin-header">
        <div>
          <h2 class="card-title" style="margin-bottom: 0.25rem;">Beheerdersagenda &amp; Dashboard</h2>
          <p class="card-subtitle">Volledig beheer van salonafspraken, medewerkers en dossiers.</p>
        </div>
        <div>
          <button class="btn btn-primary btn-sm" onclick="window.__salonApp.setMode('booking')">
            + Nieuwe boeking maken
          </button>
        </div>
      </section>

      <!-- Admin Navigation Subtabs -->
      <nav class="admin-nav" aria-label="Beheerdersnavigatie">
        <button class="admin-nav-item ${this.adminTab === 'day' ? 'active' : ''}" 
                onclick="window.__salonApp.setAdminTab('day')">
          Dagoverzicht (Timeline)
        </button>
        <button class="admin-nav-item ${this.adminTab === 'bookings' ? 'active' : ''}" 
                onclick="window.__salonApp.setAdminTab('bookings')">
          Alle Boekingen (${this.store.state.bookings.length})
        </button>
        <button class="admin-nav-item ${this.adminTab === 'clients' ? 'active' : ''}" 
                onclick="window.__salonApp.setAdminTab('clients')">
          Klanten &amp; Dossiers
        </button>
        ${hasCourses ? `
          <button class="admin-nav-item ${this.adminTab === 'courses' ? 'active' : ''}" 
                  onclick="window.__salonApp.setAdminTab('courses')">
            Kuurbehandelingen (${this.store.state.treatmentCourses.length})
          </button>
        ` : ''}
        ${hasWalkIn ? `
          <button class="admin-nav-item ${this.adminTab === 'walkin' ? 'active' : ''}" 
                  onclick="window.__salonApp.setAdminTab('walkin')">
            Inloopwachtrij (${this.store.state.walkInQueue.length})
          </button>
        ` : ''}
      </nav>

      <!-- Admin Tab Contents -->
      ${this.adminTab === 'day' ? this.renderAdminDayTimeline() : ''}
      ${this.adminTab === 'bookings' ? this.renderAdminBookingsTable() : ''}
      ${this.adminTab === 'clients' ? this.renderAdminClientsView() : ''}
      ${this.adminTab === 'courses' ? this.renderAdminCoursesView() : ''}
      ${this.adminTab === 'walkin' ? this.renderAdminWalkInView() : ''}
    `;
  }

  // Admin Day Timeline View
  renderAdminDayTimeline() {
    const cfg = this.store.config;
    const staff = this.store.state.staff;
    const targetDate = this.bookingState.selectedDate || '2026-11-03';
    const dayBookings = this.store.state.bookings.filter(b => b.date === targetDate);

    // Timeline hours 09:00 to 18:00
    const hours = ['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'];

    return `
      <div class="content-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <h3 class="card-title" style="font-size: 1.15rem;">
            Agenda voor ${this.formatDutchDate(targetDate)}
          </h3>
          <div style="display: flex; align-items: center; gap: 0.5rem;">
            <label class="form-label" style="margin: 0;">Datum:</label>
            <input type="date" class="form-input" style="min-height: 36px; padding: 0.25rem 0.5rem;" 
                   value="${targetDate}" 
                   onchange="window.__salonApp.selectDate(this.value)" />
          </div>
        </div>

        <div class="timeline-container">
          <div class="timeline-header-row">
            <div class="timeline-time-col-header">Tijd</div>
            ${staff.map(st => `
              <div class="timeline-staff-col-header">${this.escapeHtml(st.name)}</div>
            `).join('')}
          </div>

          <div class="timeline-body">
            ${hours.map(hour => `
              <div class="timeline-grid-row">
                <div class="timeline-time-cell">${hour}</div>
                ${staff.map(st => {
                  // Find bookings starting in this hour slot for this staff
                  const matching = dayBookings.filter(b => {
                    const bStaffMatch = b.staff_id === st.id || (!b.staff_id && st.id === staff[0].id);
                    return bStaffMatch && b.start_time.startsWith(hour.slice(0, 2));
                  });

                  return `
                    <div class="timeline-slot-cell">
                      ${matching.map(b => {
                        const statusClass = `status-${b.status}`;
                        return `
                          <div class="timeline-appointment-card ${statusClass}" 
                               onclick="window.__salonApp.openBookingDetailModal('${b.id}')">
                            <strong>${b.start_time} - ${b.end_time}</strong>: ${this.escapeHtml(b.client_name)}
                            <br><span style="color: var(--text-muted);">${this.escapeHtml(b.service_name)}</span>
                            ${b.is_sample ? '<span class="badge badge-sample" style="float: right;">SAMPLE</span>' : ''}
                          </div>
                        `;
                      }).join('')}
                    </div>
                  `;
                }).join('')}
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  // Admin Bookings Table View
  renderAdminBookingsTable() {
    const bookings = this.store.state.bookings;

    return `
      <div class="content-card">
        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Datum &amp; Tijd</th>
                <th>Klant</th>
                <th>Behandeling</th>
                <th>Specialist</th>
                <th>Prijs</th>
                <th>Status</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              ${bookings.length > 0 ? bookings.map(b => {
                const statusBadge = {
                  confirmed: '<span class="badge badge-confirmed">Bevestigd</span>',
                  cancelled: '<span class="badge badge-cancelled">Geannuleerd</span>',
                  completed: '<span class="badge badge-completed">Voltooid</span>',
                  no_show: '<span class="badge badge-noshow">No-Show</span>'
                }[b.status] || b.status;

                return `
                  <tr>
                    <td>
                      <strong>${b.date}</strong><br>
                      <span style="color: var(--text-muted); font-size: 0.8rem;">${b.start_time} - ${b.end_time}</span>
                    </td>
                    <td>
                      ${this.escapeHtml(b.client_name)}
                      ${b.is_sample ? '<span class="badge badge-sample" style="margin-left: 4px;">SAMPLE</span>' : ''}
                      <br><span style="color: var(--text-muted); font-size: 0.8rem;">${this.escapeHtml(b.client_phone || '')}</span>
                    </td>
                    <td>
                      ${this.escapeHtml(b.service_name)}
                      ${b.pet_data ? `<br><small style="color: var(--accent);">🐾 ${this.escapeHtml(b.pet_data.name)}</small>` : ''}
                    </td>
                    <td>${this.escapeHtml(b.staff_name || 'Specialist')}</td>
                    <td>€${b.price_eur || 0}</td>
                    <td>${statusBadge}</td>
                    <td>
                      <div style="display: flex; gap: 0.35rem; flex-wrap: wrap;">
                        <button class="btn btn-secondary btn-sm" onclick="window.__salonApp.openBookingDetailModal('${b.id}')">
                          Details
                        </button>
                        ${b.status === 'confirmed' ? `
                          <button class="btn btn-secondary btn-sm" onclick="window.__salonApp.openRescheduleModal('${b.id}')">
                            Verplaatsen
                          </button>
                          <button class="btn btn-outline-danger btn-sm" onclick="window.__salonApp.promptCancelBooking('${b.id}')">
                            Annuleren
                          </button>
                        ` : ''}
                      </div>
                    </td>
                  </tr>
                `;
              }).join('') : `
                <tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Nog geen boekingen gevonden.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  // Admin Clients & Pets Dossiers
  renderAdminClientsView() {
    const clients = this.store.state.clients;
    const pets = this.store.state.pets;

    return `
      <div class="content-card">
        <h3 class="card-title" style="font-size: 1.15rem; margin-bottom: 1rem;">Klantenbestand &amp; Geschiedenis</h3>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;">
          ${clients.map(c => {
            const clientPets = pets.filter(p => p.client_id === c.id);
            const clientBookings = this.store.state.bookings.filter(b => b.client_id === c.id);
            return `
              <div style="background: var(--background); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                  <strong style="color: var(--primary);">${this.escapeHtml(c.name)}</strong>
                  ${c.is_sample ? '<span class="badge badge-sample">SAMPLE</span>' : ''}
                </div>
                <div style="font-size: 0.85rem; color: var(--text-muted); margin: 0.35rem 0;">
                  📞 ${this.escapeHtml(c.phone)}<br>
                  ✉️ ${this.escapeHtml(c.email)}
                </div>
                ${c.notes ? `<p style="font-size: 0.8rem; background: var(--surface); padding: 0.4rem; border-radius: 4px; margin-top: 0.5rem;">${this.escapeHtml(c.notes)}</p>` : ''}

                ${clientPets.length > 0 ? `
                  <div style="margin-top: 0.75rem; border-top: 1px dashed var(--border); padding-top: 0.5rem;">
                    <div style="font-size: 0.75rem; font-weight: 700; color: var(--accent); text-transform: uppercase;">Geregistreerde dieren:</div>
                    ${clientPets.map(p => `
                      <div style="font-size: 0.8rem; margin-top: 0.25rem;">
                        🐾 <strong>${this.escapeHtml(p.name)}</strong> (${this.escapeHtml(p.breed)}, ${this.escapeHtml(p.species)})
                        ${p.medical_flags && p.medical_flags.length > 0 ? `<br><span style="color: var(--danger); font-size: 0.75rem;">⚠ ${p.medical_flags.join(', ')}</span>` : ''}
                      </div>
                    `).join('')}
                  </div>
                ` : ''}

                <div style="margin-top: 0.75rem; font-size: 0.75rem; color: var(--text-muted);">
                  Aantal afspraken: ${clientBookings.length}
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  // Admin Treatment Courses (Yourbeauty, Feel Smooth, Polat Beauty)
  renderAdminCoursesView() {
    const courses = this.store.state.treatmentCourses;

    return `
      <div class="content-card">
        <h3 class="card-title" style="font-size: 1.15rem; margin-bottom: 0.5rem;">
          Behandeltrajecten &amp; Kuren (Beauty Course Tracking)
        </h3>
        <p class="card-subtitle" style="margin-bottom: 1.25rem;">
          Volg sessievoortgang, huiddiagnoses en herhaalafspraken per cliënt.
        </p>

        <div style="display: flex; flex-direction: column; gap: 1rem;">
          ${courses.map(course => {
            const pct = Math.round((course.completed_sessions / course.total_sessions) * 100);
            return `
              <div style="background: var(--background); border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1.25rem;">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 0.5rem;">
                  <div>
                    <h4 style="font-weight: 700; color: var(--primary);">${this.escapeHtml(course.client_name)}</h4>
                    <span style="font-size: 0.85rem; color: var(--text-muted);">${this.escapeHtml(course.service_name)}</span>
                  </div>
                  <div>
                    <span class="badge" style="background: var(--surface); border: 1px solid var(--accent); color: var(--accent);">
                      Sessie ${course.completed_sessions} van ${course.total_sessions} voltooid
                    </span>
                  </div>
                </div>

                <!-- Progress Bar -->
                <div style="background: #E2E8F0; height: 10px; border-radius: 5px; margin: 0.85rem 0; overflow: hidden;">
                  <div style="background: var(--accent); width: ${pct}%; height: 100%; transition: width 0.3s ease;"></div>
                </div>

                <!-- Skin Analysis Notes Log -->
                <div style="background: var(--surface); border-radius: var(--radius-sm); padding: 0.75rem; margin: 0.75rem 0;">
                  <div style="font-size: 0.8rem; font-weight: 700; margin-bottom: 0.35rem;">Huidanalyse &amp; Voortgangsnotities per bezoek:</div>
                  ${course.skin_analysis_notes.map(n => `
                    <div style="font-size: 0.8rem; border-bottom: 1px solid #E2E8F0; padding: 0.25rem 0;">
                      <strong>${n.date}:</strong> ${this.escapeHtml(n.note)}
                    </div>
                  `).join('')}
                </div>

                <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-top: 0.5rem;">
                  <button class="btn btn-secondary btn-sm" onclick="window.__salonApp.promptAddSkinNote('${course.id}')">
                    + Huidanalyse notitie toevoegen
                  </button>
                  <button class="btn btn-accent btn-sm" onclick="window.__salonApp.advanceCourseSession('${course.id}')">
                    ✓ Sessie ${course.completed_sessions + 1} afronden
                  </button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;
  }

  promptAddSkinNote(courseId) {
    const note = prompt('Voer de huidanalyse en behandelnotitie in:');
    if (note && note.trim()) {
      this.store.addSkinAnalysisNote(courseId, note.trim());
      this.showToast('info', 'Notitie opgeslagen', 'Huidanalyse notitie succesvol toegevoegd aan het dossier.');
      this.render();
    }
  }

  advanceCourseSession(courseId) {
    this.showConfirmDialog({
      title: 'Sessie als voltooid markeren?',
      message: 'Wilt u de huidige sessie afronden en de voortgangsbalk verhogen?',
      confirmText: 'Sessie afronden',
      cancelText: 'Annuleren',
      isDestructive: false,
      onConfirm: () => {
        this.store.advanceCourseSession(courseId);
        this.showToast('success', 'Sessie afgerond', 'Voortgang bijgewerkt.');
        this.render();
      }
    });
  }

  // Admin Walk-In Queue View (ISSA & Hair Salons)
  renderAdminWalkInView() {
    const queue = this.store.state.walkInQueue;

    return `
      <div class="content-card">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; flex-wrap: wrap; gap: 0.5rem;">
          <div>
            <h3 class="card-title" style="font-size: 1.15rem;">Live Inloopwachtrij (Walk-in Queue)</h3>
            <p class="card-subtitle">Beheer wachtende inloopklanten in de salon.</p>
          </div>
          <button class="btn btn-primary btn-sm" onclick="window.__salonApp.promptAddWalkIn()">
            + Inloopklant toevoegen
          </button>
        </div>

        <div class="table-responsive">
          <table class="data-table">
            <thead>
              <tr>
                <th>Binnenkomst</th>
                <th>Klant</th>
                <th>Behandeling</th>
                <th>Geschatte wachttijd</th>
                <th>Status</th>
                <th>Acties</th>
              </tr>
            </thead>
            <tbody>
              ${queue.length > 0 ? queue.map(q => `
                <tr>
                  <td><strong>${q.arrival_time}</strong></td>
                  <td>${this.escapeHtml(q.client_name)}</td>
                  <td>${this.escapeHtml(q.service_name)}</td>
                  <td>${q.wait_time_min} minuten</td>
                  <td>
                    <span class="badge ${q.status === 'in_chair' ? 'badge-confirmed' : 'badge-sample'}">
                      ${q.status === 'in_chair' ? 'In de stoel' : 'Wachtend'}
                    </span>
                  </td>
                  <td>
                    ${q.status === 'waiting' ? `
                      <button class="btn btn-accent btn-sm" onclick="window.__salonApp.setWalkInStatus('${q.id}', 'in_chair')">
                        In de stoel nemen
                      </button>
                    ` : `
                      <button class="btn btn-secondary btn-sm" onclick="window.__salonApp.removeWalkIn('${q.id}')">
                        Afronden
                      </button>
                    `}
                  </td>
                </tr>
              `).join('') : `
                <tr><td colspan="6" style="text-align: center; color: var(--text-muted);">Momenteel geen wachtende klanten.</td></tr>
              `}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  promptAddWalkIn() {
    const name = prompt('Naam van de inloopklant:');
    if (!name || !name.trim()) return;
    const service = prompt('Gewenste behandeling (bijv. Knippen / Baard):', 'Knippen');
    const wait = prompt('Geschatte wachttijd in minuten:', '15');
    this.store.addWalkIn(name.trim(), service || 'Knippen', Number(wait) || 15);
    this.showToast('success', 'Inloopklant toegevoegd', `${name} is toegevoegd aan de wachtrij.`);
    this.render();
  }

  setWalkInStatus(id, status) {
    this.store.updateWalkInStatus(id, status);
    this.showToast('info', 'Status gewijzigd', 'Klant is nu in de behandelstoel.');
    this.render();
  }

  removeWalkIn(id) {
    this.store.removeWalkIn(id);
    this.showToast('success', 'Inloopklant afgerond', 'Behandeling voltooid.');
    this.render();
  }

  // --- Booking Detail Modal ---

  openBookingDetailModal(bookingId) {
    const b = this.store.state.bookings.find(bk => bk.id === bookingId);
    if (!b) return;

    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="modal-backdrop" id="detail-backdrop">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Boekingsdetails #${b.id.toUpperCase()}</h3>
            <button class="modal-close-btn" onclick="document.getElementById('global-modal-container').innerHTML=''">&times;</button>
          </div>
          <div class="modal-body">
            <div class="summary-row">
              <span class="summary-label">Klant</span>
              <span class="summary-value">${this.escapeHtml(b.client_name)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Telefoon</span>
              <span class="summary-value">${this.escapeHtml(b.client_phone || 'Niet opgegeven')}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">E-mail</span>
              <span class="summary-value">${this.escapeHtml(b.client_email || 'Niet opgegeven')}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Behandeling</span>
              <span class="summary-value">${this.escapeHtml(b.service_name)}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Specialist</span>
              <span class="summary-value">${this.escapeHtml(b.staff_name || 'Specialist')}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Datum &amp; Tijd</span>
              <span class="summary-value">${b.date} &bull; ${b.start_time} - ${b.end_time}</span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Status</span>
              <span class="summary-value"><span class="badge badge-${b.status}">${b.status}</span></span>
            </div>
            <div class="summary-row">
              <span class="summary-label">Herinnering status</span>
              <span class="summary-value">${b.reminder_sent ? 'Verzonden (prototype)' : 'Niet verzonden'}</span>
            </div>

            ${b.pet_data ? `
              <div style="margin-top: 1rem; padding-top: 0.75rem; border-top: 1px solid var(--border);">
                <strong>🐾 Huisdier Profiel:</strong>
                <p style="font-size: 0.85rem; margin-top: 0.25rem;">
                  Naam: <strong>${this.escapeHtml(b.pet_data.name)}</strong><br>
                  Ras: ${this.escapeHtml(b.pet_data.breed || '')} (${this.escapeHtml(b.pet_data.species || 'Hond')})<br>
                  Vachtconditie: ${this.escapeHtml(b.pet_data.coat || 'Normaal')}<br>
                  Gedrag: ${this.escapeHtml(b.pet_data.behaviour_notes || 'Geen')}<br>
                  ${b.pet_data.medical_flags && b.pet_data.medical_flags.length > 0 ? `
                    <span style="color: var(--danger); font-weight: 600;">Bijzonderheden: ${b.pet_data.medical_flags.join(', ')}</span>
                  ` : ''}
                </p>
              </div>
            ` : ''}

            ${b.notes ? `
              <div style="margin-top: 0.75rem;">
                <strong>Notities:</strong>
                <p style="font-size: 0.85rem; background: var(--surface); padding: 0.5rem; border-radius: 4px;">${this.escapeHtml(b.notes)}</p>
              </div>
            ` : ''}
          </div>
          <div class="modal-footer">
            <button class="btn btn-secondary btn-sm" onclick="window.__salonApp.sendSimulatedReminder('${b.id}')">
              Herinnering sturen
            </button>
            <button class="btn btn-secondary btn-sm" onclick="document.getElementById('global-modal-container').innerHTML=''">
              Sluiten
            </button>
          </div>
        </div>
      </div>
    `;
  }

  showHoursModal() {
    const cfg = this.store.config;
    const hours = cfg.hours || {};
    const container = document.getElementById('global-modal-container');
    if (!container) return;

    container.innerHTML = `
      <div class="modal-backdrop">
        <div class="modal-dialog">
          <div class="modal-header">
            <h3 class="modal-title">Openingstijden ${this.escapeHtml(cfg.client)}</h3>
            <button class="modal-close-btn" onclick="document.getElementById('global-modal-container').innerHTML=''">&times;</button>
          </div>
          <div class="modal-body">
            <div class="summary-card" style="margin-bottom: 0;">
              ${Object.entries(hours).map(([day, val]) => `
                <div class="summary-row">
                  <span class="summary-label">${day}</span>
                  <span class="summary-value">${val}</span>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="modal-footer">
            <button class="btn btn-primary btn-sm" onclick="document.getElementById('global-modal-container').innerHTML=''">
              Sluiten
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // --- Error-Handling.md Simulation Functions ---

  simulateSlotRaceError() {
    this.showToast('error', 'Slot zojuist geboekt', 'Dat tijdslot is zojuist door iemand anders geboekt. Kies alstublieft een ander tijdstip.');
    this.bookingState.selectedSlot = null;
    this.render();
  }

  simulateNetworkError() {
    this.showToast('error', 'Verbindingsfout (gesimuleerd)', 'Er is iets misgegaan. Er is niets geboekt. Probeer het opnieuw.');
  }

  resetSampleData() {
    this.showConfirmDialog({
      title: 'Voorbeelddata resetten?',
      message: 'Alle gemaakte testboekingen worden gewist en teruggezet naar de standaard statische voorbeelddata uit de configuratie.',
      confirmText: 'Resetten',
      cancelText: 'Annuleren',
      isDestructive: true,
      onConfirm: () => {
        this.store.resetToInitial();
        this.bookingState = this.getDefaultBookingState();
        this.showToast('info', 'Voorbeelddata hersteld', 'De salonstatus is succesvol teruggezet naar de beginstaat.');
        this.render();
      }
    });
  }

  // --- Utilities ---

  postRender() {
    this.renderToasts();
  }

  formatDutchDate(ymd) {
    if (!ymd) return '';
    const d = parseDateYMD(ymd);
    const dayNames = ['Zondag', 'Maandag', 'Dinsdag', 'Woensdag', 'Donderdag', 'Vrijdag', 'Zaterdag'];
    const monthNames = ['januari', 'februari', 'maart', 'april', 'mei', 'juni', 'juli', 'augustus', 'september', 'oktober', 'november', 'december'];
    return `${dayNames[d.getDay()]} ${d.getDate()} ${monthNames[d.getMonth()]} ${d.getFullYear()}`;
  }

  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }
}

// Instantiate and expose globally
document.addEventListener('DOMContentLoaded', () => {
  window.__salonApp = new SalonApp();
});

