-- Allow admins to delete chats
CREATE POLICY "Admins can delete chats"
ON public.support_chats FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Allow admins to delete their own messages
CREATE POLICY "Admins can delete their own messages"
ON public.support_messages FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role) AND sender_type = 'admin');

-- Create ban_messages table for storing custom ban messages
CREATE TABLE public.ban_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message TEXT NOT NULL DEFAULT 'Você foi banido do sistema.',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ban_messages ENABLE ROW LEVEL SECURITY;

-- Policies for ban_messages
CREATE POLICY "Admins can manage ban messages"
ON public.ban_messages FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view active ban messages"
ON public.ban_messages FOR SELECT
USING (is_active = true);

-- Insert default ban message
INSERT INTO public.ban_messages (message) VALUES ('Você foi banido permanentemente deste sistema. Seu acesso foi revogado.');

-- Enable realtime for profiles to detect bans instantly
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;