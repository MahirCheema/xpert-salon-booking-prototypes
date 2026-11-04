/**
 * Prototype Data Store - In-memory and localStorage management
 * Conforms strictly to Database.md contracts
 * Labels all sample clients/staff/appointments as SAMPLE
 */

import { CLIENT_CONFIGS, getClientConfig } from './client-configs.js';
import { timeToMinutes, minutesToTime, getServiceBuffer } from './slot-engine.js';

const STORAGE_PREFIX = 'xpert_salon_proto_v2_';

export class SalonDataStore {
  constructor(clientSlug = 'kapsalon-issa') {
    this.clientSlug = clientSlug;
    this.config = getClientConfig(clientSlug);
    this.state = this.loadState();
    this.listeners = [];
  }

  setClient(slug) {
    if (this.clientSlug === slug) return;
    this.clientSlug = slug;
    this.config = getClientConfig(slug);
    this.state = this.loadState();
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(l => l(this.state));
  }

  getStorageKey() {
    return `${STORAGE_PREFIX}${this.clientSlug}`;
  }

  getInitialState() {
    const cfg = this.config;
    const services = (cfg.services || []).map((s, idx) => ({
      id: `srv-${idx + 1}`,
      name: s.name,
      duration_min: s.duration_min,
      price_eur: s.price_sample_eur !== undefined ? s.price_sample_eur : (s.student_price_sample_eur || null),
      student_price_eur: s.student_price_sample_eur || null,
      buffer_min: getServiceBuffer(s),
      requires_pet: cfg.type ? cfg.type.toLowerCase().includes('animal') || cfg.type.toLowerCase().includes('grooming') : false,
      requires_course: cfg.features ? cfg.features.includes('treatment_course_tracking') : false,
      is_sample_price: true
    }));

    const staff = (cfg.staff_sample || []).map(st => ({
      id: st.id,
      name: st.name_sample,
      role: st.role,
      working_hours: null
    }));

    // Initial sample clients (15 realistic profiles)
    const clients = [
      {
        id: 'client-sample-1',
        name: 'Sophie van Dijk',
        phone: '06-12345678',
        email: 'sophie.vandijk@example.nl',
        notes: 'Vaste klant, heeft voorkeur voor rustige ochtenden.',
        is_sample: true,
        loyalty_points: 380,
        loyalty_tier: 'silver',
        total_spent_eur: 310.0,
        redeemed_rewards: ['Luxe verzorgende shampoo'],
        created_at: '2026-08-10T09:00:00Z',
      },
      {
        id: 'client-sample-2',
        name: 'Jan de Vries',
        phone: '06-23456789',
        email: 'jan.devries@example.nl',
        notes: 'Klassieke fade, altijd espresso vooraf.',
        is_sample: true,
        loyalty_points: 190,
        loyalty_tier: 'silver',
        total_spent_eur: 145.0,
        redeemed_rewards: [],
        created_at: '2026-08-15T14:30:00Z',
      },
      {
        id: 'client-sample-3',
        name: 'Anouk de Jong',
        phone: '06-34567890',
        email: 'anouk.dejong@example.nl',
        notes: 'Balayage onderhoud om de 8 weken.',
        is_sample: true,
        loyalty_points: 620,
        loyalty_tier: 'gold',
        total_spent_eur: 540.0,
        redeemed_rewards: ['€15,00 Directe Factuurkorting'],
        created_at: '2026-08-22T11:15:00Z',
      },
      {
        id: 'client-sample-4',
        name: 'Daan Bakker',
        phone: '06-45678901',
        email: 'daan.bakker@example.nl',
        notes: 'Baardtrim + contouren met scheermes.',
        is_sample: true,
        loyalty_points: 85,
        loyalty_tier: 'bronze',
        total_spent_eur: 65.0,
        redeemed_rewards: [],
        created_at: '2026-09-01T09:45:00Z',
      },
      {
        id: 'client-sample-5',
        name: 'Emma van den Berg',
        phone: '06-56789012',
        email: 'emma.berg@example.nl',
        notes: 'Gevoelige hoofdhuid, sulfaatvrije producten.',
        is_sample: true,
        loyalty_points: 310,
        loyalty_tier: 'silver',
        total_spent_eur: 260.0,
        redeemed_rewards: ['Diepverzorgend Haarmasker'],
        created_at: '2026-09-08T15:00:00Z',
      },
      {
        id: 'client-sample-6',
        name: 'Lucas Janssen',
        phone: '06-67890123',
        email: 'lucas.j@example.nl',
        notes: 'Kort model, matte paste styling.',
        is_sample: true,
        loyalty_points: 140,
        loyalty_tier: 'bronze',
        total_spent_eur: 110.0,
        redeemed_rewards: [],
        created_at: '2026-09-14T16:20:00Z',
      },
      {
        id: 'client-sample-7',
        name: 'Mila Visser',
        phone: '06-78901234',
        email: 'mila.visser@example.nl',
        notes: 'Keratinebehandeling en styling voor feest.',
        is_sample: true,
        loyalty_points: 520,
        loyalty_tier: 'gold',
        total_spent_eur: 420.0,
        redeemed_rewards: ['VIP Diamond Treatment'],
        created_at: '2026-09-20T10:30:00Z',
      },
      {
        id: 'client-sample-8',
        name: 'Sander Smit',
        phone: '06-89012345',
        email: 'sander.smit@example.nl',
        notes: 'Elke 3 weken opscheren.',
        is_sample: true,
        loyalty_points: 210,
        loyalty_tier: 'silver',
        total_spent_eur: 175.0,
        redeemed_rewards: [],
        created_at: '2026-09-27T13:00:00Z',
      },
      {
        id: 'client-sample-9',
        name: 'Fleur Meijer',
        phone: '06-90123456',
        email: 'fleur.m@example.nl',
        notes: 'Huidanalyse traject sessie 3 gepland.',
        is_sample: true,
        loyalty_points: 395,
        loyalty_tier: 'silver',
        total_spent_eur: 315.0,
        redeemed_rewards: ['Diepverzorgend Haarmasker'],
        created_at: '2026-10-02T11:45:00Z',
      },
      {
        id: 'client-sample-10',
        name: 'Bram Mulder',
        phone: '06-11223344',
        email: 'bram.mulder@example.nl',
        notes: 'Vaste zaterdagklant.',
        is_sample: true,
        loyalty_points: 160,
        loyalty_tier: 'bronze',
        total_spent_eur: 130.0,
        redeemed_rewards: [],
        created_at: '2026-10-08T09:15:00Z',
      },
      {
        id: 'client-sample-11',
        name: 'Lotte Bos',
        phone: '06-22334455',
        email: 'lotte.bos@example.nl',
        notes: 'Bruidskapsel proefsessie geslaagd.',
        is_sample: true,
        loyalty_points: 740,
        loyalty_tier: 'gold',
        total_spent_eur: 680.0,
        redeemed_rewards: ['€15,00 Directe Factuurkorting', 'VIP Diamond Treatment'],
        created_at: '2026-10-12T14:00:00Z',
      },
      {
        id: 'client-sample-12',
        name: 'Sem Vos',
        phone: '06-33445566',
        email: 'sem.vos@example.nl',
        notes: 'Studentenkorting actief met studentenpas.',
        is_sample: true,
        loyalty_points: 95,
        loyalty_tier: 'bronze',
        total_spent_eur: 75.0,
        redeemed_rewards: [],
        created_at: '2026-10-18T16:00:00Z',
      },
      {
        id: 'client-sample-13',
        name: 'Lieke Peters',
        phone: '06-44556677',
        email: 'lieke.peters@example.nl',
        notes: 'Full colour & highlights.',
        is_sample: true,
        loyalty_points: 440,
        loyalty_tier: 'silver',
        total_spent_eur: 360.0,
        redeemed_rewards: ['Luxe verzorgende shampoo'],
        created_at: '2026-10-22T10:15:00Z',
      },
      {
        id: 'client-sample-14',
        name: 'Jesse Hendriks',
        phone: '06-55667788',
        email: 'jesse.h@example.nl',
        notes: 'Baardolie advies gevraagd.',
        is_sample: true,
        loyalty_points: 110,
        loyalty_tier: 'bronze',
        total_spent_eur: 90.0,
        redeemed_rewards: [],
        created_at: '2026-10-25T15:30:00Z',
      },
      {
        id: 'client-sample-15',
        name: 'Sanne van Leeuwen',
        phone: '06-66778899',
        email: 'sanne.vl@example.nl',
        notes: 'Strippenkaart houder (4 van 6 voltooid).',
        is_sample: true,
        loyalty_points: 580,
        loyalty_tier: 'gold',
        total_spent_eur: 490.0,
        redeemed_rewards: ['Diepverzorgend Haarmasker'],
        created_at: '2026-10-28T11:00:00Z',
      },
    ];

    // Initial sample pets for grooming salons (14 records)
    const pets = [
      {
        id: 'pet-sample-1',
        client_id: 'client-sample-1',
        name: 'Buster',
        species: 'Hond',
        breed: 'Labradoodle',
        coat: 'Krullend / klitgevoelig',
        behaviour_notes: 'Vriendelijk en energiek, voorzichtig rond de oren.',
        medical_flags: ['Gevoelige huid'],
        photo_url: null,
        is_sample: true,
      },
      {
        id: 'pet-sample-2',
        client_id: 'client-sample-2',
        name: 'Luna',
        species: cfg.slug === 'trimsalon-het-hofje' || cfg.slug === 'trimsalon-limbo' ? 'Kat' : 'Hond',
        breed: cfg.slug === 'trimsalon-het-hofje' || cfg.slug === 'trimsalon-limbo' ? 'Britse Korthaar' : 'Golden Retriever',
        coat: 'Dichte ondervacht',
        behaviour_notes: 'Kalm, kan schrikken van luide föhn.',
        medical_flags: [],
        photo_url: null,
        is_sample: true,
      },
      {
        id: 'pet-sample-3',
        client_id: 'client-sample-3',
        name: 'Max',
        species: 'Hond',
        breed: 'Golden Retriever',
        coat: 'Lange vacht met dikke rui-ondervacht',
        behaviour_notes: 'Zeer aanhankelijk, houdt van waterbad.',
        medical_flags: ['Artrose rechter achterpoot (zachte mat)'],
        photo_url: null,
        is_sample: true,
      },
      {
        id: 'pet-sample-4',
        client_id: 'client-sample-4',
        name: 'Bella',
        species: 'Hond',
        breed: 'Franse Bulldog',
        coat: 'Kortstokkig glanzend',
        behaviour_notes: 'Rustig, snel tevreden tijdens nagels knippen.',
        medical_flags: ['Gevoelige luchtwegen'],
        photo_url: null,
        is_sample: true,
      },
      {
        id: 'pet-sample-5',
        client_id: 'client-sample-5',
        name: 'Simba',
        species: 'Kat',
        breed: 'Maine Coon',
        coat: 'Lange halflangharige kraag',
        behaviour_notes: 'Ontspannen, vereist zachte borsteltechniek.',
        medical_flags: ['Klitvorming onder oksels'],
        photo_url: null,
        is_sample: true,
      },
      {
        id: 'pet-sample-6',
        client_id: 'client-sample-6',
        name: 'Rocky',
        species: 'Hond',
        breed: 'Dwergkeeshond (Pomeranian)',
        coat: 'Dubbele pluisvacht (boomer)',
        behaviour_notes: 'Speels, vereist ronde schaartechniek rond het hoofdje.',
        medical_flags: [],
        photo_url: null,
        is_sample: true,
      },
      {
        id: 'pet-sample-7',
        client_id: 'client-sample-7',
        name: 'Pip',
        species: 'Hond',
        breed: 'Cockapoo',
        coat: 'Golvende zachte fleece vacht',
        behaviour_notes: 'Puppy gewenningstraject fase 3 afgerond.',
        medical_flags: ['Puppy (< 1 jaar)'],
        photo_url: null,
        is_sample: true,
      },
      {
        id: 'pet-sample-8',
        client_id: 'client-sample-8',
        name: 'Milo',
        species: 'Kat',
        breed: 'Ragdoll',
        coat: 'Halflangharig zijdezacht',
        behaviour_notes: 'Wordt graag geaaid, stille föhn gewenst.',
        medical_flags: [],
        photo_url: null,
        is_sample: true,
      },
      {
        id: 'pet-sample-9',
        client_id: 'client-sample-9',
        name: 'Daisy',
        species: 'Hond',
        breed: 'Boomer (Shih Tzu x Maltezer)',
        coat: 'Zacht sluikhaar',
        behaviour_notes: 'Lief karakter, oogjes zacht reinigen.',
        medical_flags: ['Traanstrepen rond ogen'],
        photo_url: null,
        is_sample: true,
      },
      {
        id: 'pet-sample-10',
        client_id: 'client-sample-10',
        name: 'Charlie',
        species: 'Hond',
        breed: 'Border Collie',
        coat: 'Halflang weerbestendig',
        behaviour_notes: 'Hoge alertheid, rustige benadering vereist.',
        medical_flags: [],
        photo_url: null,
        is_sample: true,
      },
      {
        id: 'pet-sample-11',
        client_id: 'client-sample-11',
        name: 'Nala',
        species: 'Kat',
        breed: 'Perzische Kat',
        coat: 'Lange dichte vacht',
        behaviour_notes: 'Rustige aparte kamer nodig zonder andere dieren.',
        medical_flags: ['Plat snuitje - extra tijd voor drogen'],
        photo_url: null,
        is_sample: true,
      },
      {
        id: 'pet-sample-12',
        client_id: 'client-sample-12',
        name: 'Teddy',
        species: 'Hond',
        breed: 'Toy Poedel',
        coat: 'Strakke poedelkrul (teddy bear model)',
        behaviour_notes: 'Zeer braaf op de trimtafel.',
        medical_flags: [],
        photo_url: null,
        is_sample: true,
      },
      {
        id: 'pet-sample-13',
        client_id: 'client-sample-13',
        name: 'Guus',
        species: 'Hond',
        breed: 'Teckel (Ruw-harig)',
        coat: 'Ruwharig plukvacht',
        behaviour_notes: 'Handplukken om de 4 maanden.',
        medical_flags: ['Gevoelige rug'],
        photo_url: null,
        is_sample: true,
      },
      {
        id: 'pet-sample-14',
        client_id: 'client-sample-14',
        name: 'Lola',
        species: 'Hond',
        breed: 'Australische Herder',
        coat: 'Dichte dubbele vacht merle',
        behaviour_notes: 'Energiek, geniet van waterblazer ontwollen.',
        medical_flags: [],
        photo_url: null,
        is_sample: true,
      },
    ];

    // Seed schedule appointments (15 non-conflicting appointments distributed across 4 staff columns)
    const configAppointments = cfg.sample_appointments || [];
    const seedScheduleTemplates = [
      // Staff 1 (Col 0): 09:00 - 10:15, 10:45 - 12:00, 13:15 - 14:45, 15:15 - 16:30
      { staff_idx: 0, client_sample: 'Sophie van Dijk', service: services[0]?.name || 'Knippen & Styling', time: '09:00', date: '2026-11-03', status: 'confirmed' },
      { staff_idx: 0, client_sample: 'Emma van den Berg', service: services[1]?.name || 'Highlights & Glans', time: '10:45', date: '2026-11-03', status: 'confirmed' },
      { staff_idx: 0, client_sample: 'Fleur Meijer', service: services[0]?.name || 'Dames Knippen', time: '13:15', date: '2026-11-03', status: 'completed' },
      { staff_idx: 0, client_sample: 'Lieke Peters', service: services[1]?.name || 'Diepgaand Haarmasker', time: '15:15', date: '2026-11-03', status: 'confirmed' },

      // Staff 2 (Col 1): 09:30 - 10:45, 11:15 - 12:30, 13:30 - 14:45, 15:15 - 16:30
      { staff_idx: 1, client_sample: 'Jan de Vries', service: services[1]?.name || 'Wassen & Föhnen', time: '09:30', date: '2026-11-03', status: 'confirmed' },
      { staff_idx: 1, client_sample: 'Lucas Janssen', service: services[0]?.name || 'Opscheren Skin Fade', time: '11:15', date: '2026-11-03', status: 'confirmed' },
      { staff_idx: 1, client_sample: 'Bram Mulder', service: services[0]?.name || 'Tondeuse & Contouren', time: '13:30', date: '2026-11-03', status: 'completed' },
      { staff_idx: 1, client_sample: 'Jesse Hendriks', service: services[1]?.name || 'Heren Knippen & Styling', time: '15:15', date: '2026-11-03', status: 'confirmed' },

      // Staff 3 (Col 2): 09:30 - 11:00, 11:30 - 13:00, 13:45 - 15:15, 15:30 - 16:45
      { staff_idx: 2, client_sample: 'Anouk de Jong', service: services[2]?.name || 'Balayage & Kleuren', time: '09:30', date: '2026-11-03', status: 'confirmed' },
      { staff_idx: 2, client_sample: 'Mila Visser', service: services[2]?.name || 'Keratine Boost Kuur', time: '11:30', date: '2026-11-03', status: 'confirmed' },
      { staff_idx: 2, client_sample: 'Lotte Bos', service: services[2]?.name || 'Balayage Deluxe', time: '13:45', date: '2026-11-03', status: 'confirmed' },
      { staff_idx: 2, client_sample: 'Sanne van Leeuwen', service: services[1]?.name || 'Bruidskapsel Proefsessie', time: '15:30', date: '2026-11-03', status: 'confirmed' },

      // Staff 4 (Col 3): 09:15 - 10:45, 11:15 - 12:45, 13:30 - 15:00
      { staff_idx: 3, client_sample: 'Daan Bakker', service: services[0]?.name || 'Baardtrim & Scheren', time: '09:15', date: '2026-11-03', status: 'confirmed' },
      { staff_idx: 3, client_sample: 'Sander Smit', service: services[0]?.name || 'Knippen & Baardverzorging', time: '11:15', date: '2026-11-03', status: 'confirmed' },
      { staff_idx: 3, client_sample: 'Sem Vos', service: services[0]?.name || 'Studenten Knippen & Wax', time: '13:30', date: '2026-11-03', status: 'confirmed' },
    ];

    const combinedApts = configAppointments.length >= 15
      ? configAppointments
      : [...configAppointments, ...seedScheduleTemplates.slice(configAppointments.length, 15)];

    const bookings = combinedApts.map((apt, idx) => {
      const srvName = apt.service_name || apt.service;
      const srv = services.find(s => s.name === srvName) || services[idx % services.length] || { duration_min: 45, buffer_min: 5, price_eur: 35 };
      const rawTime = apt.start_time || apt.time || '10:00';
      const startMin = timeToMinutes(rawTime);
      const bufferMin = srv.buffer_min || 5;
      const totalMin = (srv.duration_min || 45) + bufferMin;
      const endMin = startMin + totalMin;

      const sIdx = typeof apt.staff_idx === 'number' ? apt.staff_idx : (idx % staff.length);
      const st = staff[sIdx % staff.length] || { id: `staff-${(sIdx % 4) + 1}`, name: 'Specialist' };
      const client = clients[idx % clients.length];
      const pet = pets[idx % pets.length];

      const resolvedClientName = (apt.client_sample || apt.client_name || client.name).replace(/\s*\(SAMPLE\)/gi, '').trim();

      return {
        id: apt.id || `apt-sample-${idx + 1}`,
        client_id: client.id,
        client_name: resolvedClientName,
        client_phone: client.phone,
        client_email: client.email,
        pet_id: srv.requires_pet ? pet.id : null,
        pet_data: srv.requires_pet ? { name: pet.name, breed: pet.breed, coat: pet.coat, species: pet.species, medical_flags: pet.medical_flags } : null,
        service_id: srv.id,
        service_name: apt.service || srv.name,
        staff_id: st.id,
        staff_name: st.name,
        date: apt.date || '2026-11-03',
        start_time: apt.time || '10:00',
        end_time: minutesToTime(endMin),
        duration_min: srv.duration_min,
        buffer_min: bufferMin,
        price_eur: srv.price_eur || 35,
        status: apt.status || 'confirmed',
        source: 'online',
        notes: 'Afspraak gepland in salon agenda.',
        intake_notes: srv.requires_pet ? 'Reguliere trimbeurt' : 'Geen bijzonderheden',
        reminder_sent: false,
        cancelled_at: apt.status === 'cancelled' ? '2026-11-02T12:00:00Z' : null,
        cancel_reason: apt.status === 'cancelled' ? 'Klant verhinderd wegens werk' : undefined,
        is_sample: true,
        created_at: '2026-10-28T10:00:00Z',
      };
    });

    // Sample treatment courses for beauty salons (10 records)
    const treatmentCourses = [
      {
        id: 'tc-sample-1',
        client_id: 'client-sample-1',
        client_name: 'Sophie van Dijk',
        service_id: services[0]?.id || 'srv-1',
        service_name: services[0]?.name || 'Gezichtsbehandeling',
        total_sessions: 6,
        completed_sessions: 2,
        skin_analysis_notes: [
          { date: '2026-10-15', note: 'Intake: vochtarme huid, milde roodheid op de wangen. Start met hydraterende kuur.' },
          { date: '2026-10-29', note: 'Sessie 2: duidelijke verbetering van de huidtextuur. Roodheid afgenomen.' }
        ],
        next_due_date: '2026-11-12',
        is_sample: true
      },
      {
        id: 'tc-sample-2',
        client_id: 'client-sample-3',
        client_name: 'Anouk de Jong',
        service_id: services[1]?.id || 'srv-2',
        service_name: 'Keratine Herstelkuur',
        total_sessions: 5,
        completed_sessions: 3,
        skin_analysis_notes: [
          { date: '2026-09-10', note: 'Droog en broos haar na zomerzon. Aanbrengen dieptekeratine.' },
          { date: '2026-10-01', note: 'Haarvezel voelt 40% steviger aan. Gespleten punten afgenomen.' },
          { date: '2026-10-22', note: 'Glansscore optimaal. Afsluitende sealingsessie ingepland.' },
        ],
        next_due_date: '2026-11-19',
        is_sample: true,
      },
      {
        id: 'tc-sample-3',
        client_id: 'client-sample-5',
        client_name: 'Emma van den Berg',
        service_id: services[0]?.id || 'srv-1',
        service_name: 'Anti-Aging Collageen Therapie',
        total_sessions: 8,
        completed_sessions: 4,
        skin_analysis_notes: [
          { date: '2026-09-15', note: 'Fijne lijntjes voorhoofd en kraaienpootjes geconstateerd.' },
          { date: '2026-10-06', note: 'Verhoogde huidelasticiteit, cliënt zeer tevreden met serum absorptie.' },
        ],
        next_due_date: '2026-11-16',
        is_sample: true,
      },
      {
        id: 'tc-sample-4',
        client_id: 'client-sample-7',
        client_name: 'Mila Visser',
        service_id: services[2]?.id || 'srv-3',
        service_name: 'Laser Ontharing Oksels & Benen',
        total_sessions: 6,
        completed_sessions: 1,
        skin_analysis_notes: [
          { date: '2026-10-18', note: 'Patchtest geslaagd, sessie 1 uitgevoerd zonder irritatie.' },
        ],
        next_due_date: '2026-11-28',
        is_sample: true,
      },
      {
        id: 'tc-sample-5',
        client_id: 'client-sample-9',
        client_name: 'Fleur Meijer',
        service_id: services[1]?.id || 'srv-2',
        service_name: 'Diepte Peeling & Acné Care',
        total_sessions: 6,
        completed_sessions: 3,
        skin_analysis_notes: [
          { date: '2026-09-20', note: 'Start met zachte fruitzuurpeeling 10%.' },
          { date: '2026-10-11', note: 'Verhoogd naar 20%. Huid kalmeert snel met zilvercrème.' },
        ],
        next_due_date: '2026-11-15',
        is_sample: true,
      },
      {
        id: 'tc-sample-6',
        client_id: 'client-sample-11',
        client_name: 'Lotte Bos',
        service_id: services[0]?.id || 'srv-1',
        service_name: 'Bruids Glow Kuur (4 weken)',
        total_sessions: 4,
        completed_sessions: 2,
        skin_analysis_notes: [
          { date: '2026-10-20', note: 'Hydrabrasie sessie 1: schone poriën en stralende basis.' },
        ],
        next_due_date: '2026-11-09',
        is_sample: true,
      },
      {
        id: 'tc-sample-7',
        client_id: 'client-sample-15',
        client_name: 'Sanne van Leeuwen',
        service_id: services[1]?.id || 'srv-2',
        service_name: 'Micro-Needling Huidverjonging',
        total_sessions: 6,
        completed_sessions: 4,
        skin_analysis_notes: [
          { date: '2026-09-05', note: 'Diepte 0.5mm wangen en slapen.' },
          { date: '2026-10-10', note: 'Poriënstructuur aanzienlijk verfijnd.' },
        ],
        next_due_date: '2026-11-20',
        is_sample: true,
      },
      {
        id: 'tc-sample-8',
        client_id: 'client-sample-2',
        client_name: 'Jan de Vries',
        service_id: services[0]?.id || 'srv-1',
        service_name: 'Scalp Detox & Haargroei Stimulatie',
        total_sessions: 5,
        completed_sessions: 2,
        skin_analysis_notes: [
          { date: '2026-10-12', note: 'Overtollig talg verminderd met kleimasker.' },
        ],
        next_due_date: '2026-11-14',
        is_sample: true,
      },
      {
        id: 'tc-sample-9',
        client_id: 'client-sample-4',
        client_name: 'Daan Bakker',
        service_id: services[1]?.id || 'srv-2',
        service_name: 'Baard & Huidverzorging Kuur',
        total_sessions: 4,
        completed_sessions: 1,
        skin_analysis_notes: [
          { date: '2026-10-24', note: 'Ingroeiende haren behandeld met tea tree lotion.' },
        ],
        next_due_date: '2026-11-21',
        is_sample: true,
      },
      {
        id: 'tc-sample-10',
        client_id: 'client-sample-8',
        client_name: 'Sander Smit',
        service_id: services[0]?.id || 'srv-1',
        service_name: 'Intensieve Hoofdhuid Kuur',
        total_sessions: 4,
        completed_sessions: 2,
        skin_analysis_notes: [
          { date: '2026-10-14', note: 'Menthol stimulatie en ontspanning.' },
        ],
        next_due_date: '2026-11-18',
        is_sample: true,
      },
    ];

    // Sample walk-in queue (10 records)
    const walkInQueue = [
      { id: 'wq-1', client_name: 'Dhr. Jansen', service_name: services[0]?.name || 'Knippen', arrival_time: '10:45', wait_time_min: 15, status: 'waiting', is_sample: true },
      { id: 'wq-2', client_name: 'Mevr. Van Veen', service_name: services[1]?.name || 'Wassen & Föhnen', arrival_time: '10:50', wait_time_min: 5, status: 'in_chair', is_sample: true },
      { id: 'wq-3', client_name: 'Tim de Boer', service_name: services[0]?.name || 'Baard Trimmen', arrival_time: '11:00', wait_time_min: 25, status: 'waiting', is_sample: true },
      { id: 'wq-4', client_name: 'Klaas Oosterhout', service_name: services[0]?.name || 'Tondeuse Knippen', arrival_time: '11:15', wait_time_min: 30, status: 'waiting', is_sample: true },
      { id: 'wq-5', client_name: 'Nathalie Groen', service_name: services[1]?.name || 'Puntjes Knippen', arrival_time: '09:30', wait_time_min: 0, status: 'completed', is_sample: true },
      { id: 'wq-6', client_name: 'Ruben van Dam', service_name: services[0]?.name || 'Fade & Lijnen', arrival_time: '11:20', wait_time_min: 35, status: 'waiting', is_sample: true },
      { id: 'wq-7', client_name: 'Iris Brouwer', service_name: services[2]?.name || 'Kleurspoeling', arrival_time: '10:15', wait_time_min: 0, status: 'in_chair', is_sample: true },
      { id: 'wq-8', client_name: 'Robin Schipper', service_name: services[0]?.name || 'Knippen Heren', arrival_time: '09:45', wait_time_min: 0, status: 'completed', is_sample: true },
      { id: 'wq-9', client_name: 'Esmee Kuipers', service_name: services[1]?.name || 'Blow-out Styling', arrival_time: '11:30', wait_time_min: 45, status: 'waiting', is_sample: true },
      { id: 'wq-10', client_name: 'Lars Hoekstra', service_name: services[0]?.name || 'Baard Modelleren', arrival_time: '11:35', wait_time_min: 50, status: 'waiting', is_sample: true },
    ];

    return {
      slug: this.clientSlug,
      clients,
      pets,
      staff,
      services,
      bookings,
      treatmentCourses,
      walkInQueue,
      lastUpdated: new Date().toISOString()
    };
  }

