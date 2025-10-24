-- 🧪 Script de Prueba: Verificar Creación de Boxes
-- Ejecutar DESPUÉS de crear un box desde el dashboard

-- 1. Ver todos los boxes con sus campos nuevos
SELECT 
    id,
    name,
    category,
    is_box,
    free_shipping,
    price,
    stock,
    is_visible,
    created_at
FROM products
WHERE category = 'Boxes'
ORDER BY created_at DESC
LIMIT 5;

-- 2. Ver las relaciones box-vinos (lo MÁS IMPORTANTE)
-- Si esto devuelve filas, ¡LOS BOXES FUNCIONAN CORRECTAMENTE! 🎉
SELECT 
    p.name as "Box",
    wine.name as "Vino Incluido",
    bpr.quantity as "Cantidad",
    wine.price as "Precio Vino",
    wine.varietal as "Varietal",
    wine.year as "Año"
FROM products p
JOIN box_product_relations bpr ON p.id = bpr.box_id
JOIN products wine ON bpr.product_id = wine.id
WHERE p.category = 'Boxes'
ORDER BY p.created_at DESC, wine.name;

-- 3. Contar cuántos vinos tiene cada box
SELECT 
    p.name as "Box",
    COUNT(bpr.product_id) as "Total Vinos",
    SUM(bpr.quantity) as "Botellas Totales",
    p.created_at as "Fecha Creación"
FROM products p
LEFT JOIN box_product_relations bpr ON p.id = bpr.box_id
WHERE p.category = 'Boxes'
GROUP BY p.id, p.name, p.created_at
ORDER BY p.created_at DESC;

-- 4. Verificar integridad: Boxes sin relaciones (no debería haber ninguno)
-- ⚠️ Si este query devuelve filas, hay boxes sin vinos (PROBLEMA)
SELECT 
    p.id,
    p.name as "Box sin Vinos",
    p.created_at
FROM products p
LEFT JOIN box_product_relations bpr ON p.id = bpr.box_id
WHERE p.category = 'Boxes' 
AND bpr.id IS NULL
ORDER BY p.created_at DESC;

-- 5. Calcular precio real del box vs precio de vinos
SELECT 
    p.name as "Box",
    p.price as "Precio Box",
    SUM(wine.price * bpr.quantity) as "Precio Total Vinos",
    p.price - SUM(wine.price * bpr.quantity) as "Ahorro",
    ROUND(((SUM(wine.price * bpr.quantity) - p.price) / SUM(wine.price * bpr.quantity) * 100), 2) as "% Descuento"
FROM products p
JOIN box_product_relations bpr ON p.id = bpr.box_id
JOIN products wine ON bpr.product_id = wine.id
WHERE p.category = 'Boxes'
GROUP BY p.id, p.name, p.price
ORDER BY p.created_at DESC;

