import { useState, useEffect, useCallback } from 'react';
import { salonApi } from '@/api/mock-backend';
import type { BookingRecord, BookingStatus } from '@/types';

export interface UseAppointmentsParams {
  slug: string;
  status?: string;
  staffId?: string;
  date?: string;
  query?: string;
  role?: 'admin' | 'customer';
  clientId?: string;
}

export function useAppointments({
  slug,
  status = 'all',
  staffId = 'all',
  date,
  query,
  role = 'admin',
  clientId,
}: UseAppointmentsParams) {
  const [data, setData] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await salonApi.getAppointments(slug, {
        status,
        staffId,
        date,
        query,
        role,
        clientId,
      });
      if (response.success) {
        setData(response.data);
      } else {
        setError(response.error || 'Fout bij ophalen afspraken');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, [slug, status, staffId, date, query, role, clientId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const cancelAppointment = useCallback(
    async (bookingId: string, reason?: string) => {
      const res = await salonApi.cancelAppointment(slug, bookingId, reason);
      if (res.success) {
        setData((prev) =>
          prev.map((b) => (b.id === bookingId ? res.data : b))
        );
      }
      return res;
    },
    [slug]
  );

  const rescheduleAppointment = useCallback(
    async (bookingId: string, newDate: string, newTime: string, newStaffId?: string) => {
      const res = await salonApi.rescheduleAppointment(slug, bookingId, newDate, newTime, newStaffId);
      if (res.success) {
        setData((prev) =>
          prev.map((b) => (b.id === bookingId ? res.data : b))
        );
      }
      return res;
    },
    [slug]
  );

  const updateStatus = useCallback(
    async (bookingId: string, newStatus: BookingStatus) => {
      const res = await salonApi.updateAppointmentStatus(slug, bookingId, newStatus);
      if (res.success) {
        setData((prev) =>
          prev.map((b) => (b.id === bookingId ? res.data : b))
        );
      }
      return res;
    },
    [slug]
  );

  return {
    appointments: data,
    isLoading,
    error,
    refetch: fetchBookings,
    cancelAppointment,
    rescheduleAppointment,
    updateStatus,
  };
}