  loadState() {
    try {
      const raw = localStorage.getItem(this.getStorageKey());
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.slug === this.clientSlug && Array.isArray(parsed.bookings)) {
          return parsed;
        }
      }
    } catch {
      // ignore localStorage errors (e.g., privacy mode or node environment)
    }
    return this.getInitialState();
  }

  saveState() {
    try {
      this.state.lastUpdated = new Date().toISOString();
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.state));
    } catch {
      // localStorage may fail in test runners or quota
    }
    this.notify();
  }

  resetToInitial() {
    this.state = this.getInitialState();
    this.saveState();
  }

  // --- Booking Operations ---

  addBooking(bookingData) {
    const srv = this.state.services.find(s => s.id === bookingData.service_id) || {
      name: bookingData.service_name || 'Behandeling',
      duration_min: bookingData.duration_min || 45,
      buffer_min: 5,
      price_eur: bookingData.price_eur || 35
    };

    const bufferMin = srv.buffer_min || getServiceBuffer(srv);
    const startMin = timeToMinutes(bookingData.start_time);
    const endMin = startMin + srv.duration_min + bufferMin;

    const staffMember = this.state.staff.find(st => st.id === bookingData.staff_id) || 
      this.state.staff[0] || 
      { id: 'staff-1', name: 'Specialist' };

    // Register or find client
    let client = this.state.clients.find(c => c.email === bookingData.client_email);
    if (!client) {
      client = {
        id: `client-${Date.now()}`,
        name: bookingData.client_name,
        phone: bookingData.client_phone,
        email: bookingData.client_email,
        notes: bookingData.client_notes || '',
        is_sample: false,
        created_at: new Date().toISOString()
      };
      this.state.clients.push(client);
    }

    // Register pet if grooming
    let petId = null;
    if (bookingData.pet) {
      const pet = {
        id: `pet-${Date.now()}`,
        client_id: client.id,
        name: bookingData.pet.name,
        species: bookingData.pet.species || 'Hond',
        breed: bookingData.pet.breed || '',
        coat: bookingData.pet.coat || '',
        behaviour_notes: bookingData.pet.behaviour_notes || '',
        medical_flags: bookingData.pet.medical_flags || [],
        photo_url: bookingData.pet.photo_preview || null,
        separate_room_flag: !!bookingData.pet.separate_room_flag,
        is_sample: false
      };
      this.state.pets.push(pet);
      petId = pet.id;
    }

    const newBooking = {
      id: `bk-${Date.now().toString().slice(-6)}`,
      client_id: client.id,
      client_name: client.name,
      client_phone: client.phone,
      client_email: client.email,
      pet_id: petId,
      pet_data: bookingData.pet || null,
      service_id: srv.id,
      service_name: srv.name,
      staff_id: staffMember.id,
      staff_name: staffMember.name,
      date: bookingData.date,
      start_time: bookingData.start_time,
      end_time: minutesToTime(endMin),
      duration_min: srv.duration_min,
      buffer_min: bufferMin,
      price_eur: bookingData.price_eur || srv.price_eur,
      is_student: !!bookingData.is_student,
      status: 'confirmed',
      source: 'online',
      notes: bookingData.notes || '',
      intake_notes: bookingData.intake_notes || '',
      reminder_sent: false,
      cancelled_at: null,
      is_sample: false,
      created_at: new Date().toISOString()
    };

    // If customer selected beauty course, record/update course
    if (bookingData.start_treatment_course) {
      this.state.treatmentCourses.push({
        id: `tc-${Date.now()}`,
        client_id: client.id,
        client_name: client.name,
        service_id: srv.id,
        service_name: srv.name,
        total_sessions: 6,
        completed_sessions: 1,
        skin_analysis_notes: [
          { date: bookingData.date, note: `Intake & Sessie 1: ${bookingData.intake_notes || 'Eerste behandeling gestart.'}` }
        ],
        next_due_date: this.addWeeks(bookingData.date, 3),
        is_sample: false
      });
    }

    this.state.bookings.unshift(newBooking);
    this.saveState();
    return newBooking;
  }

  cancelBooking(bookingId, reason = 'Geannuleerd door klant') {
    const booking = this.state.bookings.find(b => b.id === bookingId);
    if (!booking) {
      throw new Error('Boeking niet gevonden');
    }
    booking.status = 'cancelled';
    booking.cancelled_at = new Date().toISOString();
    booking.cancel_reason = reason;
    this.saveState();
    return booking;
  }

  rescheduleBooking(bookingId, newDate, newStartTime, newStaffId) {
    const booking = this.state.bookings.find(b => b.id === bookingId);
    if (!booking) {
      throw new Error('Boeking niet gevonden');
    }

    const durationMin = booking.duration_min || 45;
    const bufferMin = booking.buffer_min || 5;
    const startMin = timeToMinutes(newStartTime);
    const endMin = startMin + durationMin + bufferMin;

    booking.date = newDate;
    booking.start_time = newStartTime;
    booking.end_time = minutesToTime(endMin);
    if (newStaffId) {
      const staffMember = this.state.staff.find(s => s.id === newStaffId);
      if (staffMember) {
        booking.staff_id = staffMember.id;
        booking.staff_name = staffMember.name;
      }
    }
    booking.rescheduled_at = new Date().toISOString();
    this.saveState();
    return booking;
  }

  markStatus(bookingId, status) {
    const booking = this.state.bookings.find(b => b.id === bookingId);
    if (!booking) {
      throw new Error('Boeking niet gevonden');
    }
    booking.status = status;
    this.saveState();
    return booking;
  }

  simulateReminder(bookingId) {
    const booking = this.state.bookings.find(b => b.id === bookingId);
    if (!booking) {
      throw new Error('Boeking niet gevonden');
    }
    booking.reminder_sent = true;
    booking.reminder_sent_at = new Date().toISOString();
    this.saveState();
    return booking;
  }

  // --- Treatment Course Operations ---

  addSkinAnalysisNote(courseId, noteText) {
    const course = this.state.treatmentCourses.find(c => c.id === courseId);
    if (!course) throw new Error('Kuurbehandeling niet gevonden');
    const today = new Date().toISOString().split('T')[0];
    course.skin_analysis_notes.push({
      date: today,
      note: noteText
    });
    this.saveState();
    return course;
  }

  advanceCourseSession(courseId) {
    const course = this.state.treatmentCourses.find(c => c.id === courseId);
    if (!course) throw new Error('Kuurbehandeling niet gevonden');
    if (course.completed_sessions < course.total_sessions) {
      course.completed_sessions += 1;
      this.saveState();
    }
    return course;
  }

  // --- Walk-in Queue Operations ---

  addWalkIn(clientName, serviceName, waitTimeMin = 20) {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const item = {
      id: `wq-${Date.now()}`,
      client_name: clientName,
      service_name: serviceName,
      arrival_time: timeStr,
      wait_time_min: waitTimeMin,
      status: 'waiting',
      is_sample: false
    };
    this.state.walkInQueue.push(item);
    this.saveState();
    return item;
  }

  updateWalkInStatus(queueId, status) {
    const item = this.state.walkInQueue.find(q => q.id === queueId);
    if (!item) return;
    item.status = status;
    this.saveState();
    return item;
  }

  removeWalkIn(queueId) {
    this.state.walkInQueue = this.state.walkInQueue.filter(q => q.id !== queueId);
    this.saveState();
  }

  // --- Helpers ---

  addWeeks(dateStr, weeks) {
    const d = new Date(dateStr);
    d.setDate(d.getDate() + (weeks * 7));
    return d.toISOString().split('T')[0];
  }
}

