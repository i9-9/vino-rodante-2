-- Insertar productos de ejemplo para testing
-- Incluyendo algunos con categoría 'boxes'

-- Productos de vino tinto
INSERT INTO products (name, slug, description, price, image, category, year, region, varietal, stock, featured, is_visible) VALUES
('Malbec Reserve 2018', 'malbec-reserve-2018', 'Un Malbec audaz y robusto con notas de mora, ciruela y un toque de chocolate. Perfecto con carnes a la parrilla.', 45.99, '/images/malbec-reserve.jpg', 'tinto', '2018', 'Mendoza', 'Malbec', 24, true, true),
('Cabernet Sauvignon Gran Reserva 2016', 'cabernet-sauvignon-gran-reserva-2016', 'Cuerpo completo con taninos ricos y sabores complejos de grosella negra, cedro y especias. Añejado en barricas de roble francés.', 65.00, '/images/cabernet-sauvignon.jpg', 'tinto', '2016', 'Valle de Uco', 'Cabernet Sauvignon', 12, true, true),
('Pinot Noir Reserve 2019', 'pinot-noir-reserve-2019', 'Elegante y sedoso con notas de cereza roja, frambuesa y sutiles matices terrosos. Añejado en roble francés.', 52.50, '/images/pinot-noir.jpg', 'tinto', '2019', 'Patagonia', 'Pinot Noir', 15, false, true);

-- Productos de vino blanco
INSERT INTO products (name, slug, description, price, image, category, year, region, varietal, stock, featured, is_visible) VALUES
('Chardonnay Estate 2020', 'chardonnay-estate-2020', 'Elegante y crujiente con acidez equilibrada y notas de manzana verde, pera y un toque de vainilla.', 38.50, '/images/chardonnay.jpg', 'blanco', '2020', 'Valle de Uco', 'Chardonnay', 18, true, true),
('Sauvignon Blanc 2021', 'sauvignon-blanc-2021', 'Crujiente y aromático con vibrantes notas de cítricos, maracuyá y hierba recién cortada. Final refrescante.', 32.00, '/images/sauvignon-blanc.jpg', 'blanco', '2021', 'Valle del Pedernal', 'Sauvignon Blanc', 22, false, true);

-- Productos espumantes
INSERT INTO products (name, slug, description, price, image, category, year, region, varietal, stock, featured, is_visible) VALUES
('Champagne Brut Reserve', 'champagne-brut-reserve', 'Elegante y complejo con finas burbujas y notas de brioche, manzana y cítricos. Perfecto para ocasiones especiales.', 85.00, '/images/champagne.jpg', 'espumante', 'NV', 'Champagne, Francia', 'Chardonnay', 8, true, true);

-- Productos de boxes (estos son los que deberían aparecer en /collections/boxes)
INSERT INTO products (name, slug, description, price, image, category, year, region, varietal, stock, featured, is_visible) VALUES
('Box Premium Tintos', 'box-premium-tintos', 'Caja elegante con 3 vinos tintos premium: Malbec Reserve, Cabernet Sauvignon y Pinot Noir. Incluye guía de cata y maridaje.', 120.00, '/images/box-premium-tintos.jpg', 'boxes', '2023', 'Mendoza', 'Blend', 15, true, true),
('Box Regalo Especial', 'box-regalo-especial', 'Caja de regalo con 2 vinos tintos y 1 espumante. Empaquetado elegante, perfecto para regalar en ocasiones especiales.', 95.00, '/images/box-regalo-especial.jpg', 'boxes', '2023', 'Mendoza', 'Blend', 20, true, true),
('Box Iniciación', 'box-iniciacion', 'Caja perfecta para iniciarse en el mundo del vino. Incluye 1 tinto, 1 blanco y 1 espumante con guía básica de cata.', 75.00, '/images/box-iniciacion.jpg', 'boxes', '2023', 'Mendoza', 'Blend', 25, false, true),
('Box Premium Mixto', 'box-premium-mixto', 'Selección premium con 2 tintos, 1 blanco y 1 espumante. Incluye guía completa de maridaje y cata profesional.', 150.00, '/images/box-premium-mixto.jpg', 'boxes', '2023', 'Mendoza', 'Blend', 10, true, true);

-- Verificar que se insertaron correctamente
SELECT 'Products inserted successfully' as status;
SELECT category, COUNT(*) as count FROM products GROUP BY category ORDER BY count DESC;
