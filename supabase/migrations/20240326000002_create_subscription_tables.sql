-- Create subscription_plans table if it doesn't exist
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price_monthly DECIMAL(10,2),
  price_bimonthly DECIMAL(10,2),
  price_quarterly DECIMAL(10,2),
  club TEXT,
  features JSONB,
  image TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create user_subscriptions table if it doesn't exist
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES subscription_plans(id) ON DELETE CASCADE,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('active', 'paused', 'cancelled', 'expired')),
  is_gift BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add RLS policies
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies for subscription_plans
CREATE POLICY "Enable read access for all users" ON subscription_plans
  FOR SELECT USING (true);

CREATE POLICY "Enable insert for admins only" ON subscription_plans
  FOR INSERT TO authenticated
  USING (EXISTS (
    SELECT 1 FROM customers 
    WHERE id = auth.uid() 
    AND is_admin = true
  ));

CREATE POLICY "Enable update for admins only" ON subscription_plans
  FOR UPDATE TO authenticated
  USING (EXISTS (
    SELECT 1 FROM customers 
    WHERE id = auth.uid() 
    AND is_admin = true
  ));

-- Policies for user_subscriptions
CREATE POLICY "Users can view their own subscriptions" ON user_subscriptions
  FOR SELECT TO authenticated
  USING (
    customer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM customers 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

CREATE POLICY "Users can manage their own subscriptions" ON user_subscriptions
  FOR ALL TO authenticated
  USING (
    customer_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM customers 
      WHERE id = auth.uid() 
      AND is_admin = true
    )
  );

-- Add indexes for better performance
CREATE INDEX idx_subscription_plans_is_active ON subscription_plans(is_active);
CREATE INDEX idx_user_subscriptions_customer_id ON user_subscriptions(customer_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status); 