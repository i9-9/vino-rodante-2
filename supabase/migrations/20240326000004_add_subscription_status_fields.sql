-- Add fields for tracking subscription status changes
ALTER TABLE user_subscriptions
  ADD COLUMN IF NOT EXISTS pause_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS pause_reason TEXT,
  ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
  ADD COLUMN IF NOT EXISTS next_delivery_date TIMESTAMP WITH TIME ZONE,
  ADD COLUMN IF NOT EXISTS frequency TEXT CHECK (frequency IN ('weekly', 'biweekly', 'monthly'));

-- Create subscription status history table
CREATE TABLE IF NOT EXISTS subscription_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  subscription_id UUID NOT NULL REFERENCES user_subscriptions(id) ON DELETE CASCADE,
  old_status TEXT NOT NULL,
  new_status TEXT NOT NULL,
  reason TEXT,
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  changed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add RLS policies for status history
ALTER TABLE subscription_status_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscription history" ON subscription_status_history
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_subscriptions 
      WHERE user_subscriptions.id = subscription_status_history.subscription_id
      AND (
        user_subscriptions.customer_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM customers 
          WHERE id = auth.uid() 
          AND is_admin = true
        )
      )
    )
  );

-- Add trigger to automatically track status changes
CREATE OR REPLACE FUNCTION track_subscription_status_changes()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO subscription_status_history (
      subscription_id,
      old_status,
      new_status,
      reason,
      changed_by
    ) VALUES (
      NEW.id,
      OLD.status,
      NEW.status,
      CASE 
        WHEN NEW.status = 'paused' THEN NEW.pause_reason
        WHEN NEW.status = 'cancelled' THEN NEW.cancellation_reason
        ELSE NULL
      END,
      auth.uid()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER track_subscription_status_changes
  AFTER UPDATE OF status ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION track_subscription_status_changes(); 