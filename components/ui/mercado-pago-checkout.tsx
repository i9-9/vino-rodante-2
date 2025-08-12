"use client"

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslations } from '@/lib/providers/translations-provider';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
          on?: (event: string, callback: (data?: any) => void) => void
          open: () => void
          close: () => void
          cleanup?: () => void
        }
      }
    };
  }
}

interface MercadoPagoCheckoutProps {
  preferenceId: string;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onClose?: () => void;
  className?: string;
}

export function MercadoPagoCheckout({
  preferenceId,
  onSuccess,
  onError,
  onClose,
  className,
}: MercadoPagoCheckoutProps) {
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [checkoutInstance, setCheckoutInstance] = useState<any>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<any>(null);
  const t = useTranslations();

  // Generate unique ID for this instance
  const uniqueId = useRef(`mp-checkout-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`);

  const handleScriptLoad = useCallback(() => {
    console.log("Mercado Pago script loaded");
    setScriptLoaded(true);
  }, []);

  const handleScriptError = useCallback(() => {
    console.error("Failed to load Mercado Pago script");
    setError("Error al cargar Mercado Pago");
    setIsLoading(false);
  }, []);

  const initializeCheckout = useCallback(() => {
    try {
      if (!preferenceId || !scriptLoaded || isInitialized) return;

      const publicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;
      if (!publicKey) {
        throw new Error("MercadoPago public key not configured");
      }

      // Clean up any existing instance
      if (instanceRef.current) {
        try {
          instanceRef.current.close();
        } catch (e) {
          console.log("Error closing previous instance:", e);
        }
      }

      const mp = new window.MercadoPago(publicKey, {
        locale: 'es-AR',
      });

      // Create the checkout instance with unique container
      const checkout = mp.checkout({
        preference: {
          id: preferenceId,
        },
        // Evita carrera de apertura antes de que la instancia esté lista
        autoOpen: true,
        render: {
          container: `#${uniqueId.current}`,
          label: 'Pagar con Mercado Pago',
        },
      });

      // Set up event listeners using the correct API
      if (checkout && typeof checkout.on === 'function') {
        checkout.on('payment_submitted', (data: any) => {
          console.log("Payment submitted", data);
          onSuccess?.(data);
        });

        checkout.on('payment_approved', (data: any) => {
          console.log("Payment approved", data);
          onSuccess?.(data);
        });

        checkout.on('payment_rejected', (data: any) => {
          console.log("Payment rejected", data);
          onError?.({ type: 'rejected', data });
        });

        checkout.on('close', () => {
          console.log("Mercado Pago widget closed");
          onClose?.();
        });

        checkout.on('error', (error: any) => {
          console.error("Mercado Pago error", error);
          setError("Error en el proceso de pago");
          onError?.({ type: 'error', error });
        });
      } else {
        // Fallback for newer SDK versions that don't use .on method
        console.log("Using fallback event handling for Mercado Pago");
        
        // Set up global event listeners
        const handlePaymentSuccess = (event: any) => {
          if (event.detail && event.detail.type === 'payment_approved') {
            console.log("Payment approved via global event", event.detail);
            onSuccess?.(event.detail);
          }
        };

        const handlePaymentError = (event: any) => {
          if (event.detail && event.detail.type === 'payment_rejected') {
            console.log("Payment rejected via global event", event.detail);
            onError?.({ type: 'rejected', data: event.detail });
          }
        };

        // Add global event listeners
        window.addEventListener('mercadopago_payment_success', handlePaymentSuccess);
        window.addEventListener('mercadopago_payment_error', handlePaymentError);

        // Store cleanup function
        checkout.cleanup = () => {
          window.removeEventListener('mercadopago_payment_success', handlePaymentSuccess);
          window.removeEventListener('mercadopago_payment_error', handlePaymentError);
        };
      }

      instanceRef.current = checkout;
      setCheckoutInstance(checkout);
      setIsInitialized(true);
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error initializing Mercado Pago", error);
      setError(error.message || "Error al inicializar Mercado Pago");
      onError?.(error);
      setIsLoading(false);
    }
  }, [preferenceId, scriptLoaded, isInitialized, onSuccess, onError, onClose]);

  const handlePayment = useCallback(() => {
    if (checkoutInstance) {
      checkoutInstance.open();
    } else if (!isInitialized) {
      // Si aún no está inicializado, intenta inicializar (autoOpen abrirá al estar listo)
      initializeCheckout();
    }
  }, [checkoutInstance, isInitialized, initializeCheckout]);

  // Load Mercado Pago script
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check if script is already loaded
    if (window.MercadoPago) {
      setScriptLoaded(true);
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://sdk.mercadopago.com/js/v2';
    script.async = true;
    script.onload = handleScriptLoad;
    script.onerror = handleScriptError;
    document.body.appendChild(script);

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [handleScriptLoad, handleScriptError]);

  // Initialize checkout when script is loaded and we have a preference ID
  useEffect(() => {
    if (scriptLoaded && preferenceId && !isInitialized) {
      initializeCheckout();
    }
  }, [scriptLoaded, preferenceId, isInitialized, initializeCheckout]);

  // Cleanup event listeners when component unmounts
  useEffect(() => {
    return () => {
      if (instanceRef.current) {
        try {
          if (instanceRef.current.cleanup) {
            instanceRef.current.cleanup();
          }
          if (instanceRef.current.close) {
            instanceRef.current.close();
          }
        } catch (e) {
          console.log("Error during cleanup:", e);
        }
      }
    };
  }, []);

  if (error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (isLoading) {
    return (
      <div className={cn("flex items-center justify-center p-8", className)}>
        <div className="flex items-center space-x-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Cargando Mercado Pago...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div id={uniqueId.current} ref={containerRef}></div>
      
      <Button
        onClick={handlePayment}
        className="w-full bg-[#009EE3] hover:bg-[#009EE3]/90 text-white"
        disabled={!checkoutInstance}
      >
        {checkoutInstance ? "Pagar con Mercado Pago" : "Cargando..."}
      </Button>
      
      <p className="text-sm text-gray-500 text-center">
        Pagos seguros procesados por Mercado Pago
      </p>
    </div>
  );
}
