-- Crear tabla para manejar la relación entre boxes y productos
CREATE TABLE IF NOT EXISTS box_product_relations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    box_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Asegurar que no haya duplicados de box-producto
    UNIQUE(box_id, product_id)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_box_product_relations_box_id ON box_product_relations(box_id);
CREATE INDEX IF NOT EXISTS idx_box_product_relations_product_id ON box_product_relations(product_id);

-- Agregar comentarios a la tabla
COMMENT ON TABLE box_product_relations IS 'Tabla de relación entre boxes de vinos y los productos individuales que contienen';
COMMENT ON COLUMN box_product_relations.box_id IS 'ID del box (producto con categoría Boxes)';
COMMENT ON COLUMN box_product_relations.product_id IS 'ID del producto individual dentro del box';
COMMENT ON COLUMN box_product_relations.quantity IS 'Cantidad de este producto en el box';

-- Crear RLS policies para seguridad
ALTER TABLE box_product_relations ENABLE ROW LEVEL SECURITY;

-- Policy para que solo admins puedan ver todas las relaciones
CREATE POLICY "Admins can view all box product relations" ON box_product_relations
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM customers 
            WHERE customers.id = auth.uid() 
            AND customers.is_admin = true
        )
    );

-- Policy para que solo admins puedan insertar relaciones
CREATE POLICY "Admins can insert box product relations" ON box_product_relations
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM customers 
            WHERE customers.id = auth.uid() 
            AND customers.is_admin = true
        )
    );

-- Policy para que solo admins puedan actualizar relaciones
CREATE POLICY "Admins can update box product relations" ON box_product_relations
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM customers 
            WHERE customers.id = auth.uid() 
            AND customers.is_admin = true
        )
    );

-- Policy para que solo admins puedan eliminar relaciones
CREATE POLICY "Admins can delete box product relations" ON box_product_relations
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM customers 
            WHERE customers.id = auth.uid() 
            AND customers.is_admin = true
        )
    );

-- Función para calcular el precio total de un box basado en sus productos
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

-- Función para obtener los productos de un box
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


