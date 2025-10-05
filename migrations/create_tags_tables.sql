-- Create tags table
CREATE TABLE IF NOT EXISTS public.tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Create link_tags junction table
CREATE TABLE IF NOT EXISTS public.link_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID NOT NULL REFERENCES public.links(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(link_id, tag_id)
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_tags_user_id ON public.tags(user_id);
CREATE INDEX IF NOT EXISTS idx_link_tags_link_id ON public.link_tags(link_id);
CREATE INDEX IF NOT EXISTS idx_link_tags_tag_id ON public.link_tags(tag_id);

-- Enable RLS for tags
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;

-- Create policies for tags
CREATE POLICY "Users can view their own tags" 
ON public.tags 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tags" 
ON public.tags 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tags" 
ON public.tags 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tags" 
ON public.tags 
FOR DELETE 
USING (auth.uid() = user_id);

-- Enable RLS for link_tags
ALTER TABLE public.link_tags ENABLE ROW LEVEL SECURITY;

-- Create policies for link_tags
CREATE POLICY "Users can view their own link tags" 
ON public.link_tags 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.links 
    WHERE links.id = link_tags.link_id 
    AND links.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create their own link tags" 
ON public.link_tags 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.links 
    WHERE links.id = link_tags.link_id 
    AND links.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete their own link tags" 
ON public.link_tags 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.links 
    WHERE links.id = link_tags.link_id 
    AND links.user_id = auth.uid()
  )
);

-- Create trigger for updating timestamps
CREATE TRIGGER update_tags_updated_at
  BEFORE UPDATE ON public.tags
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();