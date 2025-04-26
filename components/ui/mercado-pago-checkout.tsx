"use client"

import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/providers/translations-provider';

// Define window interface to include MercadoPago
declare global {
  interface Window {
    MercadoPago: {
      new (publicKey: string, options?: { locale: string }): {
        checkout: (options: {
          preference: { id: string },
          autoOpen?: boolean,
          render: {
            container: string,
            label: string,
            installments?: boolean
          }
        }) => {
          on: (event: string, callback: (data?: any) => void) => void
        }
      }
    };
  }
}

interface MercadoPagoCheckoutProps {
  preferenceId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export function MercadoPagoCheckout({
  preferenceId,
  onSuccess,
  onError,
}: MercadoPagoCheckoutProps) {
  const [loading, setLoading] = useState(false);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const t = useTranslations();

  useEffect(() => {
    setLoading(scriptLoaded && !!preferenceId);
  }, [scriptLoaded, preferenceId]);

  const handleScriptLoad = () => {
    console.log("Mercado Pago script loaded");
    setScriptLoaded(true);
  };

  const handlePayment = () => {
    try {
      if (!preferenceId) return;

      const mp = new window.MercadoPago('APP_USR-cb682995-6da4-474b-8f26-02dc26c36771', {
        locale: 'es-AR',
      });

      const checkout = mp.checkout({
        preference: {
          id: preferenceId,
        },
        autoOpen: true,
        render: {
          container: '.cho-container',
          label: 'Pagar con Mercado Pago',
          installments: true,
        },
      });

      checkout.on('payment_submitted', (data: any) => {
        console.log("Payment submitted", data);
        onSuccess?.(data);
      });

      checkout.on('close', () => {
        console.log("Mercado Pago widget closed");
      });
    } catch (error) {
      console.error("Error initializing Mercado Pago", error);
      onError?.(error);
    }
  };

  // Load Mercado Pago script
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = handleScriptLoad;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  // Initialize payment when script is loaded and we have a preference ID
  useEffect(() => {
    if (scriptLoaded && preferenceId) {
      handlePayment();
    }
  }, [scriptLoaded, preferenceId]);

  return (
    <div className="my-4">
      {loading ? (
        <div className="cho-container w-full" />
      ) : (
        <button
          className={cn(
            'flex items-center justify-center w-full py-3 px-4 rounded-md',
            'bg-[#5B0E2D] text-white hover:bg-[#4a0b24] transition-colors',
            'disabled:opacity-50 disabled:cursor-not-allowed'
          )}
          disabled={true}
        >
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span>{"Cargando pasarela de pago..."}</span>
        </button>
      )}
    </div>
  );
}
