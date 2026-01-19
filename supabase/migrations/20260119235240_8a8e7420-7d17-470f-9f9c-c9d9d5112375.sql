-- Create NF orders table
CREATE TABLE public.nf_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  delivery_address TEXT NOT NULL,
  quantity INTEGER NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  chat_id UUID REFERENCES public.support_chats(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Diploma orders table
CREATE TABLE public.diploma_orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  cpf TEXT NOT NULL,
  birth_date TEXT NOT NULL,
  course_type TEXT NOT NULL,
  price NUMERIC NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  chat_id UUID REFERENCES public.support_chats(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create Diploma config table
CREATE TABLE public.diploma_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.nf_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diploma_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.diploma_config ENABLE ROW LEVEL SECURITY;

-- NF Orders policies
CREATE POLICY "Users can create their own NF orders" ON public.nf_orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own NF orders" ON public.nf_orders
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage NF orders" ON public.nf_orders
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Diploma Orders policies
CREATE POLICY "Users can create their own diploma orders" ON public.diploma_orders
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own diploma orders" ON public.diploma_orders
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage diploma orders" ON public.diploma_orders
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Diploma Config policies
CREATE POLICY "Anyone can view diploma config" ON public.diploma_config
FOR SELECT USING (true);

CREATE POLICY "Admins can manage diploma config" ON public.diploma_config
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Insert default diploma config
INSERT INTO public.diploma_config (price, is_active) VALUES (500, true);

-- Enable realtime for orders
ALTER PUBLICATION supabase_realtime ADD TABLE public.nf_orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.diploma_orders;