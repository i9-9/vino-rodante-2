-- Script para arreglar los planes de suscripción
-- Modificar frecuencias y agregar opciones de 6 vinos

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
  created_at
FROM subscription_plans 
ORDER BY club, is_active, created_at;

-- 1. ARREGLAR LA RESTRICCIÓN DE TIPO
-- Agregar 'naranjo' a los valores permitidos en el campo type
ALTER TABLE subscription_plans 
DROP CONSTRAINT IF EXISTS subscription_plans_type_check;

ALTER TABLE subscription_plans 
ADD CONSTRAINT subscription_plans_type_check 
CHECK (type = ANY (ARRAY['tinto'::text, 'blanco'::text, 'mixto'::text, 'premium'::text, 'naranjo'::text]));

-- 2. ACTUALIZAR PLANES EXISTENTES (3 vinos)
-- Modificar los planes activos para que tengan solo las frecuencias correctas
-- y 3 vinos por entrega

UPDATE subscription_plans 
SET 
  price_quarterly = 0,  -- Eliminar precio trimestral
  wines_per_delivery = 3,
  updated_at = NOW()
WHERE is_active = true 
AND name NOT LIKE '%Premium%'
AND wines_per_delivery != 6;

-- 3. CREAR PLANES PREMIUM (6 vinos)
-- Insertar nuevos planes premium para cada club con 6 vinos

INSERT INTO subscription_plans (
  name,
  club,
  slug,
  description,
  tagline,
  image,
  features,
  price_weekly,
  price_biweekly,
  price_monthly,
  price_quarterly,
  discount_percentage,
  status,
  display_order,
  is_visible,
  banner_image,
  type,
  wines_per_delivery,
  is_active,
  created_at,
  updated_at
) VALUES 
-- Club Tinto Premium (6 vinos)
(
  'Club Tinto Premium',
  'tinto',
  'club-tinto-premium',
  'Caja premium de 6 vinos tintos seleccionados',
  'Para los verdaderos amantes del vino tinto',
  '/images/club/tinto.jpg',
  '["6 vinos tintos premium", "Envío semanal/quincenal/mensual", "Catas virtuales exclusivas", "Descuentos en compras adicionales"]'::jsonb,
  0,  -- Sin opción semanal para premium
  0,  -- Sin opción quincenal para premium
  65000,  -- Solo mensual
  0,  -- Sin trimestral
  10,  -- 10% descuento
  'activo',
  5,
  true,
  '/images/club/tinto.jpg',
  'tinto',
  6,  -- 6 vinos
  true,
  NOW(),
  NOW()
),
-- Club Blanco Premium (6 vinos)
(
  'Club Blanco Premium',
  'blanco',
  'club-blanco-premium',
  'Caja premium de 6 vinos blancos seleccionados',
  'Para los verdaderos amantes del vino blanco',
  '/images/club/blanco.jpg',
  '["6 vinos blancos premium", "Envío mensual", "Catas virtuales exclusivas", "Descuentos en compras adicionales"]'::jsonb,
  0,
  0,
  65000,
  0,
  10,
  'activo',
  6,
  true,
  '/images/club/blanco.jpg',
  'blanco',
  6,
  true,
  NOW(),
  NOW()
),
-- Club Mixto Premium (6 vinos)
(
  'Club Mixto Premium',
  'mixto',
  'club-mixto-premium',
  'Caja premium de 6 vinos mixtos seleccionados',
  'Variedad premium para todos los gustos',
  '/images/club/mixto.jpg',
  '["6 vinos mixtos premium", "Envío mensual", "Catas virtuales exclusivas", "Descuentos en compras adicionales"]'::jsonb,
  0,
  0,
  65000,
  0,
  10,
  'activo',
  7,
  true,
  '/images/club/mixto.jpg',
  'mixto',
  6,
  true,
  NOW(),
  NOW()
),
-- Club Naranjo Premium (6 vinos)
(
  'Club Naranjo Premium',
  'naranjo',
  'club-naranjo-premium',
  'Caja premium de 6 vinos naranjos seleccionados',
  'Para los verdaderos amantes del vino naranjo',
  '/images/club/naranjo.jpg',
  '["6 vinos naranjos premium", "Envío mensual", "Catas virtuales exclusivas", "Descuentos en compras adicionales"]'::jsonb,
  0,
  0,
  75000,  -- Precio más alto para naranjo
  0,
  10,
  'activo',
  8,
  true,
  '/images/club/naranjo.jpg',
  'naranjo',
  6,
  true,
  NOW(),
  NOW()
);

-- 4. VERIFICAR RESULTADO FINAL
-- Mostrar todos los planes activos
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