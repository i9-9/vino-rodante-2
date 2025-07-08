-- Script para arreglar planes Premium
-- Eliminar opciones semanal y quincenal de planes Premium (solo mensual)

-- Primero, veamos los planes Premium actuales
SELECT 
  id,
  name,
  club,
  price_weekly,
  price_biweekly,
  price_monthly,
  price_quarterly,
  wines_per_delivery,
  is_active,
  created_at
FROM subscription_plans 
WHERE name LIKE '%Premium%'
AND is_active = true
ORDER BY club, created_at;

-- ACTUALIZAR PLANES PREMIUM
-- Poner precio_weekly y price_biweekly en NULL para que no aparezcan como opciones
-- Poner price_quarterly en 0 (no NULL por la restricción NOT NULL)
-- Mantener solo price_monthly

UPDATE subscription_plans 
SET 
  price_weekly = NULL,
  price_biweekly = NULL,
  price_quarterly = 0,
  updated_at = NOW()
WHERE name LIKE '%Premium%'
AND is_active = true;

-- Verificar resultado final
SELECT 
  id,
  name,
  club,
  price_weekly,
  price_biweekly,
  price_monthly,
  price_quarterly,
  wines_per_delivery,
  is_active,
  created_at
FROM subscription_plans 
WHERE is_active = true
ORDER BY club, wines_per_delivery, created_at;

-- Mostrar resumen de opciones disponibles
SELECT 
  name,
  club,
  CASE 
    WHEN price_weekly IS NOT NULL AND price_weekly > 0 THEN 'Sí'
    ELSE 'No'
  END as tiene_semanal,
  CASE 
    WHEN price_biweekly IS NOT NULL AND price_biweekly > 0 THEN 'Sí'
    ELSE 'No'
  END as tiene_quincenal,
  CASE 
    WHEN price_monthly IS NOT NULL AND price_monthly > 0 THEN 'Sí'
    ELSE 'No'
  END as tiene_mensual,
  wines_per_delivery
FROM subscription_plans 
WHERE is_active = true
ORDER BY club, wines_per_delivery; 