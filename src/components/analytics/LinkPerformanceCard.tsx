import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, ArrowUpRight, ArrowDownRight, Link as LinkIcon } from 'lucide-react';

interface LinkPerformanceData {
  linkId: string;
  shortCode: string;
  destination: string;
  clicksToday: number;
  clicksYesterday: number;
  clicksThisWeek: number;
  clicksLastWeek: number;
  conversionRate: number;
  previousConversionRate: number;
}

interface LinkPerformanceCardProps {
  linkData?: LinkPerformanceData;
  isLoading?: boolean;
}

const LinkPerformanceCard: React.FC<LinkPerformanceCardProps> = ({
  linkData,
  isLoading = false,
}) => {
  if (isLoading || !linkData) {
    return (
      <Card className="cosmic-card cosmic-glass">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2">
            <LinkIcon className="h-4 w-4" />
            <span className="text-base sm:text-lg">Link Performance</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
          <div className="space-y-4">
            <Skeleton className="h-6 w-full" />
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const dailyChange = linkData.clicksToday - linkData.clicksYesterday;
  const dailyChangePercent = linkData.clicksYesterday > 0 
    ? Math.round((dailyChange / linkData.clicksYesterday) * 100) 
    : 100;

  const weeklyChange = linkData.clicksThisWeek - linkData.clicksLastWeek;
  const weeklyChangePercent = linkData.clicksLastWeek > 0 
    ? Math.round((weeklyChange / linkData.clicksLastWeek) * 100) 
    : 100;

  const conversionChange = linkData.conversionRate - linkData.previousConversionRate;

  return (
    <Card className="cosmic-card cosmic-glass">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2">
          <LinkIcon className="h-4 w-4" />
          <span className="text-base sm:text-lg">Link Performance</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="truncate max-w-[70%]">
              <h3 className="text-sm font-medium truncate">{linkData.shortCode}</h3>
              <p className="text-xs text-muted-foreground truncate">{linkData.destination}</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-medium">Conversion:</span>
              <span className="text-xs font-bold">{linkData.conversionRate}%</span>
              {conversionChange !== 0 && (
                <span className={`text-xs ${conversionChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {conversionChange > 0 ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-card/50 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-muted-foreground">Today</span>
                {dailyChange !== 0 && (
                  <span className={`text-xs flex items-center ${dailyChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {dailyChangePercent}%
                    {dailyChange > 0 ? (
                      <ArrowUpRight className="h-3 w-3 ml-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 ml-0.5" />
                    )}
                  </span>
                )}
              </div>
              <div className="text-xl font-bold">{linkData.clicksToday}</div>
              <div className="text-xs text-muted-foreground">vs {linkData.clicksYesterday} yesterday</div>
            </div>

            <div className="bg-card/50 rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <span className="text-xs text-muted-foreground">This Week</span>
                {weeklyChange !== 0 && (
                  <span className={`text-xs flex items-center ${weeklyChange > 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {weeklyChangePercent}%
                    {weeklyChange > 0 ? (
                      <ArrowUpRight className="h-3 w-3 ml-0.5" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 ml-0.5" />
                    )}
                  </span>
                )}
              </div>
              <div className="text-xl font-bold">{linkData.clicksThisWeek}</div>
              <div className="text-xs text-muted-foreground">vs {linkData.clicksLastWeek} last week</div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium">Performance Trend</span>
              <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            </div>
            <div className="h-2 bg-secondary rounded-full mt-2 overflow-hidden">
              <div 
                className="h-full bg-blue-500 rounded-full" 
                style={{ width: `${Math.min(linkData.conversionRate * 2, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default LinkPerformanceCard;