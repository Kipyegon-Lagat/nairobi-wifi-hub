-- Fix the infinite recursion issue in RLS policies
-- Drop the problematic policies first
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage service plans" ON public.service_plans;
DROP POLICY IF EXISTS "Admins can manage all customers" ON public.customers;
DROP POLICY IF EXISTS "Admins can manage all subscriptions" ON public.customer_subscriptions;
DROP POLICY IF EXISTS "Admins can manage all invoices" ON public.invoices;
DROP POLICY IF EXISTS "Admins can manage all invoice items" ON public.invoice_items;
DROP POLICY IF EXISTS "Admins can manage all payments" ON public.payments;
DROP POLICY IF EXISTS "Admins can manage all usage logs" ON public.usage_logs;
DROP POLICY IF EXISTS "Admins can manage system settings" ON public.system_settings;
DROP POLICY IF EXISTS "Admins can manage all notifications" ON public.notifications;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Create new non-recursive policies using the security definer function
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can manage service plans" ON public.service_plans FOR ALL USING (
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can manage all customers" ON public.customers FOR ALL USING (
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can manage all subscriptions" ON public.customer_subscriptions FOR ALL USING (
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can manage all invoices" ON public.invoices FOR ALL USING (
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can manage all invoice items" ON public.invoice_items FOR ALL USING (
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can manage all usage logs" ON public.usage_logs FOR ALL USING (
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can manage system settings" ON public.system_settings FOR ALL USING (
  public.is_admin(auth.uid())
);

CREATE POLICY "Admins can manage all notifications" ON public.notifications FOR ALL USING (
  public.is_admin(auth.uid())
);

-- Update the user who signed up to be an admin
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'kipyegonlagat04@gmail.com';