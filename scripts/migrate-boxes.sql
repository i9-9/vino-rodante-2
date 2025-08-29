-- Script de migración para convertir productos de boxes existentes a la estructura correcta
-- Este script debe ejecutarse en tu base de datos Supabase

-- 1. Ver qué productos de boxes existen actualmente
SELECT 
    id,
    name,
    description,
    price,
    stock,
    category,
    is_visible,
    created_at
FROM products 
WHERE category = 'boxes';

-- 2. Crear la tabla box_product_relations si no existe
CREATE TABLE IF NOT EXISTS box_product_relations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    box_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Asegurar que no haya duplicados de box-producto
    UNIQUE(box_id, product_id)
);

-- 3. Crear índices si no existen
CREATE INDEX IF NOT EXISTS idx_box_product_relations_box_id ON box_product_relations(box_id);
CREATE INDEX IF NOT EXISTS idx_box_product_relations_product_id ON box_product_relations(product_id);

-- 4. Habilitar RLS en la tabla
ALTER TABLE box_product_relations ENABLE ROW LEVEL SECURITY;

-- 5. Crear policies de RLS si no existen
DO $$
BEGIN
    -- Policy para que solo admins puedan ver todas las relaciones
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'box_product_relations' 
        AND policyname = 'Admins can view all box product relations'
    ) THEN
        CREATE POLICY "Admins can view all box product relations" ON box_product_relations
            FOR SELECT USING (
                EXISTS (
                    SELECT 1 FROM customers 
                    WHERE customers.id = auth.uid() 
                    AND customers.is_admin = true
                )
            );
    END IF;

    -- Policy para que solo admins puedan insertar relaciones
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'box_product_relations' 
        AND policyname = 'Admins can insert box product relations'
    ) THEN
        CREATE POLICY "Admins can insert box product relations" ON box_product_relations
            FOR INSERT WITH CHECK (
                EXISTS (
                    SELECT 1 FROM customers 
                    WHERE customers.id = auth.uid() 
                    AND customers.is_admin = true
                )
            );
    END IF;

    -- Policy para que solo admins puedan actualizar relaciones
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'box_product_relations' 
        AND policyname = 'Admins can update box product relations'
    ) THEN
        CREATE POLICY "Admins can update box product relations" ON box_product_relations
            FOR UPDATE USING (
                EXISTS (
                    SELECT 1 FROM customers 
                    WHERE customers.id = auth.uid() 
                    AND customers.is_admin = true
                )
            );
    END IF;

    -- Policy para que solo admins puedan eliminar relaciones
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'box_product_relations' 
        AND policyname = 'Admins can delete box product relations'
    ) THEN
        CREATE POLICY "Admins can delete box product relations" ON box_product_relations
            FOR DELETE USING (
                EXISTS (
                    SELECT 1 FROM customers 
                    WHERE customers.id = auth.uid() 
                    AND customers.is_admin = true
                )
            );
    END IF;
END $$;

-- 6. Crear las funciones SQL si no existen
CREATE OR REPLACE FUNCTION calculate_box_total_price(box_id_param UUID)
RETURNS NUMERIC AS $$
DECLARE
    total_price NUMERIC := 0;
BEGIN
    SELECT COALESCE(SUM(bpr.quantity * p.price), 0)
    INTO total_price
    FROM box_product_relations bpr
    JOIN products p ON bpr.product_id = p.id
    WHERE bpr.box_id = box_id_param;
    
    RETURN total_price;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_box_products(box_id_param UUID)
RETURNS TABLE (
    product_id UUID,
    product_name TEXT,
    product_price NUMERIC,
    quantity INTEGER,
    varietal TEXT,
    year TEXT,
    region TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.price,
        bpr.quantity,
        p.varietal,
        p.year,
        p.region
    FROM box_product_relations bpr
    JOIN products p ON bpr.product_id = p.id
    WHERE bpr.box_id = box_id_param
    ORDER BY p.name;
END;
$$ LANGUAGE plpgsql;

-- 7. Ejemplo de cómo migrar un box existente (debes adaptar esto según tus datos)
-- Supongamos que tienes un box llamado "Box Malbec Premium" con ID específico
-- y quieres agregarle algunos vinos Malbec existentes

-- Primero, ver qué vinos Malbec tienes disponibles:
SELECT 
    id,
    name,
    price,
    varietal,
    year,
    region
FROM products 
WHERE varietal ILIKE '%malbec%' 
AND category != 'boxes' 
AND is_visible = true
LIMIT 3;

-- Luego, crear las relaciones (ejemplo - adapta los IDs según tus datos):
-- INSERT INTO box_product_relations (box_id, product_id, quantity) VALUES
-- ('BOX_ID_AQUI', 'VINO_1_ID', 1),
-- ('BOX_ID_AQUI', 'VINO_2_ID', 1),
-- ('BOX_ID_AQUI', 'VINO_3_ID', 1);

-- 8. Verificar que la migración funcionó
-- SELECT 
--     b.name as box_name,
--     p.name as product_name,
--     bpr.quantity,
--     p.price
-- FROM box_product_relations bpr
-- JOIN products b ON bpr.box_id = b.id
-- JOIN products p ON bpr.product_id = p.id
-- WHERE b.category = 'boxes';
