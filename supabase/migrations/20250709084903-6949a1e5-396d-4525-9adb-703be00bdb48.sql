-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('admin', 'customer', 'technician');
CREATE TYPE plan_type AS ENUM ('residential', 'business', 'enterprise');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_method AS ENUM ('mpesa', 'bank_transfer', 'cash', 'card');

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  phone text,
  role user_role DEFAULT 'customer',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create service plans table
CREATE TABLE public.service_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  description text,
  type plan_type NOT NULL,
  speed_mbps integer NOT NULL,
  data_limit_gb integer, -- NULL means unlimited
  monthly_price decimal(10,2) NOT NULL,
  setup_fee decimal(10,2) DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create customers table
CREATE TABLE public.customers (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_code text UNIQUE NOT NULL,
  business_name text,
  address text NOT NULL,
  location_coordinates point,
  installation_date date,
  status text DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'disconnected')),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create customer subscriptions table
CREATE TABLE public.customer_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE,
  plan_id uuid REFERENCES public.service_plans(id) ON DELETE RESTRICT,
  start_date date NOT NULL,
  end_date date,
  is_active boolean DEFAULT true,
  monthly_discount decimal(10,2) DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create invoices table
CREATE TABLE public.invoices (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE,
  invoice_number text UNIQUE NOT NULL,
  billing_period_start date NOT NULL,
  billing_period_end date NOT NULL,
  subtotal decimal(10,2) NOT NULL,
  tax_amount decimal(10,2) DEFAULT 0,
  discount_amount decimal(10,2) DEFAULT 0,
  total_amount decimal(10,2) NOT NULL,
  status invoice_status DEFAULT 'draft',
  due_date date NOT NULL,
  issued_date date DEFAULT CURRENT_DATE,
  paid_date date,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create invoice items table
CREATE TABLE public.invoice_items (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  description text NOT NULL,
  quantity integer DEFAULT 1,
  unit_price decimal(10,2) NOT NULL,
  amount decimal(10,2) NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

-- Create payments table
CREATE TABLE public.payments (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_id uuid REFERENCES public.invoices(id) ON DELETE CASCADE,
  payment_reference text UNIQUE NOT NULL,
  amount decimal(10,2) NOT NULL,
  method payment_method NOT NULL,
  status payment_status DEFAULT 'pending',
  mpesa_receipt_number text,
  transaction_date timestamp with time zone DEFAULT now(),
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create usage logs table
CREATE TABLE public.usage_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE,
  date date NOT NULL,
  data_used_mb bigint DEFAULT 0,
  session_duration_minutes integer DEFAULT 0,
  peak_speed_mbps decimal(8,2),
  created_at timestamp with time zone DEFAULT now()
);

-- Create system settings table
CREATE TABLE public.system_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  key text UNIQUE NOT NULL,
  value text NOT NULL,
  description text,
  category text DEFAULT 'general',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid REFERENCES public.customers(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('payment_reminder', 'payment_received', 'service_alert', 'general')),
  title text NOT NULL,
  message text NOT NULL,
  is_read boolean DEFAULT false,
  sent_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for service plans (public read, admin write)
CREATE POLICY "Anyone can view active service plans" ON public.service_plans FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage service plans" ON public.service_plans FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for customers
CREATE POLICY "Customers can view their own data" ON public.customers FOR SELECT USING (
  user_id = auth.uid()
);
CREATE POLICY "Admins can manage all customers" ON public.customers FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for customer subscriptions
CREATE POLICY "Customers can view their own subscriptions" ON public.customer_subscriptions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all subscriptions" ON public.customer_subscriptions FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for invoices
CREATE POLICY "Customers can view their own invoices" ON public.invoices FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all invoices" ON public.invoices FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for invoice items
CREATE POLICY "Customers can view their own invoice items" ON public.invoice_items FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    JOIN public.customers c ON i.customer_id = c.id
    WHERE i.id = invoice_id AND c.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage all invoice items" ON public.invoice_items FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for payments
CREATE POLICY "Customers can view their own payments" ON public.payments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.invoices i
    JOIN public.customers c ON i.customer_id = c.id
    WHERE i.id = invoice_id AND c.user_id = auth.uid()
  )
);
CREATE POLICY "Admins can manage all payments" ON public.payments FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for usage logs
CREATE POLICY "Customers can view their own usage" ON public.usage_logs FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all usage logs" ON public.usage_logs FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for system settings (admin only)
CREATE POLICY "Admins can manage system settings" ON public.system_settings FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create RLS policies for notifications
CREATE POLICY "Customers can view their own notifications" ON public.notifications FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id AND user_id = auth.uid())
);
CREATE POLICY "Customers can update their own notifications" ON public.notifications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.customers WHERE id = customer_id AND user_id = auth.uid())
);
CREATE POLICY "Admins can manage all notifications" ON public.notifications FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'customer')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user registration
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description, category) VALUES
('company_name', 'Nairobi WiFi Solutions', 'Company name for invoices and communications', 'company'),
('company_address', 'Nairobi, Kenya', 'Company address', 'company'),
('company_phone', '+254700000000', 'Company phone number', 'company'),
('company_email', 'info@nairobiwifi.com', 'Company email address', 'company'),
('tax_rate', '16', 'VAT tax rate percentage', 'billing'),
('late_fee_percentage', '5', 'Late payment fee percentage', 'billing'),
('grace_period_days', '7', 'Grace period before suspension', 'billing'),
('mpesa_shortcode', '174379', 'M-Pesa paybill shortcode', 'payments'),
('mpesa_passkey', '', 'M-Pesa API passkey', 'payments'),
('sms_api_key', '', 'SMS service API key', 'notifications'),
('email_smtp_host', '', 'SMTP host for email', 'notifications'),
('email_smtp_port', '587', 'SMTP port for email', 'notifications'),
('email_username', '', 'SMTP username', 'notifications'),
('email_password', '', 'SMTP password', 'notifications');

-- Insert sample service plans
INSERT INTO public.service_plans (name, description, type, speed_mbps, data_limit_gb, monthly_price, setup_fee) VALUES
('Basic Home', 'Perfect for light browsing and social media', 'residential', 10, 50, 2500.00, 1000.00),
('Premium Home', 'Great for streaming and multiple devices', 'residential', 25, 100, 4500.00, 1500.00),
('Unlimited Home', 'No limits, perfect for heavy users', 'residential', 50, NULL, 7500.00, 2000.00),
('Small Business', 'Reliable connection for small offices', 'business', 30, 200, 8000.00, 3000.00),
('Enterprise', 'High-speed dedicated connection', 'enterprise', 100, NULL, 25000.00, 10000.00);