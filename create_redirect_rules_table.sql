-- Create the redirect_rules table
CREATE TABLE redirect_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    link_id UUID NOT NULL REFERENCES links(id) ON DELETE CASCADE,
    condition_type VARCHAR(50) NOT NULL, -- e.g., 'device', 'location', 'time', 'referrer'
    condition_value TEXT NOT NULL, -- the value to match against (e.g., 'mobile', 'US', '09:00-17:00')
    redirect_url TEXT NOT NULL, -- the URL to redirect to when condition is met
    priority INTEGER NOT NULL DEFAULT 0, -- lower number = higher priority
    active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create indexes for better performance
CREATE INDEX idx_redirect_rules_link_id ON redirect_rules(link_id);
CREATE INDEX idx_redirect_rules_active ON redirect_rules(active);
CREATE INDEX idx_redirect_rules_priority ON redirect_rules(priority);

-- Enable RLS
ALTER TABLE redirect_rules ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view redirect rules for their links" ON redirect_rules
    FOR SELECT USING (
        link_id IN (
            SELECT id FROM links WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert redirect rules for their links" ON redirect_rules
    FOR INSERT WITH CHECK (
        link_id IN (
            SELECT id FROM links WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update redirect rules for their links" ON redirect_rules
    FOR UPDATE USING (
        link_id IN (
            SELECT id FROM links WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete redirect rules for their links" ON redirect_rules
    FOR DELETE USING (
        link_id IN (
            SELECT id FROM links WHERE user_id = auth.uid()
        )
    );

-- Add a policy for public access to redirect rules for active links
-- This is needed for the redirect page to work without authentication
CREATE POLICY "Public can view redirect rules for active links" ON redirect_rules
    FOR SELECT USING (
        active = true AND
        link_id IN (
            SELECT id FROM links WHERE active = true
        )
    );

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_redirect_rules_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_redirect_rules_updated_at
    BEFORE UPDATE ON redirect_rules
    FOR EACH ROW
    EXECUTE FUNCTION update_redirect_rules_updated_at();