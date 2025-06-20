-- Migración: Actualizar estructura de subscription_plans para incluir campos faltantes
-- Esta migración agrega los campos que el código está intentando usar

-- 1. Agregar campo club (para identificar el tipo de club: tinto, blanco, mixto, naranjo)
ALTER TABLE subscription_plans 
ADD COLUMN club TEXT;

-- 2. Agregar campo banner_image para imágenes de banner
ALTER TABLE subscription_plans 
ADD COLUMN banner_image TEXT;

-- 3. Agregar campo slug si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'slug') THEN
        ALTER TABLE subscription_plans ADD COLUMN slug TEXT;
    END IF;
END $$;

-- 4. Agregar campo tagline si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'tagline') THEN
        ALTER TABLE subscription_plans ADD COLUMN tagline TEXT;
    END IF;
END $$;

-- 5. Agregar campo features si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'features') THEN
        ALTER TABLE subscription_plans ADD COLUMN features JSONB;
    END IF;
END $$;

-- 6. Agregar campo discount_percentage si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'discount_percentage') THEN
        ALTER TABLE subscription_plans ADD COLUMN discount_percentage DECIMAL(5,2);
    END IF;
END $$;

-- 7. Agregar campo status si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'status') THEN
        ALTER TABLE subscription_plans ADD COLUMN status TEXT DEFAULT 'active';
    END IF;
END $$;

-- 8. Agregar campo display_order si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'display_order') THEN
        ALTER TABLE subscription_plans ADD COLUMN display_order INTEGER;
    END IF;
END $$;

-- 9. Renombrar image_url a image si existe image_url
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'image_url') THEN
        ALTER TABLE subscription_plans RENAME COLUMN image_url TO image;
    END IF;
END $$;

-- 10. Renombrar monthly_price a price_monthly si existe monthly_price
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'monthly_price') THEN
        ALTER TABLE subscription_plans RENAME COLUMN monthly_price TO price_monthly;
    END IF;
END $$;

-- 11. Agregar campo price_quarterly si no existe
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'subscription_plans' AND column_name = 'price_quarterly') THEN
        ALTER TABLE subscription_plans ADD COLUMN price_quarterly DECIMAL(10,2);
    END IF;
END $$;

-- 12. Verificar la estructura final
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'subscription_plans' 
ORDER BY ordinal_position; 