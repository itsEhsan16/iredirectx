-- Add expires_at column to links table
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS expires_at TIMESTAMP WITH TIME ZONE DEFAULT NULL;

-- Add redirect_rules column to links table (JSON format to store custom redirect rules)
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS redirect_rules JSONB DEFAULT NULL;

-- Create index on expires_at for faster queries
CREATE INDEX IF NOT EXISTS idx_links_expires_at ON public.links(expires_at);

-- Create function to check if a link is expired
CREATE OR REPLACE FUNCTION public.is_link_expired(link_record public.links)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN 
    link_record.expires_at IS NOT NULL AND 
    link_record.expires_at <= NOW();
END;
$$ LANGUAGE plpgsql;

-- Create view for active links (not expired)
CREATE OR REPLACE VIEW public.active_links AS
SELECT *
FROM public.links
WHERE 
  active = true AND
  (expires_at IS NULL OR expires_at > NOW());