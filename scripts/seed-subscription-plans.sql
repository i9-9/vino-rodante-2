-- Insertar los 4 clubes iniciales
INSERT INTO subscription_plans 
  (name, slug, description, club, type, tagline, features, price_weekly, price_biweekly, price_monthly, wines_per_delivery, is_active, is_visible, display_order)
VALUES
  (
    'Club Tinto', 
    'club-tinto',
    'Descubre los mejores vinos tintos de Argentina',
    'Tinto',
    'tinto',
    'Para los amantes del vino tinto',
    '["Vinos tintos seleccionados", "Notas de cata", "Maridajes recomendados"]',
    9900, -- $99 semanal
    18900, -- $189 quincenal
    35900, -- $359 mensual
    2,
    true,
    true,
    1
  ),
  (
    'Club Blanco',
    'club-blanco',
    'Los vinos blancos más frescos y elegantes',
    'Blanco',
    'blanco',
    'Frescura y elegancia en cada botella',
    '["Vinos blancos seleccionados", "Notas de cata", "Maridajes recomendados"]',
    8900, -- $89 semanal
    16900, -- $169 quincenal
    31900, -- $319 mensual
    2,
    true,
    true,
    2
  ),
  (
    'Club Mixto',
    'club-mixto',
    'La mejor selección de vinos tintos y blancos',
    'Mixto',
    'mixto',
    'Lo mejor de ambos mundos',
    '["Combinación de tintos y blancos", "Notas de cata", "Maridajes recomendados"]',
    10900, -- $109 semanal
    20900, -- $209 quincenal
    39900, -- $399 mensual
    2,
    true,
    true,
    3
  ),
  (
    'Club Premium',
    'club-premium',
    'Los vinos más exclusivos y premiados',
    'Premium',
    'premium',
    'La excelencia en cada botella',
    '["Vinos premium seleccionados", "Notas de cata detalladas", "Maridajes gourmet", "Acceso a catas virtuales"]',
    19900, -- $199 semanal
    38900, -- $389 quincenal
    74900, -- $749 mensual
    1,
    true,
    true,
    4
  ); 