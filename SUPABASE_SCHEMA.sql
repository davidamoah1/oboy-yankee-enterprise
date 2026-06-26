-- Nexa SME OS Ghana - Master Production Schema
-- Designed for enterprise-grade African SME operations, full tenant isolation, and multi-branch systems.
-- Idempotent deployment script

BEGIN;

-- 1. CLEAN RESET (Drops existing objects to guarantee clean schema execution)
DO $$ 
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
        EXECUTE 'DROP TABLE IF EXISTS public.' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Drop existing custom types
DROP TYPE IF EXISTS public.user_role CASCADE;
DROP TYPE IF EXISTS public.tenant_status CASCADE;
DROP TYPE IF EXISTS public.subscription_status CASCADE;
DROP TYPE IF EXISTS public.payment_method CASCADE;
DROP TYPE IF EXISTS public.transaction_status CASCADE;

-- 2. TYPE ENUM DEFINITIONS
CREATE TYPE public.user_role AS ENUM (
    'super_admin', 'tenant_owner', 'manager', 'accountant', 'cashier', 'staff', 'auditor', 'read_only'
);

CREATE TYPE public.tenant_status AS ENUM (
    'active', 'suspended', 'trialing', 'past_due', 'trial_expired', 'pending_payment'
);

CREATE TYPE public.subscription_status AS ENUM (
    'pending', 'active', 'failed', 'expired', 'cancelled', 'past_due'
);

CREATE TYPE public.payment_method AS ENUM (
    'cash', 'card', 'momo', 'bank_transfer', 'debt', 'other'
);

CREATE TYPE public.transaction_status AS ENUM (
    'pending', 'completed', 'voided', 'refunded', 'on_hold'
);


-- 3. PLAN & TENANT STRUCTURES
CREATE TABLE public.subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    monthly_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    yearly_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    currency TEXT DEFAULT 'GHS',
    features JSONB DEFAULT '[]'::jsonb,
    limits JSONB DEFAULT '{}'::jsonb,
    is_active BOOLEAN DEFAULT TRUE,
    is_popular BOOLEAN DEFAULT FALSE,
    trial_days INTEGER DEFAULT 14,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    logo_url TEXT,
    status tenant_status DEFAULT 'pending_payment',
    plan_id UUID REFERENCES public.subscription_plans(id) ON DELETE SET NULL,
    paystack_customer_code TEXT,
    subscription_id TEXT,
    contact_phone TEXT,
    business_type TEXT, -- Added for specialized adaptive SME workflows (e.g. Pharmacy, Restaurant, Provision Shop, etc.)
    settings JSONB DEFAULT '{"onboarded": false}'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

CREATE TABLE public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE SET NULL,
    full_name TEXT,
    role user_role DEFAULT 'staff',
    phone TEXT,
    avatar_url TEXT,
    department TEXT DEFAULT 'General',
    shift TEXT DEFAULT 'Morning',
    is_active BOOLEAN DEFAULT TRUE,
    settings JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);


-- 4. BUSINESS CORE CATALOGS
CREATE TABLE public.categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    category TEXT,
    name TEXT NOT NULL,
    description TEXT,
    sku TEXT,
    barcode TEXT,
    price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    cost_price DECIMAL(12,2) DEFAULT 0.00,
    stock_quantity INTEGER NOT NULL DEFAULT 0,
    low_stock_threshold INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);


-- 5. CRM & SUPPLIERS
CREATE TABLE public.customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    points INTEGER DEFAULT 0,
    tier TEXT DEFAULT 'Standard',
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.suppliers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    contact_person TEXT,
    email TEXT,
    phone TEXT,
    address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 6. SALES TRANSACTIONS & STOCK MOVEMENT
CREATE TABLE public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    tax_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    payment_method public.payment_method DEFAULT 'cash',
    status public.transaction_status DEFAULT 'completed',
    idb_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.transaction_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    transaction_id UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1,
    unit_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    total_price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 7. AFRICAN MOBILE MONEY INTEGRATION
CREATE TABLE public.momo_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    transaction_id UUID REFERENCES public.transactions(id) ON DELETE SET NULL,
    provider TEXT NOT NULL, -- 'mtn', 'telecel', 'airteltigo'
    phone_number TEXT NOT NULL,
    subscriber_name TEXT,
    amount DECIMAL(12,2) NOT NULL,
    reference TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'success', 'failed'
    reconciled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);


