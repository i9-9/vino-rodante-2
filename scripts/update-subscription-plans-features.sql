-- Actualizar features para los planes existentes
UPDATE subscription_plans
SET 
  features = '["Vinos tintos seleccionados", "Notas de cata", "Maridajes recomendados"]'::jsonb,
  display_order = 1,
  is_active = true,
  is_visible = true
WHERE type = 'tinto';

UPDATE subscription_plans
SET 
  features = '["Vinos blancos seleccionados", "Notas de cata", "Maridajes recomendados"]'::jsonb,
  display_order = 2,
  is_active = true,
  is_visible = true
WHERE type = 'blanco';

UPDATE subscription_plans
SET 
  features = '["Combinación de tintos y blancos", "Notas de cata", "Maridajes recomendados"]'::jsonb,
  display_order = 3,
  is_active = true,
  is_visible = true
WHERE type = 'mixto';

UPDATE subscription_plans
SET 
  features = '["Vinos naranjos seleccionados", "Notas de cata detalladas", "Maridajes gourmet", "Acceso a catas virtuales"]'::jsonb,
  display_order = 4,
  is_active = true,
  is_visible = true
WHERE type = 'naranjo'; 