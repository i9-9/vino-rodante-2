-- Migración para corregir errores críticos en la tabla products
-- Fecha: 2025-01-24
-- Descripción: Agregar campos faltantes que se usan en el código pero no existen en la BD

-- 1. Agregar columna free_shipping
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS free_shipping BOOLEAN DEFAULT false NOT NULL;

-- 2. Agregar columna is_box
ALTER TABLE products 
ADD COLUMN IF NOT EXISTS is_box BOOLEAN DEFAULT false NOT NULL;

-- 3. Comentarios para documentar los campos
COMMENT ON COLUMN products.free_shipping IS 'Indica si el producto tiene envío gratuito';
COMMENT ON COLUMN products.is_box IS 'Indica si el producto es un box/paquete de múltiples vinos';

-- 4. Crear índice para mejorar queries que filtran por is_box
CREATE INDEX IF NOT EXISTS idx_products_is_box ON products(is_box);

-- 5. Actualizar productos existentes que son boxes (categoría 'Boxes')
UPDATE products 
SET is_box = true 
WHERE category = 'Boxes' AND is_box = false;

-- 6. Verificar la actualización
DO $$
DECLARE
    box_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO box_count FROM products WHERE category = 'Boxes';
    RAISE NOTICE 'Se encontraron % productos con categoría Boxes', box_count;
    
    SELECT COUNT(*) INTO box_count FROM products WHERE is_box = true;
    RAISE NOTICE 'Se actualizaron % productos con is_box = true', box_count;
END $$;

