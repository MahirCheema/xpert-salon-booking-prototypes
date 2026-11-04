export interface SalonTheme {
  primary: string;
  secondary?: string;
  accent?: string;
  radius?: string;
  font?: string;
  mode?: 'light' | 'dark' | 'auto';
}

export interface DayHours {
  open?: string;
  close?: string;
  isClosed?: boolean;
  isOpen?: boolean;
  isByAppointment?: boolean;
  hasBreak?: boolean;
  breakStart?: string;
  breakEnd?: string;
  note?: string;
}

export interface OpeningHoursConfig {
  monday?: DayHours;
  tuesday?: DayHours;
  wednesday?: DayHours;
  thursday?: DayHours;
  friday?: DayHours;
  saturday?: DayHours;
  sunday?: DayHours;
  [day: string]: DayHours | undefined;
}

export interface StaffRecord {
  id: string;
  name: string;
  name_sample?: string;
  role: string;
  working_hours?: OpeningHoursConfig | null;
  cert?: string;
  chair?: string;
  kvk?: string;
  phone?: string;
  email?: string;
}

export interface SpecialistProfile {
  name: string;
  role: string;
  email: string;
  phone: string;
  cert: string;
  chair: string;
  kvk: string;
}

export interface SalonProblemStatement {
  identified_issue?: string;
  business_impact?: string;
  features_to_solve?: string[];
  [key: string]: unknown;
}

export interface SalonConfig {
  slug: string;
  client: string;
  type: string;
  city: string;
  phone: string;
  email: string;
  website: string;
  address: string;
  theme?: SalonTheme;
  hours?: OpeningHoursConfig;
  staff: StaffRecord[];
  services?: Array<{
    id: string;
    name: string;
    duration_min: number;
    price_eur: number | null;
    price_sample_eur?: number | null;
    student_price_eur?: number | null;
    student_price_sample_eur?: number | null;
    buffer_min?: number;
    requires_pet?: boolean;
    requires_course?: boolean;
  }>;
  features?: string[];
  problem?: string;
  problem_statement?: SalonProblemStatement;
  problem_solution?: string;
  cancellation_policy?: string;
  contact?: {
    phone?: string;
    email?: string;
    address?: string;
    website?: string;
    [key: string]: unknown;
  };
  business_details?: Record<string, unknown>;
  special_closures?: Array<{ id: string; date: string; reason: string; type: string }>;
  booking_rules?: Record<string, unknown>;
  staff_sample?: Array<{ id: string; name_sample: string; role: string }>;
  sample_appointments?: Array<{
    id?: string;
    client_name?: string;
    client_phone?: string;
    client_email?: string;
    client_sample?: string;
    service?: string;
    service_name?: string;
    staff_name?: string;
    date?: string;
    time?: string;
    start_time?: string;
    price_eur?: number;
    notes?: string;
    pet_name?: string;
    pet_breed?: string;
    status?: string;
  }>;
  sample_clients?: Array<{
    id: string;
    name: string;
    phone: string;
    email: string;
    notes?: string;
  }>;
}
