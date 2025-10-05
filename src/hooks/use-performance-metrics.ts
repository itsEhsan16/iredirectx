import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import cache from '@/utils/cache';

export interface PerformanceMetric {
  label: string;
  value: string | number;
  change?: number;
  icon?: React.ReactNode;
  description?: string;
}

export interface PerformanceHistoryPoint {
  date: string;
  value: number;
}

export interface PerformanceData {
  redirectMetrics: PerformanceMetric[];
  databaseMetrics: PerformanceMetric[];
  apiMetrics: PerformanceMetric[];
  systemMetrics: PerformanceMetric[];
  redirectHistory: PerformanceHistoryPoint[];
  cacheHitHistory: PerformanceHistoryPoint[];
  apiResponseHistory: PerformanceHistoryPoint[];
  recommendations: string[];
}

const CACHE_KEY = 'performance_metrics';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export const usePerformanceMetrics = () => {
  const [activeTab, setActiveTab] = useState<string>('redirect');

  // Fetch performance metrics data with caching
  const { data, isLoading, error, refetch } = useQuery<PerformanceData>(
    ['performanceMetrics'],
    async () => {
      // Check cache first
      const cachedData = cache.get<PerformanceData>(CACHE_KEY);
      if (cachedData) {
        return cachedData;
      }

      // In a real app, fetch from Supabase
      // For demo, we'll simulate the data
      const data = await fetchPerformanceMetrics();
      
      // Store in cache
      cache.set(CACHE_KEY, data, CACHE_TTL);
      
      return data;
    },
    {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: false,
    }
  );

  return {
    data,
    isLoading,
    error,
    activeTab,
    setActiveTab,
    refetch,
  };
};

// Simulate fetching performance metrics
async function fetchPerformanceMetrics(): Promise<PerformanceData> {
  // In a real app, this would be a Supabase query
  // For now, we'll return mock data
  
  // Generate last 7 days for history data
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  });

  // Generate random history data with a trend
  const generateHistory = (baseValue: number, variance: number, trend: number) => {
    return last7Days.map((date, i) => ({
      date,
      value: baseValue + (Math.random() * variance - variance / 2) + (trend * i),
    }));
  };

  // Simulate a delay
  await new Promise(resolve => setTimeout(resolve, 500));

  return {
    redirectMetrics: [
      {
        label: 'Avg. Redirect Time',
        value: '0.8s',
        change: -12,
        description: 'Average time to redirect',
      },
      {
        label: 'Cache Hit Rate',
        value: '94%',
        change: 6,
        description: 'Percentage of cached redirects',
      },
      {
        label: 'Success Rate',
        value: '99.8%',
        change: 0.5,
        description: 'Successful redirects',
      },
      {
        label: 'Global Latency',
        value: '120ms',
        change: -8,
        description: 'Average global response time',
      },
    ],
    databaseMetrics: [
      {
        label: 'Query Time',
        value: '45ms',
        change: -15,
        description: 'Average database query time',
      },
      {
        label: 'Connection Pool',
        value: '85%',
        change: 5,
        description: 'Connection pool utilization',
      },
      {
        label: 'Cache Hit Ratio',
        value: '92%',
        change: 8,
        description: 'Database cache efficiency',
      },
      {
        label: 'Index Usage',
        value: '98%',
        change: 2,
        description: 'Index utilization rate',
      },
    ],
    apiMetrics: [
      {
        label: 'Response Time',
        value: '110ms',
        change: -10,
        description: 'Average API response time',
      },
      {
        label: 'Success Rate',
        value: '99.9%',
        change: 0.2,
        description: 'API call success rate',
      },
      {
        label: 'Error Rate',
        value: '0.1%',
        change: -0.2,
        description: 'API error percentage',
      },
      {
        label: 'Throughput',
        value: '850/min',
        change: 12,
        description: 'Requests per minute',
      },
    ],
    systemMetrics: [
      {
        label: 'CPU Usage',
        value: '35%',
        change: -5,
        description: 'Server CPU utilization',
      },
      {
        label: 'Memory Usage',
        value: '42%',
        change: 3,
        description: 'Server memory utilization',
      },
      {
        label: 'Disk I/O',
        value: '28%',
        change: -8,
        description: 'Disk read/write activity',
      },
      {
        label: 'Network',
        value: '65%',
        change: 10,
        description: 'Network bandwidth usage',
      },
    ],
    // Historical data for charts
    redirectHistory: generateHistory(800, 200, -20), // Trending down (improving)
    cacheHitHistory: generateHistory(85, 10, 1.5),   // Trending up (improving)
    apiResponseHistory: generateHistory(120, 30, -5), // Trending down (improving)
    recommendations: [
      'Implement database query caching to reduce load times',
      'Consider Redis caching for frequently accessed data',
      'Optimize database indexes for common query patterns',
      'Deploy edge caching for global performance improvements',
    ],
  };
}