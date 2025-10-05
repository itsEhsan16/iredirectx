-- Fix any incorrect click counts by setting them to match actual click records
-- This corrects any double-counting that may have occurred

UPDATE links 
SET click_count = (
    SELECT COALESCE(COUNT(link_clicks.id), 0) 
    FROM link_clicks 
    WHERE link_clicks.link_id = links.id
)
WHERE click_count != (
    SELECT COALESCE(COUNT(link_clicks.id), 0) 
    FROM link_clicks 
    WHERE link_clicks.link_id = links.id
);