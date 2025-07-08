-- Script para normalizar los valores de la columna 'club' en subscription_plans
-- Dejar todos los valores en minúscula para asegurar coincidencia con la URL y el frontend

UPDATE subscription_plans SET club = 'tinto' WHERE LOWER(club) = 'tinto';
UPDATE subscription_plans SET club = 'blanco' WHERE LOWER(club) = 'blanco';
UPDATE subscription_plans SET club = 'mixto' WHERE LOWER(club) = 'mixto';
UPDATE subscription_plans SET club = 'naranjo' WHERE LOWER(club) = 'naranjo';

-- Opcional: corregir cualquier otro valor inesperado
UPDATE subscription_plans SET club = LOWER(club);

-- Verificar resultado
SELECT id, name, club, is_active, is_visible FROM subscription_plans ORDER BY club, name; 