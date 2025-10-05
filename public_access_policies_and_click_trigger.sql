-- Public read policy for active links (needed for unauthenticated redirects)
ALTER TABLE links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can view active links by slug"
  ON links FOR SELECT
  USING (active = true);

-- Allow anonymous to insert click records for tracking
ALTER TABLE link_clicks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can insert click events"
  ON link_clicks FOR INSERT
  WITH CHECK (true);

-- Optional: allow reading your own clicks if needed
CREATE POLICY "Public can read clicks for active links"
  ON link_clicks FOR SELECT
  USING (link_id IN (SELECT id FROM links WHERE active = true));

-- Trigger: automatically increment links.click_count when a click is inserted
CREATE OR REPLACE FUNCTION inc_link_click_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE links SET click_count = COALESCE(click_count, 0) + 1
  WHERE id = NEW.link_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_inc_link_click_count ON link_clicks;
CREATE TRIGGER trg_inc_link_click_count
AFTER INSERT ON link_clicks
FOR EACH ROW EXECUTE FUNCTION inc_link_click_count();
