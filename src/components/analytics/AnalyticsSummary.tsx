import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Activity, Users, Clock } from 'lucide-react';

interface ClickData {
  clicked_at: string;
  id: string;
  link_id: string;
  referrer: string | null;
  user_agent: string | null;
}

interface LinkData {
  id: string;
  slug: string;
  destination_url: string;
  title: string | null;
  description: string | null;
  active: boolean;
  click_count: number;
  created_at: string;
}

interface AnalyticsSummaryProps {
  linkData: LinkData;
  clickData: ClickData[];
}

const AnalyticsSummary: React.FC<AnalyticsSummaryProps> = ({ linkData, clickData }) => {
  // Calculate summary statistics
  const totalClicks = clickData.length;
  const uniqueReferrers = new Set(
    clickData
      .filter(click => click.referrer)
      .map(click => {
        try {
          return new URL(click.referrer || '').hostname;
        } catch {
          return click.referrer;
        }
      })
  ).size;

  // Calculate unique visitors (approximation based on user agent)
  const uniqueVisitors = new Set(
    clickData.map(click => click.user_agent)
  ).size;

  // Calculate average clicks per day
  const calculateAvgClicksPerDay = () => {
    if (clickData.length === 0) return 0;
    
    const dates = clickData.map(click => 
      new Date(click.clicked_at).toISOString().split('T')[0]
    );
    const uniqueDates = new Set(dates);
    
    return uniqueDates.size > 0 ? (totalClicks / uniqueDates.size).toFixed(1) : 0;
  };

  const avgClicksPerDay = calculateAvgClicksPerDay();

  return (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2 sm:pt-4 sm:px-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Total Clicks</CardTitle>
          <BarChart className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">{totalClicks}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Since {new Date(linkData.created_at).toLocaleDateString()}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2 sm:pt-4 sm:px-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Unique Visitors</CardTitle>
          <Users className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">{uniqueVisitors}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Based on user agents
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2 sm:pt-4 sm:px-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Referrers</CardTitle>
          <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">{uniqueReferrers}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Traffic sources
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-3 sm:pb-2 sm:pt-4 sm:px-4">
          <CardTitle className="text-xs sm:text-sm font-medium">Avg. Clicks/Day</CardTitle>
          <Clock className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent className="p-3 pt-0 sm:p-4 sm:pt-0">
          <div className="text-xl sm:text-2xl font-bold">{avgClicksPerDay}</div>
          <p className="text-[10px] sm:text-xs text-muted-foreground">
            Daily average
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsSummary;