-- Script para insertar productos de boxes en la base de datos local
-- Ejecutar con: npx supabase db reset && psql -h 127.0.0.1 -p 54322 -U postgres -d postgres -f scripts/insert-boxes-products.sql

-- Primero, asegurarse de que la tabla products existe
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    image TEXT,
    category TEXT NOT NULL,
    year TEXT,
    region TEXT,
    varietal TEXT,
    stock INTEGER DEFAULT 0,
    featured BOOLEAN DEFAULT false,
    is_visible BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertar productos de boxes
INSERT INTO products (name, slug, description, price, image, category, year, region, varietal, stock, featured, is_visible) VALUES
('Box Premium Tintos', 'box-premium-tintos', 'Caja elegante con 3 vinos tintos premium: Malbec Reserve, Cabernet Sauvignon y Pinot Noir. Incluye guía de cata y maridaje.', 120.00, '/images/box-premium-tintos.jpg', 'boxes', '2023', 'Mendoza', 'Blend', 15, true, true),
('Box Regalo Especial', 'box-regalo-especial', 'Caja de regalo con 2 vinos tintos y 1 espumante. Empaquetado elegante, perfecto para regalar en ocasiones especiales.', 95.00, '/images/box-regalo-especial.jpg', 'boxes', '2023', 'Mendoza', 'Blend', 20, true, true),
('Box Iniciación', 'box-iniciacion', 'Caja perfecta para iniciarse en el mundo del vino. Incluye 1 tinto, 1 blanco y 1 espumante con guía básica de cata.', 75.00, '/images/box-iniciacion.jpg', 'boxes', '2023', 'Mendoza', 'Blend', 25, false, true),
('Box Premium Mixto', 'box-premium-mixto', 'Selección premium con 2 tintos, 1 blanco y 1 espumante. Incluye guía completa de maridaje y cata profesional.', 150.00, '/images/box-premium-mixto.jpg', 'boxes', '2023', 'Mendoza', 'Blend', 10, true, true)
ON CONFLICT (slug) DO NOTHING;

-- Insertar también algunos productos individuales para que no esté vacía la base de datos
INSERT INTO products (name, slug, description, price, image, category, year, region, varietal, stock, featured, is_visible) VALUES
('Malbec Reserve 2018', 'malbec-reserve-2018', 'Un Malbec audaz y robusto con notas de mora, ciruela y un toque de chocolate. Perfecto con carnes a la parrilla.', 45.99, '/images/malbec-reserve.jpg', 'tinto', '2018', 'Mendoza', 'Malbec', 24, true, true),
('Chardonnay Estate 2020', 'chardonnay-estate-2020', 'Elegante y crujiente con acidez equilibrada y notas de manzana verde, pera y un toque de vainilla.', 38.50, '/images/chardonnay.jpg', 'blanco', '2020', 'Valle de Uco', 'Chardonnay', 18, true, true)
ON CONFLICT (slug) DO NOTHING;

-- Verificar que se insertaron correctamente
SELECT 'Products inserted successfully' as status;
SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC;
