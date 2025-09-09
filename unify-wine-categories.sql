-- Comandos SQL para unificar categorías de vino

-- 1. Unificar "Naranjo" a "Naranja" (más común en español)
UPDATE products 
SET category = 'Naranja'
WHERE LOWER(TRIM(category)) = 'naranjo';

-- 2. Verificar el resultado
SELECT 
  category,
  COUNT(*) as product_count
FROM products 
WHERE is_visible = true AND category IS NOT NULL
GROUP BY category
ORDER BY category;

-- 3. Verificar que no hay duplicados
SELECT 
  LOWER(TRIM(category)) as normalized_category,
  COUNT(DISTINCT category) as unique_categories,
  STRING_AGG(DISTINCT category, ', ') as original_categories
FROM products 
WHERE is_visible = true AND category IS NOT NULL
GROUP BY LOWER(TRIM(category))
HAVING COUNT(DISTINCT category) > 1;
