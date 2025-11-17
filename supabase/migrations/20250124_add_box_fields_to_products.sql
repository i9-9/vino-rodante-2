-- Migración para agregar campos de boxes a la tabla products
-- Fecha: 2025-01-24
-- Descripción: Agregar discount_percentage y total_wines para soportar boxes de vinos

-- 1. Agregar columna discount_percentage
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS discount_percentage INTEGER DEFAULT 0 NOT NULL;

-- 2. Agregar columna total_wines
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS total_wines INTEGER DEFAULT 3 NOT NULL;

-- 3. Comentarios para documentar los campos
COMMENT ON COLUMN products.discount_percentage IS 'Porcentaje de descuento aplicado al box (0-100)';
COMMENT ON COLUMN products.total_wines IS 'Cantidad de vinos incluidos en el box';

-- 4. Actualizar boxes existentes con valores por defecto si es necesario
UPDATE products 
SET discount_percentage = 0 
WHERE category = 'Boxes' AND discount_percentage IS NULL;

UPDATE products 
SET total_wines = 3 
WHERE category = 'Boxes' AND total_wines IS NULL;

