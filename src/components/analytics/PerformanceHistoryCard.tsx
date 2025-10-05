import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Clock } from 'lucide-react';

interface PerformanceHistoryPoint {
  date: string;
  value: number;
}

interface PerformanceHistoryCardProps {
  title?: string;
  metric: string;
  currentValue: string | number;
  change?: number;
  unit?: string;
  description?: string;
  historyData: PerformanceHistoryPoint[];
  isLoading?: boolean;
}

const PerformanceHistoryCard: React.FC<PerformanceHistoryCardProps> = ({
  title = 'Performance History',
  metric,
  currentValue,
  change,
  unit = '',
  description,
  historyData,
  isLoading = false,
}) => {
  // Find min and max values for scaling the chart
  const values = historyData.map(point => point.value);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = maxValue - minValue;
  
  // Function to normalize values to percentage height (0-100)
  const normalizeValue = (value: number) => {
    if (range === 0) return 50; // If all values are the same, show middle height
    return 100 - ((value - minValue) / range * 80 + 10); // 10% padding top and bottom
  };

  return (
    <Card className="cosmic-card cosmic-glass">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-4 w-4" />
          <span className="text-base sm:text-lg">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0 sm:pt-0">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-end gap-2">
              <div className="text-2xl sm:text-3xl font-bold">
                {currentValue}{unit}
              </div>
              {change !== undefined && (
                <span
                  className={`text-xs flex items-center ${change >= 0 ? 'text-green-500' : 'text-red-500'}`}
                >
                  <TrendingUp className={`h-3 w-3 ${change < 0 ? 'rotate-90' : ''}`} />
                  {Math.abs(change)}%
                </span>
              )}
            </div>
            
            {description && (
              <p className="text-xs text-muted-foreground">{description}</p>
            )}
            
            <div className="h-40 relative mt-4">
              {/* Chart background grid */}
              <div className="absolute inset-0 grid grid-cols-1 grid-rows-4">
                {[...Array(4)].map((_, i) => (
                  <div 
                    key={i} 
                    className="border-t border-muted/20"
                    style={{ gridRow: i + 1 }}
                  />
                ))}
              </div>
              
              {/* Line chart */}
              <div className="absolute inset-0 flex items-end">
                <svg className="w-full h-full" preserveAspectRatio="none">
                  {/* Line */}
                  <polyline
                    points={historyData
                      .map((point, index) => {
                        const x = (index / (historyData.length - 1)) * 100;
                        const y = normalizeValue(point.value);
                        return `${x},${y}`;
                      })
                      .join(' ')
                    }
                    className="stroke-primary fill-none stroke-2"
                  />
                  
                  {/* Area under the line */}
                  <polygon
                    points={`
                      0,100 
                      ${historyData
                        .map((point, index) => {
                          const x = (index / (historyData.length - 1)) * 100;
                          const y = normalizeValue(point.value);
                          return `${x},${y}`;
                        })
                        .join(' ')
                      } 
                      100,100
                    `}
                    className="fill-primary/10 stroke-none"
                  />
                  
                  {/* Data points */}
                  {historyData.map((point, index) => {
                    const x = (index / (historyData.length - 1)) * 100;
                    const y = normalizeValue(point.value);
                    return (
                      <circle
                        key={index}
                        cx={`${x}%`}
                        cy={`${y}%`}
                        r="3"
                        className="fill-primary stroke-background stroke-2"
                      />
                    );
                  })}
                </svg>
              </div>
              
              {/* X-axis labels */}
              <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-muted-foreground pt-2">
                {historyData.filter((_, i) => i === 0 || i === Math.floor(historyData.length / 2) || i === historyData.length - 1).map((point, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <Clock className="h-3 w-3 mb-1" />
                    <span>{point.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default PerformanceHistoryCard;