import type {
  BookingRecord,
  CreateBookingPayload,
  ClientRecord,
  ServiceRecord,
  BookingStatus,
} from '../types/index.ts';
import { createSalonStore, type SalonDataStore } from '../core/data-store.ts';

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  error?: string;
  timestamp: string;
}

export interface ApiPagination {
  page: number;
  pageSize: number;
  total: number;
}

export interface PaginatedApiResponse<T> extends ApiResponse<T[]> {
  pagination: ApiPagination;
}

const simulateLatency = (ms: number = 100): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Production-grade mock backend layer with realistic latency,
 * relational constraints, collision checks, and standard response envelopes.
 */
class SalonMockBackendService {
  private storeCache: Map<string, SalonDataStore> = new Map();

  private getStore(slug: string): SalonDataStore {
    let store = this.storeCache.get(slug);
    if (!store) {
      store = createSalonStore(slug);
      this.storeCache.set(slug, store);
    }
    return store;
  }

  // 1. Appointments API
  async getAppointments(
    slug: string,
    filters?: {
      status?: string;
      staffId?: string;
      date?: string;
      query?: string;
      role?: 'admin' | 'customer';
      clientId?: string;
    }
  ): Promise<ApiResponse<BookingRecord[]>> {
    await simulateLatency(80);
    const store = this.getStore(slug);
    let bookings = [...store.state.bookings];

    // RBAC: If requester is a customer, restrict results strictly to their own bookings
    if (filters?.role === 'customer') {
      if (!filters.clientId) {
        return {
          data: [],
          success: false,
          error: 'Toegang geweigerd: clientId vereist voor klantenrol.',
          timestamp: new Date().toISOString(),
        };
      }
      bookings = bookings.filter((b) => b.client_id === filters.clientId);
    }

    if (filters?.status && filters.status !== 'all') {
      bookings = bookings.filter((b) => b.status === filters.status);
    }
    if (filters?.staffId && filters.staffId !== 'all') {
      bookings = bookings.filter((b) => b.staff_id === filters.staffId);
    }
    if (filters?.date) {
      bookings = bookings.filter((b) => b.date === filters.date);
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      bookings = bookings.filter(
        (b) =>
          b.client_name.toLowerCase().includes(q) ||
          b.service_name.toLowerCase().includes(q) ||
          b.staff_name.toLowerCase().includes(q)
      );
    }

    return {
      data: bookings,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  async getAppointmentById(
    slug: string,
    id: string,
    role?: 'admin' | 'customer',
    clientId?: string
  ): Promise<ApiResponse<BookingRecord | null>> {
    await simulateLatency(50);
    const store = this.getStore(slug);
    const booking = store.state.bookings.find((b) => b.id === id) || null;

    // RBAC: If requester is a customer, verify ownership of the booking
    if (booking && role === 'customer' && clientId && booking.client_id !== clientId) {
      return {
        data: null,
        success: false,
        error: 'Toegang geweigerd: U heeft geen autorisatie om het dossier van een andere klant in te zien.',
        timestamp: new Date().toISOString(),
      };
    }

    return {
      data: booking,
      success: !!booking,
      error: booking ? undefined : 'Afspraak niet gevonden',
      timestamp: new Date().toISOString(),
    };
  }

  async createAppointment(
    slug: string,
    payload: CreateBookingPayload
  ): Promise<ApiResponse<BookingRecord>> {
    await simulateLatency(120);
    const store = this.getStore(slug);

    if (!payload.client_name || !payload.client_phone || !payload.service_id || !payload.date || !payload.start_time) {
      return {
        data: {} as BookingRecord,
        success: false,
        error: 'Verplichte velden ontbreken (naam, telefoon, dienst, datum, tijd).',
        timestamp: new Date().toISOString(),
      };
    }

    try {
      const newBooking = store.addBooking({
        client_name: payload.client_name,
        client_phone: payload.client_phone,
        client_email: payload.client_email || '',
        service_id: payload.service_id,
        staff_id: payload.staff_id,
        date: payload.date,
        start_time: payload.start_time,
        price_eur: payload.price_eur,
        is_student: payload.is_student,
        notes: payload.notes,
        pet: payload.pet,
        intake_notes: payload.intake_notes,
        start_treatment_course: payload.start_treatment_course,
      });

      return {
        data: newBooking,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      return {
        data: {} as BookingRecord,
        success: false,
        error: err instanceof Error ? err.message : 'Fout bij opslaan boeking',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async cancelAppointment(
    slug: string,
    bookingId: string,
    reason: string = 'Geannuleerd via portaal'
  ): Promise<ApiResponse<BookingRecord>> {
    await simulateLatency(80);
    const store = this.getStore(slug);
    try {
      const cancelled = store.cancelBooking(bookingId, reason);
      return {
        data: cancelled,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      return {
        data: {} as BookingRecord,
        success: false,
        error: err instanceof Error ? err.message : 'Fout bij annuleren afspraak',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async rescheduleAppointment(
    slug: string,
    bookingId: string,
    newDate: string,
    newStartTime: string,
    newStaffId?: string
  ): Promise<ApiResponse<BookingRecord>> {
    await simulateLatency(90);
    const store = this.getStore(slug);
    try {
      const updated = store.rescheduleBooking(bookingId, newDate, newStartTime, newStaffId);
      return {
        data: updated,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      return {
        data: {} as BookingRecord,
        success: false,
        error: err instanceof Error ? err.message : 'Fout bij verplaatsen afspraak',
        timestamp: new Date().toISOString(),
      };
    }
  }

  async updateAppointmentStatus(
    slug: string,
    bookingId: string,
    status: BookingStatus,
    role: 'admin' | 'customer' = 'admin'
  ): Promise<ApiResponse<BookingRecord>> {
    await simulateLatency(60);

    // RBAC: Only salon owners and staff can mark appointments as completed or no-show
    if (role === 'customer' && (status === 'completed' || status === 'no_show')) {
      return {
        data: {} as BookingRecord,
        success: false,
        error: 'Toegang geweigerd: Alleen salonpersoneel kan afspraken als voltooid of no-show markeren.',
        timestamp: new Date().toISOString(),
      };
    }

    const store = this.getStore(slug);
    try {
      const updated = store.updateBookingStatus(bookingId, status);
      return {
        data: updated,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      return {
        data: {} as BookingRecord,
        success: false,
        error: err instanceof Error ? err.message : 'Fout bij updaten status',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 2. Clients API
  async getClients(
    slug: string,
    query?: string,
    role: 'admin' | 'customer' = 'admin'
  ): Promise<ApiResponse<ClientRecord[]>> {
    await simulateLatency(60);

    // RBAC: Customers cannot fetch the salon-wide CRM client registry
    if (role === 'customer') {
      return {
        data: [],
        success: false,
        error: 'Toegang geweigerd: Klanten hebben geen toegang tot het CRM-klantenbestand.',
        timestamp: new Date().toISOString(),
      };
    }

    const store = this.getStore(slug);
    let clients = [...store.state.clients];
    if (query) {
      const q = query.toLowerCase();
      clients = clients.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q)
      );
    }
    return {
      data: clients,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }

  async createClient(
    slug: string,
    clientData: Partial<ClientRecord> & { name: string; phone?: string; email?: string }
  ): Promise<ApiResponse<ClientRecord>> {
    await simulateLatency(90);
    const store = this.getStore(slug);
    try {
      const created = store.addClient(clientData);
      return {
        data: created,
        success: true,
        timestamp: new Date().toISOString(),
      };
    } catch (err: unknown) {
      return {
        data: {} as ClientRecord,
        success: false,
        error: err instanceof Error ? err.message : 'Fout bij aanmaken klant',
        timestamp: new Date().toISOString(),
      };
    }
  }

  // 3. Services API
  async getServices(slug: string): Promise<ApiResponse<ServiceRecord[]>> {
    await simulateLatency(40);
    const store = this.getStore(slug);
    return {
      data: store.state.services,
      success: true,
      timestamp: new Date().toISOString(),
    };
  }
}

export const salonApi = new SalonMockBackendService();

