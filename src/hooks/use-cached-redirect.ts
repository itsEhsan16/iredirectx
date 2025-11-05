import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import cache from '@/utils/cache';
import { getDeviceInfo } from '@/utils/device-detection';

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
        
        // Fetch link data
        const { data: linkData, error: linkError } = await supabase
          .from('links')
          .select('*')
          .eq('slug', slug)
          .eq('active', true)
          .single();

        if (linkError || !linkData) {
          setError('Link not found or inactive');
          setLoading(false);
          return;
        }
        
        // Fetch redirect rules for this link
        const { data: rulesData, error: rulesError } = await supabase
          .from('redirect_rules')
          .select('*')
          .eq('link_id', linkData.id)
          .eq('active', true)
          .order('priority', { ascending: true });

        if (rulesError) {
          console.error('Error fetching redirect rules:', rulesError);
        }

        // Store in state
        setLink(linkData);
        setRedirectRules(rulesData || []);
        
        // Store in cache
        cache.set(cacheKey, {
          link: linkData,
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

  // Function to track clicks with enhanced analytics
  const trackClick = async (linkId: string) => {
    try {
      // Get device information from user agent
      const deviceInfo = getDeviceInfo(navigator.userAgent);
      
      // Parse UTM parameters from URL
      const urlParams = new URLSearchParams(window.location.search);
      const utmParams = {
        utm_source: urlParams.get('utm_source'),
        utm_medium: urlParams.get('utm_medium'),
        utm_campaign: urlParams.get('utm_campaign'),
        utm_term: urlParams.get('utm_term'),
        utm_content: urlParams.get('utm_content'),
      };
      
      // Track the click with enhanced data
      const { error: clickError } = await supabase
        .from('link_clicks')
        .insert({
          link_id: linkId,
          referrer: document.referrer || null,
          user_agent: navigator.userAgent || null,
          device_type: deviceInfo.type,
          browser: deviceInfo.browser,
          browser_version: deviceInfo.browserVersion,
          os: deviceInfo.os,
          os_version: deviceInfo.osVersion,
          ...utmParams,
        });

      if (clickError) {
        console.error('Error tracking click:', clickError);
      }

      // Note: click_count is automatically incremented by the database trigger
    } catch (error) {
      console.error('Error in trackClick:', error);
    }
  };

  return { link, redirectRules, loading, error, trackClick };
}