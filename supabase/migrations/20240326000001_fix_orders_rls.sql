-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own orders" ON orders;
DROP POLICY IF EXISTS "Users can insert their own orders" ON orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON orders;
DROP POLICY IF EXISTS "Admin can update all orders" ON orders;

-- Enable RLS
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own orders" ON orders
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own orders" ON orders
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can view all orders" ON orders
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admin can update all orders" ON orders
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

-- Drop existing policies for order_items if they exist
DROP POLICY IF EXISTS "Users can view their own order items" ON order_items;
DROP POLICY IF EXISTS "Users can insert their own order items" ON order_items;
DROP POLICY IF EXISTS "Admin can view all order items" ON order_items;
DROP POLICY IF EXISTS "Admin can update all order items" ON order_items;

-- Enable RLS for order_items
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;

-- Create policies for order_items
CREATE POLICY "Users can view their own order items" ON order_items
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own order items" ON order_items
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    )
  );

CREATE POLICY "Admin can view all order items" ON order_items
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE id = auth.uid() AND is_admin = true
    )
  );

CREATE POLICY "Admin can update all order items" ON order_items
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM customers 
      WHERE id = auth.uid() AND is_admin = true
    )
  ); 