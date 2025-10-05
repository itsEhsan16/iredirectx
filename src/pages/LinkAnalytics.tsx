import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Loader2 } from 'lucide-react';
import ClicksOverTimeChart from '@/components/analytics/ClicksOverTimeChart';
import ReferrerSourcesChart from '@/components/analytics/ReferrerSourcesChart';
import DeviceAnalyticsChart from '@/components/analytics/DeviceAnalyticsChart';
import AnalyticsSummary from '@/components/analytics/AnalyticsSummary';
import ExportAnalytics from '@/components/analytics/ExportAnalytics';
import { useRealTimeQuery } from '@/hooks/use-real-time-query';
import ThemeToggle from '@/components/ThemeToggle';

const LinkAnalytics = () => {
  const { id } = useParams<{ id: string }>();
  const [timeRange, setTimeRange] = useState<30 | 90 | 365>(30);

  // Fetch link data
  const linkQuery = useQuery({
    queryKey: ['link', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
  });
  
  // Add real-time capabilities to the link query
  const { data: linkData, isLoading: linkLoading, error: linkError } = useRealTimeQuery(linkQuery, {
    table: 'links',
    filter: 'id',
    filterValue: id,
  });

  // Fetch click data
  const clickQuery = useQuery({
    queryKey: ['clicks', id, timeRange],
    queryFn: async () => {
      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      startDate.setDate(now.getDate() - timeRange);

      const { data, error } = await supabase
        .from('link_clicks')
        .select('*')
        .eq('link_id', id)
        .gte('clicked_at', startDate.toISOString())
        .order('clicked_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!linkData,
  });
  
  // Add real-time capabilities to the click query
  const { data: clickData, isLoading: clickLoading, error: clickError } = useRealTimeQuery(clickQuery, {
    table: 'link_clicks',
    filter: 'link_id',
    filterValue: id,
  });

  const isLoading = linkLoading || clickLoading;
  const error = linkError || clickError;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !linkData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold">Error Loading Analytics</h1>
          <p className="text-muted-foreground">{error?.message || 'Link not found'}</p>
          <Button asChild>
            <Link to="/dashboard/links">Back to Links</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background cosmic-grid">
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild className="h-8 sm:h-9 px-2 sm:px-3">
              <Link to="/dashboard/links" className="flex items-center gap-1 sm:gap-2">
                <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                <span className="text-sm sm:text-base">Back to Links</span>
              </Link>
            </Button>
            <div>
              <h1 className="text-lg sm:text-xl font-semibold">{linkData.title || linkData.slug}</h1>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Link Analytics
              </p>
            </div>
          </div>
          <ThemeToggle variant="switch" size="sm" />
        </div>
      </header>

      <main className="container px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">{linkData.title || linkData.slug}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground break-all">
              {window.location.origin}/{linkData.slug} → {linkData.destination_url}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-3 sm:mt-0 w-full sm:w-auto">
            <div className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto justify-between sm:justify-start">
              <Button 
                variant={timeRange === 30 ? "default" : "outline"}
                onClick={() => setTimeRange(30)}
                size="sm"
                className="text-xs h-7 sm:h-8 px-2 sm:px-3 flex-1 sm:flex-none"
              >
                30 Days
              </Button>
              <Button 
                variant={timeRange === 90 ? "default" : "outline"}
                onClick={() => setTimeRange(90)}
                size="sm"
                className="text-xs h-7 sm:h-8 px-2 sm:px-3 flex-1 sm:flex-none"
              >
                90 Days
              </Button>
              <Button 
                variant={timeRange === 365 ? "default" : "outline"}
                onClick={() => setTimeRange(365)}
                size="sm"
                className="text-xs h-7 sm:h-8 px-2 sm:px-3 flex-1 sm:flex-none"
              >
                1 Year
              </Button>
            </div>
            <div className="mt-2 sm:mt-0 w-full sm:w-auto">
              <ExportAnalytics linkData={linkData} clickData={clickData || []} />
            </div>
          </div>
        </div>

        <AnalyticsSummary linkData={linkData} clickData={clickData || []} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <ClicksOverTimeChart clickData={clickData || []} days={timeRange} />
          <ReferrerSourcesChart clickData={clickData || []} />
        </div>

        <DeviceAnalyticsChart clickData={clickData || []} />
      </main>
    </div>
  );
};

export default LinkAnalytics;