import { useState, useEffect, useCallback } from 'react';
import { salonApi } from '@/api/mock-backend';
import type { ClientRecord } from '@/types';

export function useClients(slug: string, query?: string, role: 'admin' | 'customer' = 'admin') {
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchClients = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await salonApi.getClients(slug, query, role);
      if (response.success) {
        setClients(response.data);
      } else {
        setError(response.error || 'Fout bij ophalen klanten');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Network error');
    } finally {
      setIsLoading(false);
    }
  }, [slug, query, role]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const createClient = useCallback(
    async (clientData: Partial<ClientRecord> & { name: string; phone?: string; email?: string }) => {
      const res = await salonApi.createClient(slug, clientData);
      if (res.success) {
        setClients((prev) => [res.data, ...prev]);
      }
      return res;
    },
    [slug]
  );

  return {
    clients,
    isLoading,
    error,
    refetch: fetchClients,
    createClient,
  };
}

