-- Script de verificación: Ejecutar en Supabase SQL Editor
-- Para verificar que los cambios se aplicaron correctamente

-- 1. Verificar que las columnas existen
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
    AND table_name = 'products' 
    AND column_name IN ('free_shipping', 'is_box')
ORDER BY column_name;

-- 2. Ver todos los boxes actuales y sus nuevos campos
SELECT 
    id,
    name,
    category,
    is_box,
    free_shipping,
    is_visible
FROM products
WHERE category = 'Boxes'
ORDER BY name;

-- 3. Contar productos por tipo
SELECT 
    CASE 
        WHEN is_box = true THEN 'Boxes'
        ELSE 'Productos Individuales'
    END as tipo_producto,
    COUNT(*) as cantidad
FROM products
GROUP BY is_box;

