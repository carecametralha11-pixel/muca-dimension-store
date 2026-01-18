-- Remove a foreign key constraint that prevents purchases from being saved
-- when the card is deleted (which is the expected behavior after purchase)
ALTER TABLE public.purchases 
DROP CONSTRAINT IF EXISTS purchases_card_id_fkey;

-- Add a comment explaining why there's no FK
COMMENT ON COLUMN public.purchases.card_id IS 'Reference to original card ID (no FK because cards are deleted after purchase)';