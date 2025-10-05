import React from 'react';
import PerformanceMetricsCard from './PerformanceMetricsCard';
import { Zap, Clock, Globe, ArrowUpRight } from 'lucide-react';

const PerformanceMetricsDemo: React.FC = () => {
  // Sample metrics data
  const performanceMetrics = [
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
      icon: <ArrowUpRight className="h-3.5 w-3.5 text-purple-400" />,
      description: 'Cache utilization',
    },
  ];

  return <PerformanceMetricsCard metrics={performanceMetrics} />;
};

export default PerformanceMetricsDemo;