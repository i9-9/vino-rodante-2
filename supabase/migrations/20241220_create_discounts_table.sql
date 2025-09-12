-- Create discounts table
CREATE TABLE IF NOT EXISTS discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  discount_type TEXT NOT NULL DEFAULT 'percentage' CHECK (discount_type IN ('percentage', 'fixed_amount')),
  discount_value DECIMAL(10,2) NOT NULL CHECK (discount_value >= 0),
  min_purchase_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
  max_discount_amount DECIMAL(10,2),
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  usage_limit INTEGER,
  used_count INTEGER DEFAULT 0,
  applies_to TEXT NOT NULL DEFAULT 'all_products' CHECK (applies_to IN ('all_products', 'category', 'specific_products')),
  target_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create discount_days table for day-of-week restrictions
CREATE TABLE IF NOT EXISTS discount_days (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discount_id UUID REFERENCES discounts(id) ON DELETE CASCADE,
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 = Sunday, 1 = Monday, etc.
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create discount_products table for product-specific discounts
-- Note: product_id reference will be added later when products table exists
CREATE TABLE IF NOT EXISTS discount_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discount_id UUID REFERENCES discounts(id) ON DELETE CASCADE,
  product_id UUID NOT NULL, -- Will add foreign key constraint later
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(discount_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_discounts_valid_dates ON discounts(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_discount_days_discount_id ON discount_days(discount_id);
CREATE INDEX IF NOT EXISTS idx_discount_products_discount_id ON discount_products(discount_id);
CREATE INDEX IF NOT EXISTS idx_discount_products_product_id ON discount_products(product_id);

-- Enable RLS
ALTER TABLE discounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_days ENABLE ROW LEVEL SECURITY;
ALTER TABLE discount_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for discounts (public read, admin write)
CREATE POLICY "Discounts are viewable by everyone" ON discounts
  FOR SELECT USING (is_active = true);

-- Note: Admin policies will be added later when customers table exists
-- CREATE POLICY "Only admins can manage discounts" ON discounts
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM customers 
--       WHERE customers.id = auth.uid() 
--       AND customers.is_admin = true
--     )
--   );

-- RLS Policies for discount_days
CREATE POLICY "Discount days are viewable by everyone" ON discount_days
  FOR SELECT USING (true);

-- Note: Admin policies will be added later when customers table exists
-- CREATE POLICY "Only admins can manage discount days" ON discount_days
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM customers 
--       WHERE customers.id = auth.uid() 
--       AND customers.is_admin = true
--     )
--   );

-- RLS Policies for discount_products
CREATE POLICY "Discount products are viewable by everyone" ON discount_products
  FOR SELECT USING (true);

-- Note: Admin policies will be added later when customers table exists
-- CREATE POLICY "Only admins can manage discount products" ON discount_products
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM customers 
--       WHERE customers.id = auth.uid() 
--       AND customers.is_admin = true
--     )
--   );

-- Insert the default midweek discount (Monday to Wednesday, 30% off, min 3 products)
INSERT INTO discounts (name, description, discount_type, discount_value, min_purchase_amount, is_active, start_date, end_date, applies_to, target_value)
VALUES (
  'Descuento de Mitad de Semana',
  '30% de descuento en vinos seleccionados de lunes a miércoles con un mínimo de 3 vinos',
  'percentage',
  30.00,
  0,
  true,
  NOW(),
  NOW() + INTERVAL '1 year',
  'all_products',
  ''
);

-- Add Monday, Tuesday, Wednesday to the discount
INSERT INTO discount_days (discount_id, day_of_week)
SELECT id, day FROM discounts, UNNEST(ARRAY[1, 2, 3]) AS day
WHERE name = 'Descuento de Mitad de Semana';
