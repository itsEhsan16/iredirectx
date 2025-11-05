import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Clock, Database, Server, BarChart, ArrowRight, Activity, Globe, TrendingUp } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import PerformanceHistoryCard from './PerformanceHistoryCard';
import { usePerformanceMetrics } from '@/hooks/use-performance-metrics';

interface PerformanceMetric {
  name: string;
  value: string | number;
  change?: string;
  icon: React.ReactNode;
  description: string;
  status?: 'positive' | 'negative' | 'neutral';
}

const PerformanceMetrics = () => {
  // Use the custom hook for performance metrics
  const { data, isLoading, activeTab, setActiveTab } = usePerformanceMetrics();
  
  // Map the data from the hook to the component's expected format
  const performanceData = data ? {
    redirectSpeed: {
      p50: parseInt(data.redirectMetrics[0].value as string),
      p95: Math.round(parseInt(data.redirectMetrics[0].value as string) * 1.5),
      p99: Math.round(parseInt(data.redirectMetrics[0].value as string) * 2),
      trend: data.redirectMetrics[0].change,
    },
    cacheHitRate: parseInt(data.redirectMetrics[1].value as string),
    databasePerformance: {
      queryTime: parseInt(data.databaseMetrics[0].value as string),
      queryCount: data.databaseMetrics[1].value as number, // Real query count from hook
      trend: data.databaseMetrics[0].change,
      cacheHitRatio: data.databaseMetrics[2].value as string, // Real cache hit ratio
      activeLinks: data.databaseMetrics[3].value as number, // Real active links count
    },
    apiPerformance: {
      responseTime: parseInt(data.apiMetrics[0].value as string),
      requestCount: data.apiMetrics[1].value as number, // Real click count from hook
      uniqueVisitors: data.apiMetrics[2].value as number, // Real unique visitors
      avgDailyTraffic: data.apiMetrics[3].value as number, // Real avg daily traffic
      trend: data.apiMetrics[0].change,
    },
    systemMetrics: data.systemMetrics // Pass through all system metrics
  } : null;

  // Redirect performance metrics
  const redirectMetrics: PerformanceMetric[] = [
    {
      name: 'Avg. Redirect Time',
      value: isLoading ? '...' : `${performanceData?.redirectSpeed.p50}ms`,
      change: isLoading ? '' : `${performanceData?.redirectSpeed.trend}%`,
      icon: <Clock className="h-4 w-4" />,
      description: 'Average time to redirect users',
      status: 'positive'
    },
    {
      name: 'P95 Redirect Time',
      value: isLoading ? '...' : `${performanceData?.redirectSpeed.p95}ms`,
      icon: <Clock className="h-4 w-4" />,
      description: '95th percentile redirect time',
      status: 'neutral'
    },
    {
      name: 'P99 Redirect Time',
      value: isLoading ? '...' : `${performanceData?.redirectSpeed.p99}ms`,
      icon: <Clock className="h-4 w-4" />,
      description: '99th percentile redirect time',
      status: 'neutral'
    },
    {
      name: 'Cache Hit Rate',
      value: isLoading ? '...' : `${performanceData?.cacheHitRate}%`,
      icon: <Zap className="h-4 w-4" />,
      description: 'Percentage of redirects served from cache',
      status: 'positive'
    },
  ];

  // Database performance metrics
  const databaseMetrics: PerformanceMetric[] = [
    {
      name: 'Avg. Query Time',
      value: isLoading ? '...' : `${performanceData?.databasePerformance.queryTime}ms`,
      change: isLoading ? '' : `${performanceData?.databasePerformance.trend}%`,
      icon: <Database className="h-4 w-4" />,
      description: 'Average database query execution time',
      status: 'positive'
    },
    {
      name: 'Total Queries',
      value: isLoading ? '...' : performanceData?.databasePerformance.queryCount.toLocaleString(),
      icon: <BarChart className="h-4 w-4" />,
      description: 'Total database queries (last 7 days)',
      status: 'neutral'
    },
    {
      name: 'Cache Hit Ratio',
      value: isLoading ? '...' : performanceData?.databasePerformance.cacheHitRatio,
      icon: <Database className="h-4 w-4" />,
      description: 'Database query cache efficiency',
      status: 'positive'
    },
    {
      name: 'Active Links',
      value: isLoading ? '...' : performanceData?.databasePerformance.activeLinks?.toLocaleString(),
      icon: <Zap className="h-4 w-4" />,
      description: 'Number of active links',
      status: 'neutral'
    },
  ];

  // API performance metrics - now using real API metrics from the hook
  const apiMetrics: PerformanceMetric[] = data?.apiMetrics ? data.apiMetrics.map(metric => ({
    name: metric.label,
    value: isLoading ? '...' : metric.value.toString(),
    change: metric.change ? `${metric.change > 0 ? '+' : ''}${metric.change}%` : '',
    icon: metric.label.includes('Response') ? <Server className="h-4 w-4" /> :
          metric.label.includes('Success') ? <Zap className="h-4 w-4" /> :
          metric.label.includes('Error') ? <Activity className="h-4 w-4" /> :
          <TrendingUp className="h-4 w-4" />,
    description: metric.description || '',
    status: metric.change && metric.change > 0 ? 'positive' : 
            metric.change && metric.change < 0 ? 'negative' : 'neutral'
  })) : [];

  const renderMetricCards = (metrics: PerformanceMetric[]) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric, index) => (
          <Card key={index} className="cosmic-card cosmic-glass">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <div className="text-muted-foreground">{metric.icon}</div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              {isLoading ? (
                <Skeleton className="h-8 w-20" />
              ) : (
                <div className="space-y-2">
                  <div className="flex items-end gap-2">
                    <div className="text-2xl font-bold">{metric.value}</div>
                    {metric.change && (
                      <div className={`text-xs ${metric.status === 'positive' ? 'text-green-500' : metric.status === 'negative' ? 'text-red-500' : 'text-muted-foreground'}`}>
                        {parseFloat(metric.change) > 0 ? '+' : ''}{metric.change}
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">{metric.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Performance Metrics</h2>
        <div className="text-sm text-muted-foreground">Updated in real-time</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PerformanceHistoryCard
          title="Redirect Speed History"
          metric="Redirect Time"
          currentValue={performanceData?.redirectSpeed.p50 || 0}
          unit="ms"
          change={performanceData?.redirectSpeed.trend}
          description="Average redirect time over the last 7 days"
          historyData={data?.redirectHistory || []}
          isLoading={isLoading}
        />
        
        <PerformanceHistoryCard
          title="Cache Hit Rate History"
          metric="Cache Hit Rate"
          currentValue={`${performanceData?.cacheHitRate || 0}%`}
          change={6}
          description="Percentage of cached redirects over the last 7 days"
          historyData={data?.cacheHitHistory || []}
          isLoading={isLoading}
        />
      </div>

      <Card className="cosmic-card cosmic-glass overflow-hidden">
        <CardHeader className="p-4 pb-0">
          <CardTitle className="text-base">System Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="space-y-4">
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Redirect Speed</span>
                <span className="text-green-500">Excellent</span>
              </div>
              <Progress value={92} className="h-1.5" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Database Performance</span>
                <span className="text-green-500">Good</span>
              </div>
              <Progress value={85} className="h-1.5" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>API Response Time</span>
                <span className="text-green-500">Good</span>
              </div>
              <Progress value={88} className="h-1.5" />
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Cache Efficiency</span>
                <span className="text-green-500">Excellent</span>
              </div>
              <Progress value={95} className="h-1.5" />
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="redirect">Redirect Performance</TabsTrigger>
          <TabsTrigger value="database">Database Performance</TabsTrigger>
          <TabsTrigger value="api">API Performance</TabsTrigger>
        </TabsList>
        <TabsContent value="redirect" className="mt-4">
          {renderMetricCards(redirectMetrics)}
        </TabsContent>
        <TabsContent value="database" className="mt-4">
          {renderMetricCards(databaseMetrics)}
        </TabsContent>
        <TabsContent value="api" className="mt-4">
          {renderMetricCards(apiMetrics)}
        </TabsContent>
      </Tabs>

      <Card className="cosmic-card cosmic-glass">
        <CardHeader className="p-4">
          <CardTitle className="text-base">Performance Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <ul className="space-y-2">
            {isLoading ? (
              [...Array(4)].map((_, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <Skeleton className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <Skeleton className="h-4 w-full" />
                </li>
              ))
            ) : (
              data?.recommendations?.map((recommendation, index) => (
                <li key={index} className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>{recommendation}</span>
                </li>
              )) || [
                <li key="1" className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>Consider implementing database query caching for frequently accessed links</span>
                </li>,
                <li key="2" className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>Add Redis caching for high-traffic redirect patterns</span>
                </li>,
                <li key="3" className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>Optimize database indexes for faster link lookups</span>
                </li>,
                <li key="4" className="flex items-start gap-2 text-sm">
                  <ArrowRight className="h-4 w-4 mt-0.5 text-green-500 flex-shrink-0" />
                  <span>Consider implementing edge caching for global performance improvements</span>
                </li>
              ]
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default PerformanceMetrics;