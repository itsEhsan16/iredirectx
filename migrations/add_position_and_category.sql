-- Add position and category columns to links table
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS position INTEGER DEFAULT 0;
ALTER TABLE public.links ADD COLUMN IF NOT EXISTS category TEXT DEFAULT NULL;

-- Create index on position for faster queries
CREATE INDEX IF NOT EXISTS idx_links_position ON public.links(position);

-- Create index on category for faster queries
CREATE INDEX IF NOT EXISTS idx_links_category ON public.links(category);