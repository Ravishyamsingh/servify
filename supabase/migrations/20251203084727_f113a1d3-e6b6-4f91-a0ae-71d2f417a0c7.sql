-- Create roles enum
CREATE TYPE public.app_role AS ENUM ('admin', 'vendor', 'customer');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    role app_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    UNIQUE (user_id, role)
);

-- Create profiles table
CREATE TABLE public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    full_name TEXT,
    email TEXT,
    phone TEXT,
    avatar_url TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    language_preference TEXT DEFAULT 'en',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create service_categories table
CREATE TABLE public.service_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT,
    icon TEXT,
    color TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create services table
CREATE TABLE public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID REFERENCES public.service_categories(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    base_price DECIMAL(10,2),
    estimated_duration TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create vendors table
CREATE TABLE public.vendors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
    business_name TEXT,
    description TEXT,
    service_categories UUID[] DEFAULT '{}',
    hourly_rate DECIMAL(10,2),
    service_radius_km INTEGER DEFAULT 10,
    address TEXT,
    city TEXT,
    state TEXT,
    pincode TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    is_verified BOOLEAN DEFAULT false,
    is_available BOOLEAN DEFAULT true,
    kyc_status TEXT DEFAULT 'pending',
    kyc_documents JSONB DEFAULT '{}',
    rating DECIMAL(3,2) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    total_jobs INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bookings table
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE SET NULL,
    service_id UUID REFERENCES public.services(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'pending',
    issue_description TEXT,
    issue_images TEXT[] DEFAULT '{}',
    ai_diagnosis JSONB,
    estimated_cost DECIMAL(10,2),
    final_cost DECIMAL(10,2),
    scheduled_date DATE,
    scheduled_time TIME,
    address TEXT,
    city TEXT,
    pincode TEXT,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    payment_status TEXT DEFAULT 'pending',
    payment_id TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create reviews table
CREATE TABLE public.reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL UNIQUE,
    customer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    vendor_id UUID REFERENCES public.vendors(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create repair_history table (blockchain-like immutable logs)
CREATE TABLE public.repair_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    hash TEXT NOT NULL,
    previous_hash TEXT,
    device_type TEXT,
    issue TEXT,
    work_performed TEXT,
    parts_replaced TEXT[],
    warranty_period TEXT,
    vendor_id UUID REFERENCES public.vendors(id),
    customer_id UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.repair_history ENABLE ROW LEVEL SECURITY;

-- Security definer function to check roles
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, email)
  VALUES (NEW.id, NEW.raw_user_meta_data ->> 'full_name', NEW.email);
  
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, COALESCE((NEW.raw_user_meta_data ->> 'role')::app_role, 'customer'));
  
  RETURN NEW;
END;
$$;

-- Trigger to auto-create profile on signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON public.vendors FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS Policies

-- User roles: users can read their own roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Profiles: users can manage their own profile
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Public profiles viewable" ON public.profiles FOR SELECT USING (true);

-- Service categories: public read
CREATE POLICY "Anyone can view categories" ON public.service_categories FOR SELECT USING (true);

-- Services: public read
CREATE POLICY "Anyone can view services" ON public.services FOR SELECT USING (true);

-- Vendors: public read, vendors can update own
CREATE POLICY "Anyone can view vendors" ON public.vendors FOR SELECT USING (true);
CREATE POLICY "Vendors can update own profile" ON public.vendors FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Vendors can insert own profile" ON public.vendors FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Bookings: customers see their bookings, vendors see assigned bookings
CREATE POLICY "Customers can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Vendors can view assigned bookings" ON public.bookings FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vendors WHERE vendors.id = bookings.vendor_id AND vendors.user_id = auth.uid())
);
CREATE POLICY "Customers can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Customers can update own bookings" ON public.bookings FOR UPDATE USING (auth.uid() = customer_id);
CREATE POLICY "Vendors can update assigned bookings" ON public.bookings FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.vendors WHERE vendors.id = bookings.vendor_id AND vendors.user_id = auth.uid())
);

-- Reviews: public read, customers can create
CREATE POLICY "Anyone can view reviews" ON public.reviews FOR SELECT USING (true);
CREATE POLICY "Customers can create reviews" ON public.reviews FOR INSERT WITH CHECK (auth.uid() = customer_id);

-- Repair history: customers and vendors can view their records
CREATE POLICY "Customers can view own repair history" ON public.repair_history FOR SELECT USING (auth.uid() = customer_id);
CREATE POLICY "Vendors can view their repair history" ON public.repair_history FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.vendors WHERE vendors.id = repair_history.vendor_id AND vendors.user_id = auth.uid())
);

-- Insert default service categories
INSERT INTO public.service_categories (name, slug, description, icon, color) VALUES
('Electronics', 'electronics', 'Mobile, laptop, tablet, and gadget repairs', 'Smartphone', 'blue'),
('Vehicles', 'vehicles', 'Car, bike, and auto repairs', 'Car', 'orange'),
('Home Appliances', 'home-appliances', 'AC, fridge, washing machine repairs', 'Home', 'green'),
('Plumbing', 'plumbing', 'Pipe, tap, and water system repairs', 'Droplet', 'cyan'),
('Electrical', 'electrical', 'Wiring, switches, and electrical repairs', 'Zap', 'yellow'),
('Carpentry', 'carpentry', 'Furniture and woodwork services', 'Hammer', 'brown');

-- Insert sample services
INSERT INTO public.services (category_id, name, description, base_price, estimated_duration) 
SELECT id, 'Mobile Screen Repair', 'Screen replacement and repair', 1500.00, '1-2 hours' FROM public.service_categories WHERE slug = 'electronics';
INSERT INTO public.services (category_id, name, description, base_price, estimated_duration) 
SELECT id, 'Laptop Service', 'General laptop maintenance and repair', 800.00, '2-3 hours' FROM public.service_categories WHERE slug = 'electronics';
INSERT INTO public.services (category_id, name, description, base_price, estimated_duration) 
SELECT id, 'AC Repair', 'AC servicing and gas refill', 500.00, '1-2 hours' FROM public.service_categories WHERE slug = 'home-appliances';
INSERT INTO public.services (category_id, name, description, base_price, estimated_duration) 
SELECT id, 'Bike Service', 'Complete bike servicing', 400.00, '2-3 hours' FROM public.service_categories WHERE slug = 'vehicles';