-- Add missing fields to subscription_plans
ALTER TABLE subscription_plans
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS tagline TEXT,
  ADD COLUMN IF NOT EXISTS banner_image TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT CHECK (type IN ('tinto', 'blanco', 'mixto', 'premium')),
  ADD COLUMN IF NOT EXISTS price_weekly INTEGER, -- en centavos
  ADD COLUMN IF NOT EXISTS price_biweekly INTEGER, -- en centavos
  ADD COLUMN IF NOT EXISTS wines_per_delivery INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_visible BOOLEAN DEFAULT true;

-- Add missing fields to user_subscriptions
ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS mercadopago_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS payment_method_id TEXT,
  ADD COLUMN IF NOT EXISTS total_paid DECIMAL(10,2) DEFAULT 0;

-- Rename customer_id to user_id for consistency
ALTER TABLE user_subscriptions 
  RENAME COLUMN customer_id TO user_id;

-- Update RLS policies to use new column name
DROP POLICY IF EXISTS "Users can view their own subscriptions" ON user_subscriptions;
DROP POLICY IF EXISTS "Users can manage their own subscriptions" ON user_subscriptions;

CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM customers 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

CREATE POLICY "Users can manage their own subscriptions" ON user_subscriptions
  FOR ALL TO authenticated
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM customers 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Add constraints and indexes
ALTER TABLE subscription_plans
  ALTER COLUMN slug SET NOT NULL,
  ALTER COLUMN type SET NOT NULL,
  ADD CONSTRAINT unique_plan_slug UNIQUE (slug);

CREATE INDEX idx_subscription_plans_type ON subscription_plans(type);
CREATE INDEX idx_subscription_plans_slug ON subscription_plans(slug); 