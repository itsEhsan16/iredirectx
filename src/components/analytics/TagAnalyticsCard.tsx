import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tag, BarChart } from 'lucide-react';

interface TagData {
  name: string;
  count: number;
  percentage: number;
}

interface TagAnalyticsCardProps {
  tags: TagData[];
  isLoading?: boolean;
  title?: string;
}

const TagAnalyticsCard: React.FC<TagAnalyticsCardProps> = ({
  tags = [],
  isLoading = false,
  title = 'Tag Analytics',
}) => {
  // Sort tags by count in descending order
  const sortedTags = [...tags].sort((a, b) => b.count - a.count);
  
  return (
    <Card className="cosmic-card cosmic-glass">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2">
          <Tag className="h-4 w-4" />
          <span className="text-base sm:text-lg">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {Array(5)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
          </div>
        ) : sortedTags.length > 0 ? (
          <div className="space-y-4">
            {sortedTags.map((tag, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{tag.name}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium">{tag.count}</span>
                    <span className="text-xs text-muted-foreground">{tag.percentage}%</span>
                  </div>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary/70 rounded-full" 
                    style={{ width: `${tag.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <BarChart className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No tags data available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add tags to your links to see analytics
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TagAnalyticsCard;