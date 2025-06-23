-- Drop the unused user_roles table and its trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TABLE IF EXISTS public.user_roles;

-- Make sure customers table has is_admin column
ALTER TABLE customers ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- Create policy for customers table
CREATE POLICY "Users can view their own profile" ON customers
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Admin can view all profiles" ON customers
  FOR SELECT 
  USING (EXISTS (
    SELECT 1 FROM customers 
    WHERE id = auth.uid() AND is_admin = true
  ));

CREATE POLICY "Admin can update all profiles" ON customers
  FOR UPDATE 
  USING (EXISTS (
    SELECT 1 FROM customers 
    WHERE id = auth.uid() AND is_admin = true
  ));

-- Create trigger to create customer profile on user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.customers (id, email, name)
  VALUES (new.id, new.email, new.raw_user_meta_data->>'full_name');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user(); 