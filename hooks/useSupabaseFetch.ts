"use client"

import React, { useState, useEffect } from 'react';
import { useSupabaseReady } from './useSupabaseReady';
import type { PostgrestError } from '@supabase/supabase-js';

interface UseSupabaseFetchResult<T> {
  data: T | null;
  error: PostgrestError | null;
  isLoading: boolean;
  mutate: () => void;
}

export function useSupabaseFetch<T>(
  query: (signal: AbortSignal) => Promise<{ data: T | null; error: PostgrestError | null }>,
  dependencies: any[] = []
): UseSupabaseFetchResult<T> {
  const { isReady, supabase } = useSupabaseReady();
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<PostgrestError | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isReady || !supabase) {
      return;
    }

    let mounted = true;
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await query(abortController.signal);
        
        if (mounted) {
          setData(data);
          setError(error);
        }
      } catch (err) {
        if (mounted) {
          console.error('Error in useSupabaseFetch:', err);
          setError(err as PostgrestError);
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      mounted = false;
      abortController.abort();
    };
  }, [isReady, supabase, ...dependencies]);

  const mutate = () => {
    if (!isReady || !supabase) {
      return;
    }

    const abortController = new AbortController();
    setIsLoading(true);

    query(abortController.signal).then(({ data, error }) => {
      setData(data);
      setError(error);
      setIsLoading(false);
    });
  };

  return { data, error, isLoading, mutate };
} 