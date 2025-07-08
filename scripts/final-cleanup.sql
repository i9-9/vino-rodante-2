-- Script final para limpiar completamente los planes
-- Ocultar todos los planes inactivos y eliminar duplicados premium

-- 1. OCULTAR TODOS LOS PLANES INACTIVOS
-- Marcar como no visibles todos los planes inactivos

UPDATE subscription_plans 
SET 
  is_visible = false,
  updated_at = NOW()
WHERE is_active = false;

-- 2. ELIMINAR DUPLICADOS PREMIUM
-- Mantener solo el más reciente de cada tipo premium

DELETE FROM subscription_plans 
WHERE id IN (
  SELECT id FROM (
    SELECT id,
           ROW_NUMBER() OVER (
             PARTITION BY name, club, type 
             ORDER BY created_at DESC
           ) as rn
    FROM subscription_plans 
    WHERE name LIKE '%Premium%'
  ) ranked
  WHERE rn > 1
);

-- 3. VERIFICAR RESULTADO FINAL
-- Mostrar solo los planes activos y visibles

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

-- 4. CONTAR PLANES FINALES
SELECT 
  'Total planes activos y visibles' as descripcion,
  COUNT(*) as cantidad
FROM subscription_plans 
WHERE is_active = true AND is_visible = true

UNION ALL

SELECT 
  'Planes regulares (3 vinos)' as descripcion,
  COUNT(*) as cantidad
FROM subscription_plans 
WHERE is_active = true AND is_visible = true
AND name NOT LIKE '%Premium%'

UNION ALL

SELECT 
  'Planes premium (6 vinos)' as descripcion,
  COUNT(*) as cantidad
FROM subscription_plans 
WHERE is_active = true AND is_visible = true
AND name LIKE '%Premium%';

-- 5. MOSTRAR PLANES OCULTOS PARA VERIFICACIÓN
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