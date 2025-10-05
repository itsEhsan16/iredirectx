import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import cache from '@/utils/cache';

interface LinkData {
  id: string;
  destination_url: string;
  active: boolean;
  [key: string]: any;
}

interface RedirectRule {
  id: string;
  link_id: string;
  condition_type: string;
  condition_value: string;
  redirect_url: string;
  priority: number;
  active: boolean;
  [key: string]: any;
}

interface UseCachedRedirectResult {
  link: LinkData | null;
  redirectRules: RedirectRule[] | null;
  loading: boolean;
  error: string | null;
  trackClick: (linkId: string) => Promise<void>;
}

/**
 * Hook for fetching and caching redirect data
 * @param slug The link slug to redirect to
 * @param cacheTtl Time to live for cache in seconds (default: 1 hour)
 */
export function useCachedRedirect(slug: string | undefined, cacheTtl: number = 3600): UseCachedRedirectResult {
  const [link, setLink] = useState<LinkData | null>(null);
  const [redirectRules, setRedirectRules] = useState<RedirectRule[] | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRedirectData = async () => {
      if (!slug) {
        setError('No slug provided');
        setLoading(false);
        return;
      }

      try {
        // Check cache first for link data
        const cacheKey = `redirect_${slug}`;
        const cachedData = cache.get<{ link: LinkData; redirectRules: RedirectRule[] }>(cacheKey);

        if (cachedData) {
          console.log('Using cached redirect data for:', slug);
          setLink(cachedData.link);
          setRedirectRules(cachedData.redirectRules);
          setLoading(false);
          return;
        }

        // If not in cache, fetch from API
        console.log('Fetching redirect data for:', slug);
        
        // Use a single query to fetch both link and its rules in one database call
        // This reduces the number of round trips to the database
        const { data: linkData, error: linkError } = await supabase
          .from('links')
          .select(`
            *,
            redirect_rules:redirect_rules(*)  
          `)
          .eq('slug', slug)
          .eq('active', true)
          .single();

        if (linkError || !linkData) {
          setError('Link not found or inactive');
          setLoading(false);
          return;
        }
        
        // Extract and sort the redirect rules
        const rulesData = linkData.redirect_rules ? 
          [...linkData.redirect_rules].sort((a, b) => a.priority - b.priority) : 
          [];
        
        // Remove the nested redirect_rules from linkData to maintain the expected structure
        const { redirect_rules, ...linkDataWithoutRules } = linkData;
        
        // No need to check for rulesError as we're using a single query now

        // Store in state
        setLink(linkDataWithoutRules);
        setRedirectRules(rulesData || []);
        
        // Store in cache
        cache.set(cacheKey, {
          link: linkDataWithoutRules,
          redirectRules: rulesData || []
        }, cacheTtl);
        
        setLoading(false);
      } catch (err) {
        console.error('Redirect data fetch error:', err);
        setError('An error occurred during redirect');
        setLoading(false);
      }
    };

    fetchRedirectData();
  }, [slug, cacheTtl]);

  // Function to track clicks
  const trackClick = async (linkId: string) => {
    try {
      // Track the click - the database trigger will automatically increment the click_count
      const { error: clickError } = await supabase
        .from('link_clicks')
        .insert({
          link_id: linkId,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null,
        });

      if (clickError) {
        console.error('Error tracking click:', clickError);
      }

      // Note: click_count is automatically incremented by the database trigger
      // No manual increment needed
    } catch (error) {
      console.error('Error in trackClick:', error);
    }
  };

  return { link, redirectRules, loading, error, trackClick };
}