import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UseSupabaseQueryOptions {
  table: string;
  select?: string;
  filters?: Record<string, any>;
  orderBy?: { column: string; ascending?: boolean };
  limit?: number;
}

export function useSupabaseQuery<T>({ table, select = '*', filters, orderBy, limit }: UseSupabaseQueryOptions) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        let query = supabase.from(table).select(select);

        if (filters) {
          Object.entries(filters).forEach(([key, value]) => {
            query = query.eq(key, value);
          });
        }

        if (orderBy) {
          query = query.order(orderBy.column, { ascending: orderBy.ascending ?? true });
        }

        if (limit) {
          query = query.limit(limit);
        }

        const { data, error } = await query;

        if (error) throw error;
        setData((data as T[]) || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [table, select, JSON.stringify(filters), JSON.stringify(orderBy), limit]);

  return { data, loading, error, refetch: () => {} };
}
