-- Migración: Cambiar price_yearly por price_bimonthly en subscription_plans
-- Esto cambia la estructura para reflejar que ahora las opciones son:
-- cada mes, cada dos meses, cada tres meses

-- 1. Agregar la nueva columna price_bimonthly
ALTER TABLE subscription_plans 
ADD COLUMN price_bimonthly DECIMAL(10,2);

-- 2. Copiar los datos de price_yearly a price_bimonthly
UPDATE subscription_plans 
SET price_bimonthly = price_yearly;

-- 3. Eliminar la columna price_yearly
ALTER TABLE subscription_plans 
DROP COLUMN price_yearly;

-- 4. Actualizar comentarios de las columnas para claridad
COMMENT ON COLUMN subscription_plans.price_monthly IS 'Precio para suscripción cada mes';
COMMENT ON COLUMN subscription_plans.price_bimonthly IS 'Precio para suscripción cada dos meses';
COMMENT ON COLUMN subscription_plans.price_quarterly IS 'Precio para suscripción cada tres meses';

-- Verificar la estructura actualizada
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'subscription_plans' 
AND column_name LIKE 'price_%'
ORDER BY column_name; 