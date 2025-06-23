-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist (in reverse order of dependencies)
DROP TABLE IF EXISTS user_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS addresses CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
DROP TABLE IF EXISTS products CASCADE;

-- Create base tables
\i scripts/create-tables.sql

-- Create subscription tables
\i supabase/migrations/20240326000000_create_user_roles.sql
\i supabase/migrations/20240326000001_fix_orders_rls.sql
\i supabase/migrations/20240326000002_create_subscription_tables.sql
\i supabase/migrations/20240326000003_fix_admin_roles.sql
\i supabase/migrations/20240326000004_add_subscription_status_fields.sql
\i supabase/migrations/20240326000005_add_missing_subscription_fields.sql
\i supabase/migrations/20240326000006_create_subscription_view.sql 