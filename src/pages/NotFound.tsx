import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link2Off } from "lucide-react";
import SEO from "@/components/SEO";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  // Check if the path might be a link slug
  const isLinkSlug = location.pathname.split('/').length === 2 && location.pathname.length > 1;

  return (
    <div className="min-h-screen flex items-center justify-center bg-background cosmic-grid">
      <SEO 
        title="404 - Page Not Found | iRedirectX"
        description="The page you are looking for does not exist or has been moved."
        noIndex={true}
      />
      <div className="text-center space-y-6 max-w-md p-8 rounded-lg border border-border bg-card/80 backdrop-blur-sm">
        <div className="mx-auto w-16 h-16 rounded-full bg-muted flex items-center justify-center">
          <Link2Off className="h-8 w-8 text-muted-foreground" />
        </div>
        <h1 className="text-4xl font-bold">404</h1>
        {isLinkSlug ? (
          <>
            <p className="text-xl text-muted-foreground">This link doesn't exist or has been deactivated</p>
            <p className="text-sm text-muted-foreground">The link you're trying to access is either invalid, has been removed, or is currently inactive.</p>
          </>
        ) : (
          <p className="text-xl text-muted-foreground">Oops! Page not found</p>
        )}
        <div className="pt-4">
          <Button asChild variant="default">
            <Link to="/">Return to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
