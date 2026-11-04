import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { CLIENT_SLUGS } from '@/client-configs.js';

export interface AppointmentFilters {
  status: string; // 'all' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  staffId: string;
  date: string;
  searchQuery: string;
}

export interface SalonState {
  currentSlug: string;
  filters: AppointmentFilters;
}

export interface SalonActions {
  setCurrentSlug: (slug: string) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (status: string) => void;
  setStaffFilter: (staffId: string) => void;
  setDateFilter: (date: string) => void;
  resetFilters: () => void;
}

export type SalonStore = SalonState & SalonActions;

const defaultFilters: AppointmentFilters = {
  status: 'all',
  staffId: 'all',
  date: '',
  searchQuery: '',
};

export const useSalonStore = create<SalonStore>()(
  subscribeWithSelector((set) => ({
    currentSlug: (() => {
      if (typeof window !== 'undefined') {
        const urlParams = new URLSearchParams(window.location.search);
        const paramSlug = urlParams.get('client');
        if (paramSlug && CLIENT_SLUGS.includes(paramSlug)) {
          return paramSlug;
        }
      }
      return 'kapsalon-issa';
    })(),
    filters: { ...defaultFilters },

    setCurrentSlug: (slug) => set({ currentSlug: slug }),
    setSearchQuery: (searchQuery) =>
      set((state) => ({ filters: { ...state.filters, searchQuery } })),
    setStatusFilter: (status) =>
      set((state) => ({ filters: { ...state.filters, status } })),
    setStaffFilter: (staffId) =>
      set((state) => ({ filters: { ...state.filters, staffId } })),
    setDateFilter: (date) =>
      set((state) => ({ filters: { ...state.filters, date } })),
    resetFilters: () => set({ filters: { ...defaultFilters } }),
  }))
);

