-- Script para desactivar planes duplicados antiguos
-- En lugar de eliminar, los desactivamos porque están referenciados por suscripciones

-- Primero, veamos qué planes tenemos
SELECT 
  id,
  name,
  club,
  price_weekly,
  price_biweekly,
  price_monthly,
  price_quarterly,
  is_active,
  created_at
FROM subscription_plans 
ORDER BY club, is_active, created_at;

-- Desactivar los planes antiguos que tienen precios altos
-- Estos son los que tienen precios como $49.000, $55.000, etc.
-- Los mantenemos en la BD pero los marcamos como inactivos

UPDATE subscription_plans 
SET 
  is_active = false,
  is_visible = false,
  updated_at = NOW()
WHERE is_active = false 
AND (
  price_weekly >= 49000 OR
  price_biweekly >= 55000 OR
  price_monthly >= 59000 OR
  price_quarterly >= 59000
);

-- Verificar que solo quedan los planes correctos activos
SELECT 
  id,
  name,
  club,
  price_weekly,
  price_biweekly,
  price_monthly,
  price_quarterly,
  is_active,
  is_visible,
  created_at
FROM subscription_plans 
WHERE is_active = true
ORDER BY club, created_at;

-- Mostrar también los planes inactivos para verificación
SELECT 
  id,
  name,
  club,
  price_weekly,
  price_biweekly,
  price_monthly,
  price_quarterly,
  is_active,
  is_visible,
  created_at
FROM subscription_plans 
WHERE is_active = false
ORDER BY club, created_at; 