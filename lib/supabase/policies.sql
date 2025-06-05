-- Políticas de Supabase para permitir acceso público a productos

-- 1. Habilitar RLS en la tabla products (si no está habilitado)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 2. Política para permitir SELECT público en productos visibles
CREATE POLICY "Public products are viewable by everyone" 
ON products FOR SELECT 
USING (is_visible = true);

-- 3. Política para permitir acceso completo a usuarios autenticados
CREATE POLICY "Authenticated users can view all products" 
ON products FOR SELECT 
TO authenticated 
USING (true);

-- 4. Política para que solo usuarios autenticados puedan modificar
CREATE POLICY "Only authenticated users can insert products" 
ON products FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Only authenticated users can update products" 
ON products FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Only authenticated users can delete products" 
ON products FOR DELETE 
TO authenticated 
USING (true);

-- 5. Para otras tablas relacionadas que también podrían necesitar acceso público
-- (ajusta según tus necesidades)

-- Si tienes una tabla de categorías, regiones, etc. que también necesita ser pública:
-- ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Categories are viewable by everyone" ON categories FOR SELECT USING (true);

-- Para orders, solo el propietario puede ver sus órdenes
-- ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid() = user_id);
-- CREATE POLICY "Users can insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = user_id); 