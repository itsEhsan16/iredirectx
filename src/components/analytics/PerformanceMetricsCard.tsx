import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Clock, ArrowUpRight } from 'lucide-react';

interface PerformanceMetric {
  label: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode;
  description: string;
}

interface PerformanceMetricsCardProps {
  metrics: PerformanceMetric[];
  isLoading?: boolean;
  title?: string;
}

const PerformanceMetricsCard: React.FC<PerformanceMetricsCardProps> = ({
  metrics,
  isLoading = false,
  title = 'Performance Metrics',
}) => {
  return (
    <Card className="cosmic-card cosmic-glass">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-4 w-4" />
          <span className="text-base sm:text-lg">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {isLoading
            ? Array(4)
                .fill(0)
                .map((_, i) => (
                  <div key={i} className="flex flex-col space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                ))
            : metrics.map((metric, index) => (
                <div key={index} className="flex flex-col space-y-1">
                  <div className="flex items-center gap-1.5">
                    {metric.icon}
                    <span className="text-xs sm:text-sm font-medium">{metric.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl sm:text-2xl font-bold">{metric.value}</span>
                    {metric.change !== undefined && (
                      <span
                        className={`text-xs flex items-center ${metric.change >= 0 ? 'text-green-500' : 'text-red-500'}`}
                      >
                        <ArrowUpRight className={`h-3 w-3 ${metric.change < 0 ? 'rotate-90' : ''}`} />
                        {Math.abs(metric.change)}%
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] sm:text-xs text-muted-foreground">
                    {metric.description}
                  </p>
                </div>
              ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PerformanceMetricsCard;