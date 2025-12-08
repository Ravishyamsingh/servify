-- Create vendor_locations table for real-time tracking
CREATE TABLE public.vendor_locations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  vendor_id UUID NOT NULL REFERENCES public.vendors(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  latitude NUMERIC NOT NULL,
  longitude NUMERIC NOT NULL,
  accuracy INTEGER,
  heading NUMERIC,
  speed NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for efficient queries
CREATE INDEX idx_vendor_locations_vendor_id ON public.vendor_locations(vendor_id);
CREATE INDEX idx_vendor_locations_booking_id ON public.vendor_locations(booking_id);
CREATE INDEX idx_vendor_locations_created_at ON public.vendor_locations(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.vendor_locations ENABLE ROW LEVEL SECURITY;

-- Vendors can insert their own location
CREATE POLICY "Vendors can insert own location"
ON public.vendor_locations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.vendors
    WHERE vendors.id = vendor_id
    AND vendors.user_id = auth.uid()
  )
);

-- Vendors can view their own location history
CREATE POLICY "Vendors can view own locations"
ON public.vendor_locations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.vendors
    WHERE vendors.id = vendor_id
    AND vendors.user_id = auth.uid()
  )
);

-- Customers can view vendor location for their bookings
CREATE POLICY "Customers can view vendor location for their bookings"
ON public.vendor_locations
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.bookings
    WHERE bookings.id = booking_id
    AND bookings.customer_id = auth.uid()
  )
);

-- Enable realtime for vendor_locations
ALTER PUBLICATION supabase_realtime ADD TABLE public.vendor_locations;