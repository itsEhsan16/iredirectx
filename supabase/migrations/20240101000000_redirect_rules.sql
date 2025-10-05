-- Create redirect_rules table
CREATE TABLE IF NOT EXISTS redirect_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
  condition_type TEXT NOT NULL,
  condition_value TEXT,
  redirect_url TEXT NOT NULL,
  priority INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS redirect_rules_link_id_idx ON redirect_rules(link_id);

-- Add RLS policies
ALTER TABLE redirect_rules ENABLE ROW LEVEL SECURITY;

-- Policy for selecting redirect rules (only the owner of the link can see them)
CREATE POLICY redirect_rules_select_policy ON redirect_rules
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = redirect_rules.link_id
      AND links.user_id = auth.uid()
    )
  );

-- Policy for inserting redirect rules (only the owner of the link can add them)
CREATE POLICY redirect_rules_insert_policy ON redirect_rules
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = redirect_rules.link_id
      AND links.user_id = auth.uid()
    )
  );

-- Policy for updating redirect rules (only the owner of the link can update them)
CREATE POLICY redirect_rules_update_policy ON redirect_rules
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = redirect_rules.link_id
      AND links.user_id = auth.uid()
    )
  );

-- Policy for deleting redirect rules (only the owner of the link can delete them)
CREATE POLICY redirect_rules_delete_policy ON redirect_rules
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM links
      WHERE links.id = redirect_rules.link_id
      AND links.user_id = auth.uid()
    )
  );