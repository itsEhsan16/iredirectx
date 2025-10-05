import React, { useEffect, useState, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Link as RouterLink, useParams, useNavigate } from 'react-router-dom';
// Import lazy-loaded component
import { LazyCustomRedirectRules } from '@/components/LazyComponents';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import ThemeToggle from '@/components/ThemeToggle';

interface Link {
  id: string;
  slug: string;
  destination_url: string;
  short_url: string;
}

// Loading fallback component
const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <Loader2 className="h-8 w-8 animate-spin text-primary" />
    <span className="ml-2">Loading redirect rules...</span>
  </div>
);

const CustomRedirectRulesPage = () => {
  const { user, signOut } = useAuth();
  const { linkId } = useParams<{ linkId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [link, setLink] = useState<Link | null>(null);
  const [loading, setLoading] = useState(linkId ? true : false);
  
  useEffect(() => {
    if (linkId) {
      fetchLinkDetails();
    }
  }, [linkId]);
  
  const fetchLinkDetails = async () => {
    try {
      const { data, error } = await supabase
        .from('links')
        .select('id, slug, destination_url, short_url')
        .eq('id', linkId)
        .single();
        
      if (error) throw error;
      
      if (data) {
        setLink(data as Link);
      }
    } catch (error: any) {
      console.error('Error fetching link details:', error);
      toast({
        title: 'Error',
        description: 'Could not fetch link details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <RouterLink to="/" className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            iRedirectX
          </RouterLink>
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <span className="text-sm text-muted-foreground text-center sm:text-left">
              Welcome, {user?.email}
            </span>
            <ThemeToggle variant="switch" size="sm" />
            <Button variant="outline" onClick={handleSignOut} className="w-full sm:w-auto">
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">
              {linkId ? 'Link Redirect Rules' : 'Custom Redirect Rules'}
            </h1>
            <p className="text-muted-foreground">
              {linkId 
                ? loading 
                  ? 'Loading link details...' 
                  : link 
                    ? `Configure redirect rules for ${link.short_url}` 
                    : 'Link not found'
                : 'Create advanced redirect rules with conditions'}
            </p>
          </div>
          <Button asChild variant="outline">
            <RouterLink to={linkId ? "/dashboard/links" : "/dashboard"}>
              Back to {linkId ? 'Links' : 'Dashboard'}
            </RouterLink>
          </Button>
        </div>

        {linkId && loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading link details...</span>
          </div>
        ) : linkId && !link ? (
          <div className="text-center py-12">
            <p className="text-lg text-muted-foreground">Link not found. Please check the URL and try again.</p>
            <Button 
              variant="outline" 
              className="mt-4" 
              onClick={() => navigate('/dashboard/links')}
            >
              Return to Links
            </Button>
          </div>
        ) : (
          <div className="bg-card border border-border rounded-lg p-6">
            {linkId && link && (
              <div className="mb-6 p-4 border rounded-lg bg-muted/50">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Short URL</p>
                    <p className="text-base">{link.short_url}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Destination URL</p>
                    <p className="text-base truncate">{link.destination_url}</p>
                  </div>
                </div>
              </div>
            )}
            <Suspense fallback={<LoadingFallback />}>
              <LazyCustomRedirectRules linkId={linkId} />
            </Suspense>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomRedirectRulesPage;