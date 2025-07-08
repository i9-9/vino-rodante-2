-- Script para limpiar planes duplicados definitivamente
-- Desactivar planes antiguos inactivos y duplicados premium (no eliminar)

-- Primero, veamos qué planes tenemos actualmente
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
  is_visible,
  created_at
FROM subscription_plans 
ORDER BY club, is_active, created_at;

-- 1. DESACTIVAR PLANES ANTIGUOS INACTIVOS (con precios altos)
-- Estos son los que tienen precios como $49.000, $55.000, etc. y están inactivos
-- Los mantenemos en la BD pero los ocultamos completamente

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

-- 2. DESACTIVAR PLANES PREMIUM DUPLICADOS
-- Mantener solo el más reciente de cada tipo premium activo
-- Desactivar los duplicados más antiguos

UPDATE subscription_plans 
SET 
  is_active = false,
  is_visible = false,
  updated_at = NOW()
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY name, club, type 
             ORDER BY created_at DESC
           ) as rn
    FROM subscription_plans 
    WHERE name LIKE '%Premium%'
    AND is_active = true
  ) ranked
  WHERE rn > 1
);

-- 3. VERIFICAR RESULTADO FINAL
-- Mostrar todos los planes activos y visibles que quedan
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
  is_visible,
  created_at
FROM subscription_plans 
WHERE is_active = true AND is_visible = true
ORDER BY club, wines_per_delivery, created_at;

-- 4. CONTAR PLANES POR TIPO (solo activos y visibles)
SELECT 
  club,
  COUNT(*) as total_planes,
  COUNT(CASE WHEN name LIKE '%Premium%' THEN 1 END) as premium_plans,
  COUNT(CASE WHEN name NOT LIKE '%Premium%' THEN 1 END) as regular_plans
FROM subscription_plans 
WHERE is_active = true AND is_visible = true
GROUP BY club
ORDER BY club;

-- 5. MOSTRAR PLANES DESACTIVADOS PARA VERIFICACIÓN
SELECT 
  id,
  name,
  club,
  is_active,
  is_visible,
  created_at
FROM subscription_plans 
WHERE is_active = false OR is_visible = false
ORDER BY club, created_at; 