-- 8. BUSINESS MANAGEMENT (EXPENSES, PAYROLL & COMMUNICATIONS)
CREATE TABLE public.expenses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    description TEXT,
    expense_date DATE DEFAULT CURRENT_DATE,
    created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.payroll (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    base_salary DECIMAL(12,2) NOT NULL,
    bonuses DECIMAL(12,2) DEFAULT 0.00,
    deductions DECIMAL(12,2) DEFAULT 0.00,
    net_salary DECIMAL(12,2) NOT NULL,
    pay_period TEXT NOT NULL, -- 'YYYY-MM' format (e.g., '2026-05')
    status TEXT DEFAULT 'unpaid', -- 'unpaid', 'paid'
    payment_date TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.whatsapp_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    recipient_phone TEXT NOT NULL,
    message_type TEXT NOT NULL, -- 'receipt', 'alert', 'reminder', 'report'
    message_body TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'queued', -- 'queued', 'sent', 'failed'
    retries INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number TEXT NOT NULL,
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    billing_email TEXT,
    phone TEXT,
    address TEXT,
    issue_date DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date DATE NOT NULL,
    amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'Pending', -- 'Pending', 'Paid', 'Overdue', 'Cancelled'
    invoice_type TEXT NOT NULL DEFAULT 'Product', -- 'Service', 'Product', 'Milestone', 'Retainer'
    line_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    payment_history JSONB NOT NULL DEFAULT '[]'::jsonb,
    related_transactions JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 9. ENTERPRISE COMPLIANCE & PLATFORM LEDGER
CREATE TABLE public.attendance_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    full_name TEXT,
    status TEXT NOT NULL DEFAULT 'clock_in', -- 'clock_in', 'clock_out'
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    action TEXT NOT NULL, -- e.g., 'VOID_SALE', 'DELETE_PRODUCT', 'CSV_IMPORT'
    details TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.subscription_payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    currency TEXT DEFAULT 'GHS',
    status TEXT DEFAULT 'success',
    paystack_reference TEXT UNIQUE,
    paystack_metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.subscription_plans(id),
    status subscription_status DEFAULT 'active',
    billing_cycle TEXT,
    amount DECIMAL(12,2),
    currency TEXT DEFAULT 'GHS',
    current_period_start TIMESTAMPTZ DEFAULT NOW(),
    current_period_end TIMESTAMPTZ NOT NULL,
    paystack_subscription_code TEXT,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 10. AUTH PROFILE CREATION TRIGGER
CREATE OR REPLACE FUNCTION public.handle_new_auth_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, tenant_id, full_name, role, phone, department, shift)
  VALUES (
    NEW.id, 
    (NEW.raw_user_meta_data->>'tenant_id')::UUID, 
    NEW.raw_user_meta_data->>'full_name',
    COALESCE((NEW.raw_user_meta_data->>'role')::public.user_role, 'staff'::public.user_role),
    NEW.raw_user_meta_data->>'phone',
    COALESCE(NEW.raw_user_meta_data->>'department', 'General'),
    COALESCE(NEW.raw_user_meta_data->>'shift', 'Morning')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_auth_user();


-- 11. SECURITY & TENANT CONTEXT UTILITIES
CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'super_admin' 
    AND deleted_at IS NULL 
    AND is_active = true
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.get_auth_tenant()
RETURNS UUID AS $$
  SELECT tenant_id FROM public.profiles WHERE id = auth.uid() AND deleted_at IS NULL AND is_active = true;
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.tenant_has_active_subscription(t_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.subscriptions 
    WHERE tenant_id = t_id 
    AND status = 'active'
    AND current_period_end > NOW()
  );
$$ LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public;


-- 12. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaction_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.momo_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Plan policies
DROP POLICY IF EXISTS "Select plans" ON public.subscription_plans;
CREATE POLICY "Select plans" ON public.subscription_plans FOR SELECT USING (is_active OR public.is_super_admin());
DROP POLICY IF EXISTS "Manage plans" ON public.subscription_plans;
CREATE POLICY "Manage plans" ON public.subscription_plans FOR ALL USING (public.is_super_admin());

-- Tenant policies
DROP POLICY IF EXISTS "Select own tenant" ON public.tenants;
CREATE POLICY "Select own tenant" ON public.tenants FOR SELECT USING (id = public.get_auth_tenant() OR public.is_super_admin());
DROP POLICY IF EXISTS "Update own tenant" ON public.tenants;
CREATE POLICY "Update own tenant" ON public.tenants FOR UPDATE USING (id = public.get_auth_tenant() OR public.is_super_admin());
DROP POLICY IF EXISTS "Public join" ON public.tenants;
CREATE POLICY "Public join" ON public.tenants FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Super admin manages tenants" ON public.tenants;
CREATE POLICY "Super admin manages tenants" ON public.tenants FOR ALL USING (public.is_super_admin());

-- User profiles policies
DROP POLICY IF EXISTS "Select tenant profiles" ON public.profiles;
CREATE POLICY "Select tenant profiles" ON public.profiles FOR SELECT USING (tenant_id = public.get_auth_tenant() OR public.is_super_admin());
DROP POLICY IF EXISTS "Update own profile" ON public.profiles;
CREATE POLICY "Update own profile" ON public.profiles FOR UPDATE USING (id = auth.uid() OR public.is_super_admin());

-- Catalog policies
DROP POLICY IF EXISTS "Manage own categories" ON public.categories;
CREATE POLICY "Manage own categories" ON public.categories FOR ALL USING (tenant_id = public.get_auth_tenant() OR public.is_super_admin());
DROP POLICY IF EXISTS "Manage own products" ON public.products;
CREATE POLICY "Manage own products" ON public.products FOR ALL USING (tenant_id = public.get_auth_tenant() OR public.is_super_admin());

-- Expense & CRM policies
DROP POLICY IF EXISTS "Select own customers" ON public.customers;
CREATE POLICY "Select own customers" ON public.customers FOR SELECT USING (tenant_id = public.get_auth_tenant() OR public.is_super_admin());
DROP POLICY IF EXISTS "Write own customers" ON public.customers;
CREATE POLICY "Write own customers" ON public.customers FOR ALL TO authenticated 
  USING (tenant_id = public.get_auth_tenant() AND (public.tenant_has_active_subscription(tenant_id) OR public.is_super_admin()))
  WITH CHECK (tenant_id = public.get_auth_tenant() AND (public.tenant_has_active_subscription(tenant_id) OR public.is_super_admin()));

DROP POLICY IF EXISTS "Select own suppliers" ON public.suppliers;
CREATE POLICY "Select own suppliers" ON public.suppliers FOR SELECT USING (tenant_id = public.get_auth_tenant() OR public.is_super_admin());
DROP POLICY IF EXISTS "Write own suppliers" ON public.suppliers;
CREATE POLICY "Write own suppliers" ON public.suppliers FOR ALL TO authenticated 
  USING (tenant_id = public.get_auth_tenant() AND (public.tenant_has_active_subscription(tenant_id) OR public.is_super_admin()))
  WITH CHECK (tenant_id = public.get_auth_tenant() AND (public.tenant_has_active_subscription(tenant_id) OR public.is_super_admin()));

DROP POLICY IF EXISTS "Select own invoices" ON public.invoices;
CREATE POLICY "Select own invoices" ON public.invoices FOR SELECT USING (tenant_id = public.get_auth_tenant() OR public.is_super_admin());
DROP POLICY IF EXISTS "Write own invoices" ON public.invoices;
CREATE POLICY "Write own invoices" ON public.invoices FOR ALL TO authenticated 
  USING (tenant_id = public.get_auth_tenant() AND (public.tenant_has_active_subscription(tenant_id) OR public.is_super_admin()))
  WITH CHECK (tenant_id = public.get_auth_tenant() AND (public.tenant_has_active_subscription(tenant_id) OR public.is_super_admin()));

DROP POLICY IF EXISTS "Manage own expenses" ON public.expenses;
CREATE POLICY "Manage own expenses" ON public.expenses FOR ALL USING (tenant_id = public.get_auth_tenant() OR public.is_super_admin());
DROP POLICY IF EXISTS "Manage own payroll" ON public.payroll;
CREATE POLICY "Manage own payroll" ON public.payroll FOR ALL USING (tenant_id = public.get_auth_tenant() OR public.is_super_admin());

-- Operations & logging policies
DROP POLICY IF EXISTS "Manage own transactions" ON public.transactions;
CREATE POLICY "Manage own transactions" ON public.transactions FOR ALL USING (tenant_id = public.get_auth_tenant() OR public.is_super_admin());
DROP POLICY IF EXISTS "Manage own transaction items" ON public.transaction_items;
CREATE POLICY "Manage own transaction items" ON public.transaction_items FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.transactions t 
    WHERE t.id = transaction_id AND (t.tenant_id = public.get_auth_tenant() OR public.is_super_admin())
  )
);
DROP POLICY IF EXISTS "Manage own MoMo transactions" ON public.momo_transactions;
CREATE POLICY "Manage own MoMo transactions" ON public.momo_transactions FOR ALL USING (tenant_id = public.get_auth_tenant() OR public.is_super_admin());
DROP POLICY IF EXISTS "Manage own WhatsApp logs" ON public.whatsapp_logs;
CREATE POLICY "Manage own WhatsApp logs" ON public.whatsapp_logs FOR ALL USING (tenant_id = public.get_auth_tenant() OR public.is_super_admin());
DROP POLICY IF EXISTS "Manage own audit logs" ON public.audit_logs;
CREATE POLICY "Manage own audit logs" ON public.audit_logs FOR ALL USING (tenant_id = public.get_auth_tenant() OR public.is_super_admin());
DROP POLICY IF EXISTS "Manage own attendance logs" ON public.attendance_logs;
CREATE POLICY "Manage own attendance logs" ON public.attendance_logs FOR ALL USING (tenant_id = public.get_auth_tenant() OR public.is_super_admin());

