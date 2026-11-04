export type BookingStatus = 'confirmed' | 'cancelled' | 'completed' | 'no_show';
export type BookingSource = 'online' | 'phone' | 'walk_in' | 'whatsapp';

export interface ServiceRecord {
  id: string;
  name: string;
  duration_min: number;
  price_eur: number | null;
  student_price_eur: number | null;
  buffer_min: number;
  requires_pet: boolean;
  requires_course: boolean;
  is_sample_price: boolean;
}

export interface BookingPetData {
  name: string;
  species: string;
  breed: string;
  coat?: string;
  behaviour_notes?: string;
  separate_room_flag?: boolean;
  photo_preview?: string | null;
  medical_flags?: string[];
}

export interface BookingRecord {
  id: string;
  client_id: string;
  client_name: string;
  client_phone: string;
  client_email: string;
  pet_id?: string | null;
  pet_data?: BookingPetData | null;
  service_id: string;
  service_name: string;
  staff_id: string;
  staff_name: string;
  date: string;
  start_time: string;
  end_time: string;
  duration_min: number;
  buffer_min?: number;
  price_eur: number | null;
  is_student?: boolean;
  is_customer?: boolean;
  status: BookingStatus;
  source?: BookingSource;
  notes?: string;
  intake_notes?: string;
  reminder_sent?: boolean;
  cancelled_at?: string | null;
  cancel_reason?: string;
  rescheduled_at?: string;
  is_sample: boolean;
  created_at: string;
}

export interface CreateBookingPayload {
  client_id?: string;
  client_name: string;
  client_phone: string;
  client_email?: string;
  client_notes?: string;
  pet_id?: string | null;
  pet?: BookingPetData;
  service_id: string;
  service_name?: string;
  duration_min?: number;
  staff_id: string;
  staff_name?: string;
  date: string;
  start_time: string;
  price_eur: number | null;
  is_student?: boolean;
  notes?: string;
  intake_notes?: string;
  source?: BookingSource;
  status?: BookingStatus;
  start_treatment_course?: boolean;
}

export interface SlotResult {
  time: string;
  endTime: string;
  isAvailable: boolean;
  staffId: string;
  staffName: string;
  bufferMin: number;
  durationMin: number;
}

