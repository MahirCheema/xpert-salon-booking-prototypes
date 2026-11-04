export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyReward {
  id: string;
  name: string;
  points: number;
  category: 'discount' | 'treatment' | 'product';
  discountEur?: number;
  freeTreatment?: string;
  description: string;
  iconName?: string;
}

export interface ClientRecord {
  id: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  is_sample: boolean;
  loyalty_points?: number;
  loyalty_tier?: LoyaltyTier;
  total_spent_eur?: number;
  redeemed_rewards?: string[];
  created_at: string;
}

export interface PetRecord {
  id: string;
  client_id: string;
  name: string;
  species: string;
  breed: string;
  coat: string;
  behaviour_notes: string;
  medical_flags: string[];
  photo_url: string | null;
  separate_room_flag?: boolean;
  is_sample: boolean;
}

export interface TreatmentCourseRecord {
  id: string;
  client_id: string;
  client_name: string;
  service_id: string;
  service_name: string;
  total_sessions: number;
  completed_sessions: number;
  skin_analysis_notes: Array<{ date: string; note: string }>;
  next_due_date: string;
  is_sample: boolean;
}

export interface WalkInRecord {
  id: string;
  client_name: string;
  service_name: string;
  arrival_time: string;
  wait_time_min: number;
  status: 'waiting' | 'in_chair' | 'completed';
  is_sample: boolean;
}

