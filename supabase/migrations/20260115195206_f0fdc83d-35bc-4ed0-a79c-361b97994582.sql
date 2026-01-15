-- Enable realtime for pix_payments if not already enabled
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_publication_tables 
        WHERE pubname = 'supabase_realtime' 
        AND tablename = 'pix_payments'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.pix_payments;
    END IF;
END $$;