import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Smartphone, Laptop, Tablet, Monitor, HelpCircle } from 'lucide-react';

interface DeviceData {
  type: 'mobile' | 'desktop' | 'tablet' | 'tv' | 'other';
  count: number;
  percentage: number;
}

interface DeviceAnalyticsCardProps {
  devices: DeviceData[];
  isLoading?: boolean;
  title?: string;
}

const DeviceAnalyticsCard: React.FC<DeviceAnalyticsCardProps> = ({
  devices = [],
  isLoading = false,
  title = 'Device Analytics',
}) => {
  // Sort devices by count in descending order
  const sortedDevices = [...devices].sort((a, b) => b.count - a.count);
  
  const getDeviceIcon = (type: string) => {
    switch (type) {
      case 'mobile':
        return <Smartphone className="h-4 w-4 text-blue-400" />;
      case 'desktop':
        return <Laptop className="h-4 w-4 text-green-400" />;
      case 'tablet':
        return <Tablet className="h-4 w-4 text-purple-400" />;
      case 'tv':
        return <Monitor className="h-4 w-4 text-yellow-400" />;
      default:
        return <HelpCircle className="h-4 w-4 text-gray-400" />;
    }
  };

  const getDeviceName = (type: string) => {
    switch (type) {
      case 'mobile':
        return 'Mobile';
      case 'desktop':
        return 'Desktop';
      case 'tablet':
        return 'Tablet';
      case 'tv':
        return 'TV/Console';
      default:
        return 'Other';
    }
  };
  
  return (
    <Card className="cosmic-card cosmic-glass">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2">
          <Smartphone className="h-4 w-4" />
          <span className="text-base sm:text-lg">{title}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 sm:p-6 pt-0 sm:pt-0">
        {isLoading ? (
          <div className="space-y-4">
            {Array(4)
              .fill(0)
              .map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-2 w-full" />
                  </div>
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
          </div>
        ) : sortedDevices.length > 0 ? (
          <div className="space-y-4">
            {sortedDevices.map((device, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10">
                  {getDeviceIcon(device.type)}
                </div>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{getDeviceName(device.type)}</span>
                    <span className="text-xs font-medium">{device.percentage}%</span>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{
                        width: `${device.percentage}%`,
                        background: device.type === 'mobile' ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' :
                                  device.type === 'desktop' ? 'linear-gradient(90deg, #10b981, #34d399)' :
                                  device.type === 'tablet' ? 'linear-gradient(90deg, #8b5cf6, #a78bfa)' :
                                  device.type === 'tv' ? 'linear-gradient(90deg, #f59e0b, #fbbf24)' :
                                  'linear-gradient(90deg, #6b7280, #9ca3af)'
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Smartphone className="h-8 w-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">No device data available</p>
            <p className="text-xs text-muted-foreground mt-1">
              Device analytics will appear as links are clicked
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeviceAnalyticsCard;