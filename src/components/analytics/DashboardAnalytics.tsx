import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BarChart, Link, TrendingUp, Clock, Users, Activity, ArrowUpRight, Percent, Globe, Calendar, FileText, Zap } from 'lucide-react';
import ClicksOverTimeChart from './ClicksOverTimeChart';
import ReferrerSourcesChart from './ReferrerSourcesChart';
import DeviceAnalyticsChart from './DeviceAnalyticsChart';
import GeographicAnalyticsChart from './GeographicAnalyticsChart';
import ActivityHeatmapChart from './ActivityHeatmapChart';
import PerformanceMetricsCard from './PerformanceMetricsCard';
import ExportableReportCard from './ExportableReportCard';
import LinkPerformanceCard from './LinkPerformanceCard';
import TagAnalyticsCard from './TagAnalyticsCard';
import DeviceAnalyticsCard from './DeviceAnalyticsCard';
import { useRealTimeQuery } from '@/hooks/use-real-time-query';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const DashboardAnalytics = () => {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState('30days');

  // Calculate date range based on selection
  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    
    switch(timeRange) {
      case '7days':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '14days':
        startDate.setDate(endDate.getDate() - 14);
        break;
      case '30days':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90days':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 30);
    }
    
    return { startDate, endDate };
  }, [timeRange]);

  // Fetch all links for the user with caching strategy
  const linksQuery = useQuery({
    queryKey: ['dashboard-links', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
  });
  
  // Add real-time capabilities to the links query
  const { data: links, isLoading: linksLoading } = useRealTimeQuery(linksQuery, {
    table: 'links',
    filter: 'user_id',
    filterValue: user?.id,
  });

  // Fetch all clicks for the user's links with time range filter
  const clicksQuery = useQuery({
    queryKey: ['dashboard-clicks', user?.id, timeRange],
    queryFn: async () => {
      if (!user || !links || links.length === 0) return [];
      
      const linkIds = links.map(link => link.id);
      const { startDate } = dateRange;
      
      const { data, error } = await supabase
        .from('link_clicks')
        .select('*')
        .in('link_id', linkIds)
        .gte('clicked_at', startDate.toISOString())
        .order('clicked_at', { ascending: false });

      if (error) throw error;
      return data || [];
    },
    enabled: !!links && links.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes cache
    cacheTime: 10 * 60 * 1000, // 10 minutes cache
  });
  
  // Add real-time capabilities to the clicks query
  const { data: clicks, isLoading: clicksLoading } = useRealTimeQuery(clicksQuery, {
    table: 'link_clicks',
    event: '*',
  });

  const isLoading = linksLoading || clicksLoading;

  // Calculate summary statistics
  const totalLinks = links?.length || 0;
  const totalClicks = clicks?.length || 0;
  const totalVisits = useMemo(() => {
    if (!clicks) return 0;
    const uniqueIps = new Set(clicks.map(click => click.ip_address));
    return uniqueIps.size;
  }, [clicks]);
  
  // Find top performing link
  const topLink = useMemo(() => {
    if (!links || !clicks) return null;
    
    // Count clicks per link
    const clicksPerLink = {};
    clicks.forEach(click => {
      clicksPerLink[click.link_id] = (clicksPerLink[click.link_id] || 0) + 1;
    });
    
    // Find link with most clicks
    let maxClicks = 0;
    let topLinkId = null;
    
    Object.entries(clicksPerLink).forEach(([linkId, count]) => {
      if (count > maxClicks) {
        maxClicks = count;
        topLinkId = linkId;
      }
    });
    
    const link = links.find(l => l.id === topLinkId);
    return link ? { ...link, click_count: maxClicks } : null;
  }, [links, clicks]);
  
  // Calculate clicks in last 24 hours
  const clicksLast24Hours = useMemo(() => {
    if (!clicks) return 0;
    
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    return clicks.filter(click => {
      const clickDate = new Date(click.clicked_at);
      return clickDate >= yesterday;
    }).length;
  }, [clicks]);
  
  // Calculate conversion rate (clicks / visits)
  const conversionRate = useMemo(() => {
    if (!totalVisits || !totalClicks) return 0;
    return Math.round((totalClicks / totalVisits) * 100);
  }, [totalClicks, totalVisits]);
  
  // Calculate average clicks per day
  const avgClicksPerDay = useMemo(() => {
    if (!clicks || clicks.length === 0) return 0;
    
    const { startDate, endDate } = dateRange;
    const daysDiff = Math.max(1, Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)));
    
    return (clicks.length / daysDiff).toFixed(1);
  }, [clicks, dateRange]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium">Analytics Overview</h2>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7days">Last 7 days</SelectItem>
            <SelectItem value="14days">Last 14 days</SelectItem>
            <SelectItem value="30days">Last 30 days</SelectItem>
            <SelectItem value="90days">Last 90 days</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2 sm:pt-4 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Links</CardTitle>
            <Link className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
            {isLoading ? (
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold">{totalLinks}</div>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Active short links
            </p>
          </CardContent>
        </Card>
        
        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2 sm:pt-4 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Clicks</CardTitle>
            <BarChart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
            {isLoading ? (
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold">{totalClicks}</div>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Total redirects
            </p>
          </CardContent>
        </Card>
        
        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2 sm:pt-4 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Unique Visitors</CardTitle>
            <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
            {isLoading ? (
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold">{totalVisits}</div>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Distinct visitors
            </p>
          </CardContent>
        </Card>
        
        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2 sm:pt-4 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Conversion Rate</CardTitle>
            <Percent className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
            {isLoading ? (
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold">{conversionRate}%</div>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Clicks per visitor
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Click Activity</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            {isLoading ? (
              <div className="h-[200px] sm:h-[300px] flex items-center justify-center">
                <Skeleton className="h-[180px] sm:h-[250px] w-full" />
              </div>
            ) : (
              <ClicksOverTimeChart clickData={clicks || []} title="" />
            )}
          </CardContent>
        </Card>

        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Traffic Sources</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            {isLoading ? (
              <div className="h-[200px] sm:h-[300px] flex items-center justify-center">
                <Skeleton className="h-[180px] sm:h-[250px] w-full" />
              </div>
            ) : (
              <ReferrerSourcesChart clickData={clicks || []} title="" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Top Performing Link</CardTitle>
            <TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            {isLoading ? (
              <Skeleton className="h-[100px] w-full" />
            ) : topLink ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-xl sm:text-2xl font-bold">{topLink.click_count || 0}</div>
                    <p className="text-sm text-muted-foreground truncate max-w-[200px]">
                      /{topLink.slug}
                    </p>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <ArrowUpRight className="h-3 w-3 text-green-500" />
                      <span className="text-green-500 font-medium">Top performer</span>
                    </div>
                  </div>
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  <span className="font-medium">Destination:</span> {topLink.destination_url}
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No link data available
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="text-base sm:text-lg">Device Analytics</CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            {isLoading ? (
              <div className="h-[200px] sm:h-[300px] flex items-center justify-center">
                <Skeleton className="h-[180px] sm:h-[250px] w-full" />
              </div>
            ) : (
              <DeviceAnalyticsChart clickData={clicks || []} title="" />
            )}
          </CardContent>
        </Card>

        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-4 w-4" />
              <span className="text-base sm:text-lg">Geographic Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            {isLoading ? (
              <div className="h-[200px] sm:h-[300px] flex items-center justify-center">
                <Skeleton className="h-[180px] sm:h-[250px] w-full" />
              </div>
            ) : (
              <GeographicAnalyticsChart clickData={clicks || []} title="" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-4 mt-4">
        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="text-base sm:text-lg">Activity Heatmap</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
            {isLoading ? (
              <div className="h-[200px] sm:h-[300px] flex items-center justify-center">
                <Skeleton className="h-[180px] sm:h-[250px] w-full" />
              </div>
            ) : (
              <ActivityHeatmapChart clickData={clicks || []} title="" />
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-4">
        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2 sm:pt-4 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Last 24 Hours</CardTitle>
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
            {isLoading ? (
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold">{clicksLast24Hours}</div>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Recent activity
            </p>
          </CardContent>
        </Card>

        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2 sm:pt-4 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Avg. Clicks/Day</CardTitle>
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
            {isLoading ? (
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold">{avgClicksPerDay}</div>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Daily average
            </p>
          </CardContent>
        </Card>

        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2 sm:pt-4 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Time Range</CardTitle>
            <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
            {isLoading ? (
              <Skeleton className="h-6 sm:h-8 w-12 sm:w-16" />
            ) : (
              <div className="text-xl sm:text-2xl font-bold">
                {timeRange === '7days' ? '7' : 
                 timeRange === '14days' ? '14' : 
                 timeRange === '30days' ? '30' : '90'}
              </div>
            )}
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Days of data
            </p>
          </CardContent>
        </Card>

        <Card className="cosmic-card cosmic-glass">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2 sm:pt-4 sm:px-4">
            <CardTitle className="text-xs sm:text-sm font-medium">Data Freshness</CardTitle>
            <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
            <div className="text-xl sm:text-2xl font-bold">Real-time</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground">
              Live updates
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <PerformanceMetricsCard 
          isLoading={isLoading}
          metrics={[
            {
              label: 'Avg. Load Time',
              value: '0.8s',
              change: -12,
              icon: <Clock className="h-3.5 w-3.5 text-blue-400" />,
              description: 'Average redirect time',
            },
            {
              label: 'Success Rate',
              value: '99.8%',
              change: 0.5,
              icon: <Zap className="h-3.5 w-3.5 text-yellow-400" />,
              description: 'Successful redirects',
            },
            {
              label: 'Global Latency',
              value: '120ms',
              change: -8,
              icon: <Globe className="h-3.5 w-3.5 text-green-400" />,
              description: 'Average global response time',
            },
            {
              label: 'Cache Hit Rate',
              value: '94%',
              change: 6,
              icon: <Activity className="h-3.5 w-3.5 text-purple-400" />,
              description: 'Cache utilization',
            },
          ]}
        />
        
        <LinkPerformanceCard 
          isLoading={isLoading}
          linkData={{
            linkId: 'link-1',
            shortCode: 'promo2023',
            destination: 'https://example.com/special-promotion',
            clicksToday: 145,
            clicksYesterday: 132,
            clicksThisWeek: 876,
            clicksLastWeek: 743,
            conversionRate: 42,
            previousConversionRate: 38
          }}
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <TagAnalyticsCard 
          isLoading={isLoading}
          tags={[
            { name: 'promo', count: 1245, percentage: 42 },
            { name: 'social', count: 876, percentage: 30 },
            { name: 'email', count: 532, percentage: 18 },
            { name: 'blog', count: 298, percentage: 10 }
          ]}
        />
        
        <DeviceAnalyticsCard 
          isLoading={isLoading}
          devices={[
            { type: 'mobile', count: 3245, percentage: 58 },
            { type: 'desktop', count: 1876, percentage: 32 },
            { type: 'tablet', count: 432, percentage: 8 },
            { type: 'tv', count: 98, percentage: 2 }
          ]}
        />
      </div>
      
      <div className="grid grid-cols-1 gap-4 mt-4">
        <ExportableReportCard 
          isLoading={isLoading}
          onExport={(format, timeRange) => {
            console.log(`Exporting ${format} report for ${timeRange}`);
            // Implementation would go here
          }}
        />
      </div>
    </div>
  );
};

export default DashboardAnalytics;