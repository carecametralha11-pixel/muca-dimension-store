-- Create consultavel pricing tiers table
CREATE TABLE public.consultavel_pricing_tiers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  limit_amount INTEGER NOT NULL UNIQUE,
  price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consultavel_pricing_tiers ENABLE ROW LEVEL SECURITY;

-- Anyone can view active pricing tiers
CREATE POLICY "Anyone can view active pricing tiers"
  ON public.consultavel_pricing_tiers
  FOR SELECT
  USING (is_active = true);

-- Admins can manage pricing tiers
CREATE POLICY "Admins can manage pricing tiers"
  ON public.consultavel_pricing_tiers
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Create consultavel requests table to track when users request
CREATE TABLE public.consultavel_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  tier_id UUID REFERENCES public.consultavel_pricing_tiers(id),
  limit_amount INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  chat_id UUID REFERENCES public.support_chats(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.consultavel_requests ENABLE ROW LEVEL SECURITY;

-- Users can create their own requests
CREATE POLICY "Users can create their own requests"
  ON public.consultavel_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own requests
CREATE POLICY "Users can view their own requests"
  ON public.consultavel_requests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Admins can view all requests
CREATE POLICY "Admins can manage requests"
  ON public.consultavel_requests
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Enable realtime for requests
ALTER PUBLICATION supabase_realtime ADD TABLE public.consultavel_requests;

-- Add updated_at trigger
CREATE TRIGGER update_consultavel_pricing_tiers_updated_at
  BEFORE UPDATE ON public.consultavel_pricing_tiers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_consultavel_requests_updated_at
  BEFORE UPDATE ON public.consultavel_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some default tiers
INSERT INTO public.consultavel_pricing_tiers (limit_amount, price, display_order) VALUES
  (1000, 50, 1),
  (2000, 100, 2),
  (3000, 150, 3),
  (5000, 250, 4),
  (10000, 500, 5);