-- Create discounts table
CREATE TABLE IF NOT EXISTS discounts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  percentage DECIMAL(5,2) NOT NULL CHECK (percentage >= 0 AND percentage <= 100),
  min_products INTEGER NOT NULL DEFAULT 1,
  max_products INTEGER,
  is_active BOOLEAN DEFAULT true,
  valid_from TIMESTAMPTZ DEFAULT NOW(),
  valid_until TIMESTAMPTZ,
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
CREATE TABLE IF NOT EXISTS discount_products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  discount_id UUID REFERENCES discounts(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(discount_id, product_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_discounts_active ON discounts(is_active);
CREATE INDEX IF NOT EXISTS idx_discounts_valid_dates ON discounts(valid_from, valid_until);
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

CREATE POLICY "Only admins can manage discounts" ON discounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = auth.uid() 
      AND customers.is_admin = true
    )
  );

-- RLS Policies for discount_days
CREATE POLICY "Discount days are viewable by everyone" ON discount_days
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage discount days" ON discount_days
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = auth.uid() 
      AND customers.is_admin = true
    )
  );

-- RLS Policies for discount_products
CREATE POLICY "Discount products are viewable by everyone" ON discount_products
  FOR SELECT USING (true);

CREATE POLICY "Only admins can manage discount products" ON discount_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE customers.id = auth.uid() 
      AND customers.is_admin = true
    )
  );

-- Insert the default midweek discount (Monday to Wednesday, 30% off, min 3 products)
INSERT INTO discounts (name, description, percentage, min_products, is_active, valid_from)
VALUES (
  'Descuento de Mitad de Semana',
  '30% de descuento en vinos seleccionados de lunes a miércoles con un mínimo de 3 vinos',
  30.00,
  3,
  true,
  NOW()
);

-- Add Monday, Tuesday, Wednesday to the discount
INSERT INTO discount_days (discount_id, day_of_week)
SELECT id, day FROM discounts, UNNEST(ARRAY[1, 2, 3]) AS day
WHERE name = 'Descuento de Mitad de Semana';