-- Subscription ledger policies
DROP POLICY IF EXISTS "Select own subscriptions" ON public.subscriptions;
CREATE POLICY "Select own subscriptions" ON public.subscriptions FOR SELECT USING (tenant_id = public.get_auth_tenant() OR public.is_super_admin());
DROP POLICY IF EXISTS "Select own payments" ON public.subscription_payments;
CREATE POLICY "Select own payments" ON public.subscription_payments FOR SELECT USING (tenant_id = public.get_auth_tenant() OR public.is_super_admin());


-- 13. STORAGE POLICIES (Users can only access/manage files they uploaded)
-- Note: Row Level Security is enabled on storage.objects by default in Supabase.
-- Users cannot alter the storage.objects table itself (as it is owned by supabase_admin).

-- Select policy: User can only read files they uploaded
DROP POLICY IF EXISTS "Users can only select files they uploaded" ON storage.objects;
CREATE POLICY "Users can only select files they uploaded" 
ON storage.objects FOR SELECT TO authenticated 
USING (owner = auth.uid());

-- Insert policy: User can only upload files with their own ID as owner
DROP POLICY IF EXISTS "Users can only upload files they own" ON storage.objects;
CREATE POLICY "Users can only upload files they own" 
ON storage.objects FOR INSERT TO authenticated 
WITH CHECK (owner = auth.uid());

