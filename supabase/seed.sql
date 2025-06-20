-- Insert admin role for your user
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users
INSERT INTO public.user_roles (user_id, role)
VALUES ('d0c5c8f8-3a3a-4b7a-9b0a-0b0b0b0b0b0b', 'admin')
ON CONFLICT (user_id) DO UPDATE
SET role = 'admin'; 