import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import SEO from '@/components/SEO';
import { useCachedRedirect } from '@/hooks/use-cached-redirect';
import { evaluateRedirectRules } from '@/utils/redirect-rules';

const Redirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [linkTitle, setLinkTitle] = useState<string>('Redirecting...');
  const hasTracked = useRef(false);
  
  // Use our cached redirect hook
  const { link, redirectRules, loading, error, trackClick } = useCachedRedirect(slug);

  useEffect(() => {
    const redirectToDestination = async () => {
      if (loading) return;
      
      if (error) {
        // Error is already set by the hook
        return;
      }
      
      if (!link) return;
      
      // Prevent double tracking in development mode or multiple effect runs
      if (hasTracked.current) return;
      hasTracked.current = true;
      
      try {
        // Set the link title if available
        if (link.title) {
          setLinkTitle(link.title);
        }
        
        // Check if any rules apply
        if (redirectRules && redirectRules.length > 0) {
          const matchedRule = evaluateRedirectRules(redirectRules);
          
          if (matchedRule && matchedRule.redirect_url) {
            // Track the click
            await trackClick(link.id);
            
            // Redirect to the rule's URL instead
            window.location.href = matchedRule.redirect_url;
            return;
          }
        }

        // Track the click for the default redirect
        await trackClick(link.id);

        // Redirect to destination URL
        window.location.href = link.destination_url;
      } catch (err) {
        console.error('Redirect error:', err);
      }
    };

    redirectToDestination();
  }, [loading, error, link, redirectRules]);
  
  // No need for these functions anymore as they're moved to separate utilities

  // If there's an error, we'll handle it in the return statement below
  // and show a proper error UI with a button to go to homepage

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background">
      <SEO 
        title={linkTitle}
        description="Redirecting you to your destination..."
        noIndex={true}
      />
      {loading ? (
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <h1 className="text-2xl font-bold mb-2">Redirecting you...</h1>
          <p className="text-muted-foreground">Please wait while we take you to your destination</p>
        </div>
      ) : error ? (
        <div className="text-center">
          <div className="h-12 w-12 mx-auto mb-4 text-destructive">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold mb-2">Link Error</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Go to Homepage
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default Redirect;