-- Update policy: User can only rename/edit metadata of files they uploaded
DROP POLICY IF EXISTS "Users can only update files they uploaded" ON storage.objects;
CREATE POLICY "Users can only update files they uploaded" 
ON storage.objects FOR UPDATE TO authenticated 
USING (owner = auth.uid()) WITH CHECK (owner = auth.uid());

-- Delete policy: User can only delete files they uploaded
DROP POLICY IF EXISTS "Users can only delete files they uploaded" ON storage.objects;
CREATE POLICY "Users can only delete files they uploaded" 
ON storage.objects FOR DELETE TO authenticated 
USING (owner = auth.uid());


-- 14. MASTER SEED DATA
-- Insert subscription tiers
INSERT INTO public.subscription_plans (name, slug, description, monthly_price, yearly_price, features, is_active, is_popular)
VALUES 
('Starter', 'starter', 'Perfect for small kiosks, tabletop vendors, and micro-shops.', 50.00, 500.00, '["Up to 100 products", "3 staff accounts", "Basic analytics", "MoMo Payments", "Local backup"]', true, false),
('Business', 'business', 'Complete full-scale inventory, advanced sales analytics, and WhatsApp reports for growing shops.', 150.00, 1500.00, '["Unlimited products", "10 staff accounts", "Real-time analytics", "WhatsApp Receipts", "AI Business Assistant", "Low stock predictive alerts"]', true, true),
('Enterprise', 'enterprise', 'Full-spectrum retail system for multi-branch entities with custom reporting.', 450.00, 4500.00, '["Everything in Business", "Unlimited staff and branches", "Multi-branch warehousing", "Excel/PDF ledger reports", "Priority dedicated systems support"]', true, false)
ON CONFLICT (slug) DO UPDATE SET 
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  monthly_price = EXCLUDED.monthly_price,
  yearly_price = EXCLUDED.yearly_price,
  features = EXCLUDED.features;

NOTIFY pgrst, 'reload schema';

COMMIT;
