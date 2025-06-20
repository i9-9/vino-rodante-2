"use client"

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/database.types';

interface UseSupabaseReadyResult {
  isReady: boolean;
  client: SupabaseClient<Database> | null;
  error: string | null;
}

export function useSupabaseReady(): UseSupabaseReadyResult {
  const [isReady, setIsReady] = useState(false);
  const [client, setClient] = useState<SupabaseClient<Database> | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeSupabase = async () => {
      try {
        console.log('🔄 Iniciando Supabase...');
        const supabase = createClient();
        
        // TEMPORALMENTE: No llamar a getSession() - solo verificar que el cliente existe
        if (supabase && supabase.auth) {
          console.log('✅ Cliente Supabase creado correctamente');
          
          if (isMounted) {
            setClient(supabase);
            setIsReady(true);
            setError(null);
          }
        } else {
          throw new Error('Cliente Supabase no válido');
        }
      } catch (error: any) {
        console.error('❌ Error de inicialización:', error);
        
        if (isMounted) {
          setError(error.message);
          // FALLBACK: marcar como listo después de error para no bloquear UI
          setTimeout(() => {
            if (isMounted) {
              console.log('⚠️ Forzando inicialización después de error');
              setClient(createClient());
              setIsReady(true);
            }
          }, 2000);
        }
      }
    };

    initializeSupabase();

    return () => {
      isMounted = false;
    };
  }, []);

  return { isReady, client, error };
} 